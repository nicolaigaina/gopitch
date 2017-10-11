module.exports = {
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    database: process.env.MONGO_URI,
    cookieKey: process.env.COOKIE_KEY,
    port: process.env.PORT || 3000,
  };