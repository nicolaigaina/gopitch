"use strict";

const jwt = require("jsonwebtoken"),
  crypto = require("crypto"),
  User = require("../models/user"),
  config = require("../config/keys"),
  setUserInfo = require("../helpers").setUserInfo,
  getRole = require("../helpers").getRole,
  mailgun = require("../services/mailgun");

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

//= =======================================
// Forgot Password Route
//= =======================================

module.exports.forgotPassword = function(req, res, next) {
  const email = req.body.email;

  User.findOne({ email }, (err, existingUser) => {
    // If user is not found, return error
    if (err || existingUser == null) {
      res.status(422).json({
        error:
          "Your request could not be processed as entered. Please try again."
      });
      return next(err);
    }

    // If user is found, generate and save resetToken

    // Generate a token with Crypto
    crypto.randomBytes(48, (err, buffer) => {
      const resetToken = buffer.toString("hex");
      if (err) {
        return next(err);
      }

      existingUser.resetPasswordToken = resetToken;
      existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

      existingUser.save(err => {
        // If error in saving token, return it
        if (err) {
          return next(err);
        }

        const message = {
          subject: "Reset Password",
          text:
            `${"You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
              "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
              "http://"}${req.headers.host}/reset-password/${resetToken}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        // Otherwise, send user email via Mailgun
        mailgun.sendEmail(existingUser.email, message); 

        return res.status(200).json({
          message:
            "Please check your email for the link to reset your password."
        });
      });
    });
  });
};

//= =======================================
// Reset Password Route
//= =======================================

module.exports.verifyToken = function(req, res, next) {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    (err, resetUser) => {
      // If query returned no results, token expired or was invalid. Return error.
      if (!resetUser) {
        res
          .status(422)
          .json({
            error:
              "Your token has expired. Please attempt to reset your password again."
          });
      }

      // Otherwise, save new password and clear resetToken from database
      resetUser.password = req.body.password;
      resetUser.resetPasswordToken = undefined;
      resetUser.resetPasswordExpires = undefined;

      resetUser.save(err => {
        if (err) {
          return next(err);
        }

        // If password change saved successfully, alert user via email
        const message = {
          subject: "Password Changed",
          text:
            "You are receiving this email because you changed your password. \n\n" +
            "If you did not request this change, please contact us immediately."
        };

        // Otherwise, send user email confirmation of password change via Mailgun
        mailgun.sendEmail(resetUser.email, message); 

        return res
          .status(200)
          .json({
            message:
              "Password changed successfully. Please login with your new password."
          });
      });
    }
  );
};
