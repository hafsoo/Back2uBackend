//final or new soln

    const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 20000,
  socketTimeout: 20000,
 
});

transporter.verify((err) => {
  if (err) console.log("❌ SMTP Error:", err);
  else console.log("✅ SMTP Ready");
});

const sendEmail = async ({ to, subject, text, html }) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;

 