import nodemailer from 'nodemailer';

/**
 * Masks an email for safe user display (e.g., trishav@example.com -> t****v@example.com)
 */
export const maskEmail = (email = '') => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const first = local[0];
  const last = local[local.length - 1];
  const maskedMiddle = '*'.repeat(Math.min(6, Math.max(3, local.length - 2)));
  return `${first}${maskedMiddle}${last}@${domain}`;
};

/**
 * Check which email delivery provider is configured
 */
export const getActiveEmailProvider = () => {
  if (process.env.RESEND_API_KEY) return 'resend';
  if ((process.env.EMAIL_USER || process.env.GMAIL_USER) && (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD)) {
    return 'gmail';
  }
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return 'smtp';
  }
  if (process.env.EMAIL_PROVIDER === 'mock' || process.env.NODE_ENV !== 'production') {
    return 'mock';
  }
  return 'none';
};

/**
 * Build rich HTML email for OTP verification
 */
const buildOtpHtml = ({ name, otp, purpose = 'registration' }) => {
  const isReset = purpose === 'reset_password';
  const heading = isReset ? 'Password Reset Verification' : 'Verify Your Email Address';
  const actionText = isReset
    ? 'Use this 6-digit one-time code to reset your FineFlow Finance password.'
    : 'Thank you for registering with FineFlow Finance. Use this 6-digit one-time verification code to confirm your email address.';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${heading}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f19; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" style="max-width: 520px; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);" cellspacing="0" cellpadding="0" border="0">
              
              <!-- Brand Header -->
              <tr>
                <td style="padding: 32px 32px 20px; text-align: center; border-bottom: 1px solid #1e293b;">
                  <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                    FineFlow <span style="background: linear-gradient(135deg, #f43f5e, #fb7185); -webkit-background-clip: text; -webkit-text-fill-color: #fb7185; color: #fb7185;">Finance</span>
                  </h1>
                  <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px;">Personal Wealth Architecture & Security</p>
                </td>
              </tr>

              <!-- Main Body -->
              <tr>
                <td style="padding: 32px 32px 24px;">
                  <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #f8fafc;">
                    Hello ${name || 'Valued User'},
                  </h2>
                  <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                    ${actionText} This passcode is strictly confidential and expires in <strong style="color: #f43f5e;">5 minutes</strong>.
                  </p>

                  <!-- OTP Display Box -->
                  <div style="background: #0f172a; border: 2px dashed #334155; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 8px;">
                      Verification Code
                    </div>
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; display: inline-block; padding-left: 10px;">
                      ${otp}
                    </span>
                  </div>

                  <!-- Security Advisory -->
                  <div style="background: rgba(244, 63, 94, 0.08); border-left: 3px solid #f43f5e; padding: 12px 14px; border-radius: 4px; margin: 24px 0 16px;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #fda4af;">
                      <strong>Security Tip:</strong> Never share this code with anyone. FineFlow Finance staff will never ask for your verification code.
                    </p>
                  </div>

                  <p style="margin: 20px 0 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                    If you did not initiate this request, someone may have entered your email by mistake. You can safely ignore this message.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px; background: #0b1120; border-top: 1px solid #1e293b; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                    &copy; ${new Date().getFullYear()} FineFlow Finance Inc. All rights reserved.<br />
                    Secure Multi-Factor Authentication Service
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Deliver Email OTP with real provider support (Gmail, Resend, SMTP)
 * Returns { success: boolean, provider: string, messageId?: string, error?: string, isMock?: boolean }
 */
