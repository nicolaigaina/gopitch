const AuthenticationController = require("./controllers/authentication"),
  UserController = require("./controllers/user"),
  ChatController = require("./controllers/chat"),
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
    authRoutes = express.Router(),
    userRoutes = express.Router(),
    chatRoutes = express.Router();

  //= ========================
  // Auth Routes
  //= ========================

  // Set auth routes as subgroup/middleware to apiRoutes
  apiRoutes.use("/auth", authRoutes);

  // Signup route
  authRoutes.post("/signup", AuthenticationController.signup); // /api/auth/signup

  // Signin route
  authRoutes.post("/signin", requireSignin, AuthenticationController.signin); //  ->  /api/auth/signin

  // Password reset request route (generate/send token)
  authRoutes.post("/forgot-password", AuthenticationController.forgotPassword); //  ->  /api/auth/forgot-password

  // Password reset route (change password using token)
  authRoutes.post("/reset-password/:token", AuthenticationController.verifyToken);

  //= ========================
  // User Routes
  //= ========================

  // Set user routes as a subgroup/middleware to apiRoutes
  apiRoutes.use("/user", userRoutes);

  // View user profile route
  userRoutes.get("/:userId", requireAuth, UserController.viewProfile); // -> /api/user/:userId

  //= ========================
  // Chat Routes
  //= ========================

  // Set chat routes as a subgroup/middleware to apiRoutes
  apiRoutes.use('/chat', chatRoutes);
  
  // View messages to and from authenticated user
  chatRoutes.get('/', requireAuth, ChatController.getConversations); // -> /api/chat/
  
  // Retrieve single conversation
  chatRoutes.get('/:conversationId', requireAuth, ChatController.getConversation); // -> /api/chat/:conversationId
  
  // Send reply in conversation
  chatRoutes.post('/:conversationId', requireAuth, ChatController.sendReply); // -> /api/chat/:conversationId
  
  // Start new conversation
  chatRoutes.post('/new/:recipient', requireAuth, ChatController.newConversation); // -> /api/chat/new/:recipient

  // Set url for API group routes
  app.use("/api", apiRoutes);
};
