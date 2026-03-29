//final or new soln

  {/*  const nodemailer = require("nodemailer");

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

 */}
 const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,  // e.g. "Back2U <onboarding@resend.dev>"
    to,
    subject,
    text,
    html,
  });

  if (error) throw new Error(error.message);
  return data;
};

module.exports = sendEmail;