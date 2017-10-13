const mailgun = require("../services/mailgun");

module.exports.sendContactForm = function(req, res, nxt) {
  const fromText =
    `${req.body.firstName} ${req.body.lastName} ` + `<${req.body.emailAddress}>`;

  const message = {
    subject: req.body.subject,
    text: req.body.message
  };

  mailgun.contactForm(fromText, message);

  return res
    .status(200)
    .json({ message: "Your email has been successfully sent!" });
};
