const nodemailer = require("nodemailer");

const sendMatchEmail = async ({
  to,
  userName,
  lostItemName,
  foundItemName,
  score,
  foundItemId,
}) => {

  // Debug — confirm values are loading
  //console.log("📧 SMTP USER:", process.env.SMTP_USER);
  //console.log("📧 SMTP PASS:", process.env.SMTP_PASS ? "loaded" : "MISSING");

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const viewLink = `https://back2u-frontend.vercel.app/lost-found/${foundItemId}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h2 style="color: #2ecc71;">🎉 Possible Match Found!</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Good news! A recently posted found item closely matches your lost item.</p>
      <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background:#f5f5f5;">
          <td style="padding:10px; border:1px solid #ddd;"><strong>Your Lost Item</strong></td>
          <td style="padding:10px; border:1px solid #ddd;">${lostItemName}</td>
        </tr>
        <tr>
          <td style="padding:10px; border:1px solid #ddd;"><strong>Matched Found Item</strong></td>
          <td style="padding:10px; border:1px solid #ddd;">${foundItemName}</td>
        </tr>
        <tr style="background:#f5f5f5;">
          <td style="padding:10px; border:1px solid #ddd;"><strong>Match Score</strong></td>
          <td style="padding:10px; border:1px solid #ddd;">${score}% similarity</td>
        </tr>
      </table>
      <a href="${viewLink}"
        style="display:inline-block; background:#2ecc71; color:white; 
               padding:12px 28px; border-radius:8px; text-decoration:none; font-weight:bold;">
        View Matched Item
      </a>
      <p style="margin-top:24px; color:#999; font-size:12px;">
        If this is not your item, ignore this email.<br/>— Lost & Found System
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Back2U" <${process.env.SMTP_USER}>`,
    to,
    subject: `🔍 Match found for your lost item: "${lostItemName}"`,
    html,
  });
};

module.exports = sendMatchEmail;