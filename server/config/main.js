module.exports = {
    // Secret Key for JWT signing and encryption
  localSecret: "secret_phrase", 
  googleClientID:
    "149245050120-d51dlj4ooh68875af7t9o13r9jsojskj.apps.googleusercontent.com",
  googleClientSecret: "nbe2v5SH8r7SaeiDW7uUHeSI",
  // MongoDb connection string
  database:
    "mongodb://gopitch-user:kaliambasuimonkoster12345@ds113795.mlab.com:13795/gopitch-dev", 
  port: process.env.PORT || 3000
};
