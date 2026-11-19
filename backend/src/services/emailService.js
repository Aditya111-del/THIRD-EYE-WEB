import nodemailer from "nodemailer";

export function getSmtpConfig() {
  const host =
    process.env.SMTP_HOST?.trim() || "smtpout.secureserver.net";
  // Automatically fix smtp.titan.email to GoDaddy's working secureserver host
  const cleanHost =
    host === "smtp.titan.email" ? "smtpout.secureserver.net" : host;

  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER?.trim() || "future@helmer.world";
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || "").trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || "future@helmer.world";

  return { host: cleanHost, port, user, pass, adminEmail };
}

export function createMailer() {
  const { host, port, user, pass } = getSmtpConfig();

  if (!pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    // Useful timeout settings to prevent hanging
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

export async function sendWaitlistNotification({ email, platform }) {
  const { user, adminEmail, pass } = getSmtpConfig();
  const mailer = createMailer();

  if (!mailer || !pass) {
    console.warn(
      `[Email Service] Cannot send email notification: SMTP_PASS is empty or missing in environment variables.\n` +
      `                Make sure SMTP_PASS is added in Render under third-eye-back -> Environment.`
    );
    return { sent: false, reason: "SMTP_PASS not configured" };
  }

  const platformName =
    platform === "windows"
      ? "Windows"
      : platform === "macos"
      ? "macOS"
      : "All Platforms";

  console.log(`[Email Service] Sending waitlist notification for ${email} (${platformName})...`);

  // 1. Alert to future@helmer.world
  const adminMailOptions = {
    from: `"Third eye" <${user}>`,
    to: adminEmail,
    subject: `New Waiting List Signup: ${email} (${platformName})`,
    text: `You have a new waitlist signup for Third eye!\n\nEmail: ${email}\nPlatform: ${platformName}\nDate: ${new Date().toLocaleString()}\n`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">New Waiting List Signup</h2>
        <p style="color: #475569; font-size: 15px;">A new developer has joined the Third eye early access list.</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 6px; margin: 18px 0; border: 1px solid #e2e8f0;">
          <p style="margin: 4px 0;"><strong>Subscriber Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p style="margin: 4px 0;"><strong>Target Platform:</strong> ${platformName}</p>
          <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      </div>
    `,
  };

  // 2. Welcome email to the subscriber
  const userMailOptions = {
    from: `"Third eye" <${user}>`,
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
    const adminResult = await mailer.sendMail(adminMailOptions);
    console.log(`[Email Service] Admin notification sent: ${adminResult.messageId}`);

    let userResult = null;
    try {
      userResult = await mailer.sendMail(userMailOptions);
      console.log(`[Email Service] User confirmation sent to ${email}: ${userResult.messageId}`);
    } catch (userErr) {
      console.warn(`[Email Service] Could not send confirmation to user: ${userErr.message}`);
    }

    return {
      sent: true,
      adminMessageId: adminResult.messageId,
      userMessageId: userResult?.messageId,
    };
  } catch (error) {
    console.error(`[Email Service Error]: Failed to send email notification:`, error.message);
    return { sent: false, error: error.message };
  }
}