export const deliverEmailOtp = async ({ to, name = 'FineFlow User', otp, purpose = 'registration' }) => {
  const masked = maskEmail(to);
  const provider = getActiveEmailProvider();
  const subject = purpose === 'reset_password'
    ? 'Your FineFlow Finance Password Reset Code'
    : 'Your FineFlow Finance Verification Code';
  const htmlBody = buildOtpHtml({ name, otp, purpose });
  const textBody = `Hello ${name},\n\nYour FineFlow Finance verification code is: ${otp}\n\nThis code expires in 5 minutes. Do not share it with anyone.\n\nFineFlow Finance Security`;

  console.log(`[Email Service] Initiating delivery to ${masked} using provider: [${provider.toUpperCase()}]`);

  // ============================================================
  // 1. RESEND PROVIDER (Recommended for Cloud/Render - No Port Blocks)
  // ============================================================
  if (provider === 'resend') {
    try {
      const apiKey = process.env.RESEND_API_KEY.trim();
      const from = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'FineFlow Finance <onboarding@resend.dev>';

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html: htmlBody,
          text: textBody,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.message || `Resend API returned status ${response.status}`;
        console.error(`[Email Service Error] Resend rejected: ${errorMsg}`);
        return {
          success: false,
          provider: 'resend',
          error: `Resend email error: ${errorMsg}`,
        };
      }

      console.log(`[Email Service] Accepted by Resend. Message ID: ${data.id}`);
      return {
        success: true,
        provider: 'resend',
        messageId: data.id,
      };
    } catch (err) {
      console.error(`[Email Service Error] Resend network error: ${err.message}`);
      return {
        success: false,
        provider: 'resend',
        error: `Resend connection failed: ${err.message}`,
      };
    }
  }

  // ============================================================
  // 2. GMAIL SMTP PROVIDER (Direct via App Password)
  // ============================================================
  if (provider === 'gmail') {
    const user = (process.env.EMAIL_USER || process.env.GMAIL_USER || '').trim();
    const pass = (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    const from = process.env.EMAIL_FROM || `FineFlow Finance <${user}>`;

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`[Email Service] Accepted by Gmail SMTP. Message ID: ${info.messageId}`);
      return {
        success: true,
        provider: 'gmail',
        messageId: info.messageId,
      };
    } catch (err) {
      console.error(`[Email Service Error] Gmail SMTP rejected: ${err.message}`);
      let tip = '';
      if (err.message.includes('Invalid login') || err.message.includes('535')) {
        tip = ' (Make sure you use a 16-character Google App Password, not your standard Gmail login password).';
      }
      return {
        success: false,
        provider: 'gmail',
        error: `Gmail delivery failed: ${err.message}${tip}`,
      };
    }
  }

  // ============================================================
  // 3. GENERIC SMTP PROVIDER (Brevo / SendGrid / Mailgun / AWS SES)
  // ============================================================
  if (provider === 'smtp') {
    try {
      const port = Number(process.env.SMTP_PORT) || 587;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST.trim(),
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER.trim(),
          pass: process.env.SMTP_PASS.trim(),
        },
      });

      const from = process.env.EMAIL_FROM || `FineFlow Finance <${process.env.SMTP_USER}>`;

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: textBody,
        html: htmlBody,
      });

      console.log(`[Email Service] Accepted by SMTP. Message ID: ${info.messageId}`);
      return {
        success: true,
        provider: 'smtp',
        messageId: info.messageId,
      };
    } catch (err) {
      console.error(`[Email Service Error] SMTP server rejected: ${err.message}`);
      return {
        success: false,
        provider: 'smtp',
        error: `SMTP delivery failed: ${err.message}`,
      };
    }
  }

  // ============================================================
  // 4. DEVELOPMENT MOCK MODE (Local Only)
  // ============================================================
  if (provider === 'mock') {
    console.log(`\n=================== [FINEFLOW EMAIL (DEV MOCK MODE)] ===================`);
    console.log(`To: ${to} (Masked: ${masked})`);
    console.log(`Subject: ${subject}`);
    console.log(`Status: Simulated acceptance. In production, configure EMAIL_USER & EMAIL_PASS (Gmail) or RESEND_API_KEY.`);
    console.log(`========================================================================\n`);

    return {
      success: true,
      provider: 'mock',
      isMock: true,
      messageId: `mock_${Date.now()}`,
    };
  }

  // ============================================================
  // 5. UNCONFIGURED (Production Protection - Never Send False Success)
  // ============================================================
  console.error('[Email Service Error] No email provider configured.');
  return {
    success: false,
    provider: 'none',
    error: 'Email delivery is not configured. Please add EMAIL_USER & EMAIL_PASS (Gmail App Password) or RESEND_API_KEY to your Render environment variables.',
  };
};

/**
 * Deliver Password Reset Link / Code
 */
export const sendPasswordResetEmail = async ({ to, name = 'FineFlow User', resetUrl, otp }) => {
  const masked = maskEmail(to);
  const provider = getActiveEmailProvider();
  const subject = 'Reset Your FineFlow Finance Password';

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8" /><title>Reset Your Password</title></head>
    <body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width: 520px; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; color: #f8fafc;">
              <tr>
                <td style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #1e293b;">
                  <h1 style="margin: 0; font-size: 24px; color: #ffffff;">FineFlow Finance</h1>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">Password Recovery Service</p>
                </td>
              </tr>
              <tr>
                <td style="padding-top: 24px;">
                  <h2 style="font-size: 16px; margin: 0 0 12px;">Hello ${name},</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin: 0 0 24px;">
                    We received a request to reset your FineFlow Finance account password. Click the button below to choose a new password. This link expires in 15 minutes.
                  </p>
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${resetUrl}" style="background: linear-gradient(135deg, #f43f5e, #fb7185); color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block;">
                      Reset Password
                    </a>
                  </div>
                  ${
                    otp
                      ? `<div style="background: #0f172a; border: 1px dashed #334155; border-radius: 8px; padding: 12px; text-align: center; margin: 16px 0;">
                          <span style="font-size: 12px; color: #94a3b8;">Or use your 6-digit recovery code:</span><br />
                          <strong style="font-size: 20px; letter-spacing: 4px; color: #38bdf8;">${otp}</strong>
                        </div>`
                      : ''
                  }
                  <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                    If you didn't request a password reset, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  if (provider === 'resend') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || process.env.EMAIL_FROM || 'FineFlow Finance <onboarding@resend.dev>',
          to: [to],
          subject,
          html: htmlBody,
          text: `Reset your FineFlow Finance password: ${resetUrl}`,
        }),
      });
      if (response.ok) return { success: true, provider: 'resend' };
    } catch (_) {}
  }

  if (provider === 'gmail' || provider === 'smtp') {
    try {
      const transporter =
        provider === 'gmail'
          ? nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: (process.env.EMAIL_USER || process.env.GMAIL_USER).trim(),
                pass: (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD).replace(/\s+/g, ''),
              },
            })
          : nodemailer.createTransport({
              host: process.env.SMTP_HOST.trim(),
              port: Number(process.env.SMTP_PORT) || 587,
              secure: Number(process.env.SMTP_PORT) === 465,
              auth: { user: process.env.SMTP_USER.trim(), pass: process.env.SMTP_PASS.trim() },
            });

      const from = process.env.EMAIL_FROM || `FineFlow Finance <noreply@finflow.io>`;
      await transporter.sendMail({
        from,
        to,
        subject,
        text: `Reset your FineFlow Finance password: ${resetUrl}`,
        html: htmlBody,
      });
      return { success: true, provider };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  if (provider === 'mock') {
    console.log(`[Email Mock] Reset URL: ${resetUrl} sent to ${masked}`);
    return { success: true, provider: 'mock', isMock: true };
  }

  return { success: false, error: 'Email service is not configured.' };
};

export default {
  maskEmail,
  getActiveEmailProvider,
  deliverEmailOtp,
  sendPasswordResetEmail,
};
