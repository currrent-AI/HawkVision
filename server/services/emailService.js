const nodemailer = require("nodemailer");

const smtpPort = Number(process.env.SMTP_PORT || 465);

console.log("===== SMTP CONFIG CHECK =====");
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", smtpPort);
console.log("SMTP_SECURE:", process.env.SMTP_SECURE);
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS exists:", Boolean(process.env.SMTP_PASS));
console.log("SMTP_FROM:", process.env.SMTP_FROM);
console.log("=============================");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure:
    String(process.env.SMTP_SECURE).toLowerCase() === "true" ||
    smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPasswordResetEmail({
  to,
  resetUrl,
  fullName,
}) {
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  const displayName =
    fullName || "HawkVision User";

  console.log("===== PASSWORD RESET EMAIL =====");
  console.log("FROM:", from);
  console.log("TO:", to);
  console.log("RESET URL:", resetUrl);
  console.log("================================");

  try {
    console.log("Checking SMTP connection...");

    await transporter.verify();

    console.log("SMTP connection successful.");

    const info = await transporter.sendMail({
      from: `"HawkVision AI" <${from}>`,
      to,
      subject:
        "HawkVision AI — Password Reset Request",

      text: `Hello ${displayName},

We received a request to reset your HawkVision AI account password.

Use the following link to create a new password:

${resetUrl}

This password reset link will expire in 15 minutes.

If you did not request this reset, you can safely ignore this email.

HawkVision AI
Disaster Control & Response System`,

      html: `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#080F1E;font-family:Arial,sans-serif;">
            <div style="max-width:600px;margin:40px auto;padding:32px;background:#111C31;border:1px solid #1D304D;border-radius:14px;color:#F1F5F9;">

              <div style="text-align:center;margin-bottom:28px;">
                <h1 style="margin:0;color:#F1F5F9;font-size:24px;">
                  Hawk<span style="color:#EF3340;">Vision</span> AI
                </h1>

                <p style="color:#8FA4C7;font-size:12px;letter-spacing:2px;margin-top:8px;">
                  DISASTER CONTROL & RESPONSE
                </p>
              </div>

              <div style="border-left:3px solid #3B82F6;padding-left:18px;margin-bottom:25px;">
                <h2 style="margin:0 0 8px;color:#F1F5F9;font-size:20px;">
                  Password Reset Request
                </h2>

                <p style="margin:0;color:#8FA4C7;font-size:14px;line-height:1.7;">
                  Hello ${displayName}, we received a request to reset
                  your HawkVision AI account password.
                </p>
              </div>

              <p style="color:#CBD5E1;font-size:14px;line-height:1.7;">
                Click the button below to securely create a new password.
              </p>

              <div style="text-align:center;margin:30px 0;">
                <a
                  href="${resetUrl}"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background:#3B82F6;
                    color:#FFFFFF;
                    text-decoration:none;
                    border-radius:8px;
                    font-weight:bold;
                    font-size:14px;
                  "
                >
                  RESET PASSWORD
                </a>
              </div>

              <p style="color:#F59E0B;font-size:13px;line-height:1.6;">
                This reset link will expire in 15 minutes.
              </p>

              <p style="color:#64748B;font-size:12px;line-height:1.6;">
                If you did not request a password reset, you can safely
                ignore this email.
              </p>

              <div style="border-top:1px solid #1D304D;margin-top:28px;padding-top:18px;text-align:center;">
                <span style="color:#64748B;font-size:11px;">
                  SECURE EMERGENCY RESPONSE NETWORK
                </span>
              </div>

            </div>
          </body>
        </html>
      `,
    });

    console.log("EMAIL SENT SUCCESSFULLY");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return info;
  } catch (error) {
    console.error("===== SMTP ERROR =====");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Response:", error.response);
    console.error("Response Code:", error.responseCode);
    console.error("======================");

    throw error;
  }
}

module.exports = {
  sendPasswordResetEmail,
};