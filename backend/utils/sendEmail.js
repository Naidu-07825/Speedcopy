const nodemailer = require("nodemailer");

module.exports = async ({ to, subject, html, attachments = [] }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Xerox Shop" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments, 
  });
};
