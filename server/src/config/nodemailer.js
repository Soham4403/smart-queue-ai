require("dotenv").config();
const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (mail, subject, message) => {
    try {
  const info = await transporter.sendMail({
    from: process.env.SMTP_USER, // sender address
    to: mail, // list of recipients
    subject: subject, // subject line
    text: message,
    html: message,
  });

  console.log("Message sent: %s", info.messageId);
  return info;
} catch (err) {
  console.error("Error while sending mail:", err);
  throw err;
}
};

module.exports = sendEmail;
