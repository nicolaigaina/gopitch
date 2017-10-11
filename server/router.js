const AuthenticationController = require("./controllers/authentication"),
  express = require("express"),
  passportService = require("./services/passport"),
  passport = require("passport");

// ==========================
// Setup Passport Middleware
// ==========================
const requireAuth = passport.authenticate("jwt", { session: false });
const requireSignin = passport.authenticate("local", { session: false });

module.exports = function(app) {
  // Initializing route groups
  const apiRoutes = express.Router(),
    authRoutes = express.Router();

  // ==========================
  // Auth Routes
  // ==========================

  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use("/auth", authRoutes);

  // Signup route
  authRoutes.post("/signup", AuthenticationController.signup);

  // Signin route
  authRoutes.post("/signin", requireSignin, AuthenticationController.signin);

  // Set url for API group routes
  app.use("/api", apiRoutes);
};
