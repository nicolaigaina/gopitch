"use strict";

const jwt = require("jsonwebtoken"),
  crypto = require("crypto"),
  User = require("../models/user"),
  config = require("../config/keys"),
  setUserInfo = require('../helpers').setUserInfo,
  getRole = require('../helpers').getRole;

function generateToken(user) {
  return jwt.sign(user, config.localSecret, {
    expiresIn: 604800 // seconds
  });
}

// ==========================
// Signin Route
// ==========================
module.exports.signin = function(req, res, next) {
  let userInfo = setUserInfo(req.user);

  res.status(200).json({
    token: "JWT" + generateToken(userInfo),
    user: userInfo
  });
};

// ==========================
// Signup Route
// ==========================
module.exports.signup = function(req, res, next) {
  const { body } = req;
  const { email } = body;
  const { firstName } = body;
  const { lastName } = body;
  const { password } = body;

  // Return Error if No Email Provided
  if (!email) {
    return res.status(422).send({ error: "Email is required." });
  }

  // Return Error if No Full Name Provided
  if (!firstName || !lastName) {
    return res
      .status(422)
      .send({ error: "Firstname and Lastname is required." });
  }

  // Return Error if No Password Provided
  if (!password) {
    return res.status(422).send({ error: "Password is required." });
  }

  User.findOne({ email }, (err, existingUser) => {
    if (err) {
      return next(err);
    }

    // If a User is Not Unique -> return Error
    if (existingUser) {
      return res
        .status(422)
        .send({ error: "This Email Address is already in use." });
    }

    // If email is unique and password was provided, create account
    const user = new User({
      email,
      password,
      profile: { firstName, lastName }
    });

    user.save((err, user) => {
      if (err) {
        return next(err);
      }

      // Subscribe member to Mailchimp list
      // mailchimp.subscribeToNewsletter(user.email);

      // Respond with JWT if user was created

      const userInfo = setUserInfo(user);

      res.status(201).json({
        token: `JWT ${generateToken(userInfo)}`,
        user: userInfo
      });
    });
  });
};

// ==========================
// Authorization Middleware
// ==========================
module.exports.roleAuthorization = function(role) {
  return (req, res, next) => {
    const { user } = req;

    User.findById(user._id, (err, foundUser) => {
      if (err) {
        res.status(422).json({ error: "No user was found" });
      }

      // If user is found -> check role
      if (foundUser.role === role) {
        return next();
      }

      res
        .status(401)
        .json({ error: "You are not authorized to view this content." });
      return next("Unauthorized");
    });
  };
};
