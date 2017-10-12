const config = require("../config/keys");
const mailgun = require("mailgun-js")({
  apiKey: config.mailgun_priv_key,
  domain: config.mailgun_domain
});

// Create and export function to send emails through Mailgun API
module.exports.sendEmail = function(recipient, message) {
  const data = {
    from: "gopitch.io@gmail.com",
    to: recipient,
    subject: message.subject,
    text: message.text
  };

  mailgun.messages().send(data, (error, body) => {
    error ? console.log(error) : console.log(body);
  });
};

module.exports.contactForm = function(sender, message) {
  const data = {
    from: sender,
    to: "gopitch.io@gmail.com",
    subject: message.subject,
    text: message.text
  };

  mailgun.messages().send(data, (error, body) => {
    error ? console.log(error) : console.log(body);
  });
};
