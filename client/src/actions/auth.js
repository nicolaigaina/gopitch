import axios from "axios";
import { browserHistory } from "react-router";
import cookie from "react-cookie";
import { API_URL, CLIENT_ROOT_URL, errorHandler } from "./index";
import {
  AUTH_USER,
  AUTH_ERROR,
  UNAUTH_USER,
  FORGOT_PASSWORD_REQUEST,
  RESET_PASSWORD_REQUEST,
  PROTECTED_TEST
} from "./types";

//= ===============================
// Authentication actions
//= ===============================
export function signoutUser(error) {
  return function(dispatch) {
    dispatch({ type: UNAUTH_USER, payload: error || "" });
    cookie.remove("token", { path: "/" });
    cookie.remove("user", { path: "/" });

    window.location.href = `${CLIENT_ROOT_URL}/signin`;
  };
}

export function signinUser({ email, password }) {
  return function(dispatch) {
    axios.post(`${API_URL}/auth/signin`, { email, password }).then(response => {
      cookie.save("token", response.data.token, { path: "/" });
      cookie.save("user", response.data.user, { path: "/" });
      dispatch({
        type: AUTH_USER
      });
      window.location.href = `${CLIENT_ROOT_URL}/dashboard`;
    });
  };
}

export function signupUser({ email, password, firstName, lastName }) {
  return function(dispatch) {
    axios.post(`${API_URL}/auth/signup`, { email, password, firstName, lastName }).then(response => {
      cookie.save("token", response.data.token, { path: "/" });
      cookie.save("user", response.data.user, { path: "/" });
      dispatch({
        type: AUTH_USER
      });
      window.location.href = `${CLIENT_ROOT_URL}/dashboard`;
    });
  };
}

export function getForgotPasswordToken({ email }){
  return function(dispatch){
    axios.post(`${API_URL}/auth/forgot-password`, { email }).then(response => {
      dispatch({
        type: FORGOT_PASSWORD_REQUEST,
        payload: response.data.message
      });
    })
    .catch(error => {
      errorHandler(dispatch, error.response, AUTH_ERROR);
    })
  }
}

export function resetPassword(token, { password }){
  return function(dispatch){
    axios.post(`${API_URL}/auth/reset-password/${token}`, { password }).then(response => {
      dispatch({
        type: RESET_PASSWORD_REQUEST,
        payload: response.data.message
      });
      // Redirect to signin page on successfull password reset
    })
    .catch(error => {
      errorHandler(dispatch, error.response, AUTH_ERROR);
    })
  }
}

export function protectedTest() {
  return function(dispatch) {
    axios
      .get(`${API_URL}/protected`, {
        headers: { Authorization: cookie.load("token") }
      })
      .then(response => {
        dispatch({
          type: PROTECTED_TEST,
          payload: response.data.content
        });
      })
      .catch(error => {
        errorHandler(dispatch, error.response, AUTH_ERROR);
      });
  };
}
