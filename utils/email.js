const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 🔍 VERIFY SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Error:", error);
  } else {
    console.log("✅ SMTP Server is ready");
  }
});

async function sendEmail({ to, subject, html, text }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Back2U" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = sendEmail;
