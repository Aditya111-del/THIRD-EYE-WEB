import nodemailer from "nodemailer";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "future@helmer.world";
const SMTP_USER = process.env.SMTP_USER || "future@helmer.world";
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || "";
const SMTP_HOST = process.env.SMTP_HOST || "smtpout.secureserver.net";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;

let transporter = null;

function getTransporter() {
  if (!transporter && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendWaitlistNotification({ email, platform }) {
  const mailer = getTransporter();

  if (!mailer) {
    console.warn(
      `[Email Service] Cannot send email notification: SMTP_PASS is not configured.\n` +
      `                Set SMTP_PASS in your environment variables for ${SMTP_USER}.`
    );
    return { sent: false, reason: "SMTP_PASS not configured" };
  }

  const platformName =
    platform === "windows"
      ? "Windows"
      : platform === "macos"
      ? "macOS"
      : "All Platforms";

  // 1. Notification alert to future@helmer.world
  const adminMailOptions = {
    from: `"Third eye" <${SMTP_USER}>`,
    to: ADMIN_EMAIL,
    subject: `New Waiting List Signup: ${email} (${platformName})`,
    text: `You have a new waitlist signup for Third eye!\n\nEmail: ${email}\nPlatform: ${platformName}\nDate: ${new Date().toLocaleString()}\n`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">New Waiting List Signup</h2>
        <p style="color: #475569; font-size: 15px;">A new user has joined the Third eye early access list.</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 18px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 4px 0;"><strong>Subscriber Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 4px 0;"><strong>Target Platform:</strong> ${platformName}</p>
          <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      </div>
    `,
  };

  // 2. Welcome/confirmation email to the subscriber
  const userMailOptions = {
    from: `"Third eye" <${SMTP_USER}>`,
    to: email,
    subject: `You're on the Third eye early access list (${platformName})`,
    text: `Hello,\n\nThank you for your interest in Third eye! You're on the waiting list for ${platformName}.\nWe'll send your download invite the moment builds open.\n\nBest,\nThe Third eye Team\nfuture@helmer.world`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; background: #0f172a; color: #f8fafc; border-radius: 8px;">
        <h1 style="color: #f8fafc; font-size: 22px; margin-top: 0;">Welcome to Third eye.</h1>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
          You're on the priority early access list for <strong>Third eye for ${platformName}</strong>.
        </p>
        <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid rgba(255,255,255,0.1);">
          <p style="margin: 0; font-size: 13px; color: #cbd5e1;">
            We're putting the finishing touches on our agentic desktop IDE. We'll send your installer download link directly to this email address the moment preview builds go live.
          </p>
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
          Have questions or ideas? You can reply directly to this email or reach us at <a href="mailto:future@helmer.world" style="color: #cbd5e1;">future@helmer.world</a>.
        </p>
      </div>
    `,
  };

  try {
    const [adminInfo, userInfo] = await Promise.allSettled([
      mailer.sendMail(adminMailOptions),
      mailer.sendMail(userMailOptions),
    ]);

    return {
      sent: true,
      adminStatus:
        adminInfo.status === "fulfilled" ? "sent" : adminInfo.reason?.message,
      userStatus:
        userInfo.status === "fulfilled" ? "sent" : userInfo.reason?.message,
    };
  } catch (error) {
    console.error("[Email Service Error]:", error);
    return { sent: false, error: error.message };
  }
}
