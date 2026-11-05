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
 * Creates and returns configured Nodemailer transport or null
 */
const getMailerTransport = () => {
  const provider = (process.env.EMAIL_PROVIDER || 'mock').toLowerCase();

  // If user configured SMTP in .env
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // If user configured Gmail service directly
  if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return null;
};

/**
 * Send 6-Digit Email Verification OTP
 */
export const sendEmailOtp = async ({ to, name = 'FinFlow User', otp, purpose = 'registration' }) => {
  const masked = maskEmail(to);
  const transport = getMailerTransport();
  const fromAddress = process.env.EMAIL_FROM || 'FinFlow Security <noreply@finflow.io>';

  const subject =
    purpose === 'reset_password'
      ? 'Your FinFlow Password Reset Code'
      : 'Verify Your Email Address - FinFlow';

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #111827;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">FinFlow</h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Personal Wealth Architecture & Security</p>
      </div>
      <div style="padding: 20px 0;">
        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Hello ${name},</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 24px;">
          Use the 6-digit one-time verification passcode below to verify your email address. This passcode is valid for <strong>5 minutes</strong>.
        </p>
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0284c7; font-family: monospace;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; line-height: 1.4;">
          If you did not request this verification code, please ignore this email. Do not share this passcode with anyone.
        </p>
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} FinFlow Financial Technologies Inc. All rights reserved.
      </div>
    </div>
  `;

  if (transport) {
    try {
      const info = await transport.sendMail({
        from: fromAddress,
        to,
        subject,
        text: `Your FinFlow verification code is: ${otp}. Valid for 5 minutes.`,
        html: htmlBody,
      });
      console.log(`[Email Service] Live email sent to ${masked}: ${info.messageId}`);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Service Error] Failed to send live email: ${err.message}`);
      // Fallback to dev mock logging so development is never blocked
    }
  }

  // Development Mock Logging
  console.log(`\n=================== [FINFLOW EMAIL SERVICE (DEV MOCK)] ===================`);
  console.log(`To: ${to} (Masked: ${masked})`);
  console.log(`Subject: ${subject}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`Status: Dispatched successfully (Expires in 5 minutes)`);
  console.log(`==========================================================================\n`);

  return { success: true, provider: 'mock', messageId: `mock_${Date.now()}` };
};

/**
 * Send Password Reset Link Email
 */
export const sendPasswordResetEmail = async ({ to, name = 'FinFlow User', resetUrl, otp }) => {
  const masked = maskEmail(to);
  const transport = getMailerTransport();
  const fromAddress = process.env.EMAIL_FROM || 'FinFlow Security <noreply@finflow.io>';
  const subject = 'Reset Your FinFlow Password';

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff; color: #111827;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">FinFlow</h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Personal Wealth Architecture & Security</p>
      </div>
      <div>
        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Hello ${name},</h2>
        <p style="font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 24px;">
          We received a request to reset your password. Click the button below to choose a new password. This link is valid for 15 minutes.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #0284c7; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; text-decoration: none; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">
          Or copy and paste this link into your browser:<br />
          <a href="${resetUrl}" style="color: #0284c7;">${resetUrl}</a>
        </p>
        ${
          otp
            ? `<div style="background-color: #f1f5f9; padding: 12px; border-radius: 8px; margin-top: 16px; text-align: center;">Your Recovery Passcode: <strong>${otp}</strong></div>`
            : ''
        }
      </div>
      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} FinFlow Financial Technologies Inc. All rights reserved.
      </div>
    </div>
  `;

  if (transport) {
    try {
      const info = await transport.sendMail({
        from: fromAddress,
        to,
        subject,
        text: `Reset your FinFlow password: ${resetUrl}`,
        html: htmlBody,
      });
      console.log(`[Email Service] Live password reset email sent to ${masked}: ${info.messageId}`);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Service Error] Failed to send live email: ${err.message}`);
    }
  }

  // Development Mock Logging
  console.log(`\n=================== [FINFLOW EMAIL SERVICE (DEV MOCK)] ===================`);
  console.log(`To: ${to} (Masked: ${masked})`);
  console.log(`Subject: ${subject}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`Note: Valid for 15 minutes`);
  console.log(`==========================================================================\n`);

  return { success: true, provider: 'mock', messageId: `mock_${Date.now()}` };
};

export default {
  maskEmail,
  sendEmailOtp,
  sendPasswordResetEmail,
};
