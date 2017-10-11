const express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  logger = require("morgan"),
  mongoose = require("mongoose"),
  config = require("./config/main");

// ==========================
// Database Connection
// ==========================
mongoose.connect(config.database);

// ==========================
// Setting Up Basic Middleware For All Express Requests
// ==========================
app.use(logger("dev")); // Log requests to API using morgan

// Enable CORS From Client-Side
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials"
  );
  res.header("Access-Control-Allow-Credentials", "true");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ==========================
// Starting Up The Server
// ==========================
const server = app.listen(config.port);
console.log("Server is running on port " + config.port + ".");
