const passport = require("passport"),
User = require("../models/user"),
config = require("../config/keys"),
JwtStrategy = require("passport-jwt").Strategy,
ExtractJwt = require("passport-jwt").ExtractJwt,
LocalStrategy = require("passport-local");

// ==========================
// Tell Passport that we decideed to use the email filed rather than userName filed
// ==========================
const localOptions = { usernameField: "email" };

// ==========================
// Setting Up Local Login Strategy
// ==========================
const localLogin = new LocalStrategy(localOptions, function(
email,
password,
done
) {
User.findOne({ email: email }, (err, user) => {
  if (err) {
    return done(err);
  }
  if (!user) {
    return done(null, false, {
      error: "Your Login Details Could Not Be Verified. Please, Try Again."
    });
  }

  user.comparePassword(password, (err, isMatch) => {
    if (err) {
      return done(err);
    }
    if (!isMatch) {
      return done(null, false, {
        error: "Your Login Details Could Not Be Verified. Please, Try Again."
      });
    }

    return done(null, user);
  });
});
});

// ==========================
// Setting Up JWT Options
// ==========================
const jwtOptions = {
// Telling passport to check authorization headers for JWT
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// Telling passport where to find the secret
secretOrKey: config.localSecret
};

// ==========================
// Setting Up JWT Login Strategy
// ==========================
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
User.findById(payload._id, (err, user) => {
  if (err) {
    return done(err, false);
  }
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});
});

// ==========================
// Allow Passport Use Strategies
// ==========================
passport.use(jwtLogin);
passport.use(localLogin);