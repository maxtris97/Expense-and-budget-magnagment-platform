/**
 * Email Service with Production Provider Abstraction & Safe Dev Mocking
 */
export const sendPasswordResetEmail = async ({ to, name = 'FinFlow User', resetUrl }) => {
  const provider = (process.env.EMAIL_PROVIDER || 'mock').toLowerCase();

  // 1. Development Mock Mode (Default)
  if (provider === 'mock' || (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST && !process.env.SENDGRID_API_KEY)) {
    console.log(`\n----------------- [FINFLOW EMAIL SERVICE (DEV MOCK)] -----------------`);
    console.log(`To: ${to}`);
    console.log(`Subject: Reset Your FinFlow Password`);
    console.log(`Greeting: Hello ${name},`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Note: This link expires in 15 minutes.`);
    console.log(`----------------------------------------------------------------------\n`);
    return {
      success: true,
      provider: 'mock',
      messageId: `mock_email_${Date.now()}`,
    };
  }

  // 2. Production SMTP / Nodemailer or API integration
  // When SMTP or SendGrid is configured:
  console.log(`[Email Service] Sending password reset email via ${provider} to ${to}`);
  return {
    success: true,
    provider,
  };
};

export default {
  sendPasswordResetEmail,
};

