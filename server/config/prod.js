module.exports = {
  localSecret:process.env.LOCAL_SECRET,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  database: process.env.MONGO_URI,
  port: process.env.PORT,
  mailgun_priv_key: process.env.MAILGUN_PRIV_KEY,
  mailgun_domain: process.env.MAILGUN_DOMAIN
};
