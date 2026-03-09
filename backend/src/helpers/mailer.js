const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.mailtrap.io",
  port: process.env.MAIL_PORT || 2525,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ── Ticket Confirmation ──────────────────────────────────────
async function sendTicketConfirmation({ to, referenceCode, subject }) {
  try {
    await transporter.sendMail({
      from: '"SupCrud Support" <support@supcrud.com>',
      to,
      subject: `Ticket Confirmed: ${referenceCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #5b6ef5;">🚀 We received your request!</h2>
          <p>Your ticket <strong>${subject}</strong> has been registered successfully.</p>
          <div style="background: #f4f4f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #666;">Tracking code:</p>
            <h1 style="margin: 10px 0; color: #1a1a2e; letter-spacing: 2px;">${referenceCode}</h1>
          </div>
          <p style="font-size: 12px; color: #999;">Team Crudzaso · SupCrud Support</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Mailer] Confirmation error:", error.message);
    return false;
  }
}

// ── OTP Email ────────────────────────────────────────────────
async function sendOTPEmail({ to, otpCode, referenceCode }) {
  try {
    const info = await transporter.sendMail({
      from: '"SupCrud Security" <security@supcrud.com>',
      to,
      subject: `Your access code for ticket ${referenceCode}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #5b6ef5;">🔑 Verification Code</h2>
          <p>You requested access to the full history of ticket <strong>${referenceCode}</strong>.</p>
          <div style="background: #f4f4f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px dashed #5b6ef5;">
            <p style="margin: 0; color: #666; font-size: 14px;">Enter this code in the widget:</p>
            <h1 style="margin: 10px 0; color: #1a1a2e; font-size: 32px; letter-spacing: 5px;">${otpCode}</h1>
            <p style="margin: 0; color: #ff4d4f; font-size: 11px;">This code expires in 10 minutes.</p>
          </div>
          <p style="font-size: 13px; color: #666;">If you did not request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">SupCrud Security · Powered by Crudzaso</p>
        </div>
      `,
    });
    console.log("[Mailer] OTP sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("[Mailer] OTP error:", error.message);
    return false;
  }
}

// ── Agent Invitation Email ────────────────────────────────────
async function sendInvitationEmail({
  to,
  workspaceName,
  role,
  acceptUrl,
  expiresAt,
}) {
  try {
    const expiry = new Date(expiresAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const info = await transporter.sendMail({
      from: '"SupCrud Team" <team@supcrud.com>',
      to,
      subject: `You've been invited to join ${workspaceName} on SupCrud`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 12px;">
          <h2 style="color: #5b6ef5; margin-bottom: 6px;">👋 You have a new invitation</h2>
          <p style="color: #444; margin-bottom: 24px;">
            You've been invited to join <strong>${workspaceName}</strong> as 
            <strong style="color: #5b6ef5;">${role}</strong> on SupCrud.
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${acceptUrl}"
               style="display: inline-block; background: #5b6ef5; color: white;
                      padding: 14px 32px; border-radius: 8px; text-decoration: none;
                      font-weight: 700; font-size: 15px; letter-spacing: 0.5px;">
              Accept Invitation
            </a>
          </div>

          <p style="font-size: 12px; color: #999; text-align: center;">
            This invitation expires on <strong>${expiry}</strong>.<br>
            If you did not expect this email, you can safely ignore it.
          </p>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;">
          <p style="font-size: 11px; color: #bbb; text-align: center;">
            SupCrud · Powered by Crudzaso
          </p>
        </div>
      `,
    });
    console.log("[Mailer] Invitation sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("[Mailer] Invitation error:", error.message);
    throw error; // Re-throw so the service knows it failed
  }
}

module.exports = {
  sendTicketConfirmation,
  sendOTPEmail,
  sendInvitationEmail,
};
