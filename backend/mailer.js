const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., smtp.gmail.com
  port: process.env.SMTP_PORT || 587,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // your email
    pass: process.env.SMTP_PASS, // your email password / app password
  },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Assignment System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email sending failed:", err);
  }
}

module.exports = sendEmail;
