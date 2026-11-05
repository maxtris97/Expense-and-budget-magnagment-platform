import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  deliverEmailOtp,
  maskEmail,
  getActiveEmailProvider,
} from '../src/services/emailService.js';
import {
  deliverSmsOtp,
  normalizePhoneNumber,
  maskPhoneNumber,
  getActiveSmsProvider,
} from '../src/services/smsService.js';

describe('OTP Delivery & Provider Verification', () => {
  describe('Email Provider Safety & Configuration', () => {
    test('detects provider configuration correctly', () => {
      const originalUser = process.env.EMAIL_USER;
      const originalPass = process.env.EMAIL_PASS;
      const originalResend = process.env.RESEND_API_KEY;

      delete process.env.EMAIL_USER;
      delete process.env.GMAIL_USER;
      delete process.env.EMAIL_PASS;
      delete process.env.GMAIL_APP_PASSWORD;
      delete process.env.RESEND_API_KEY;
      delete process.env.SMTP_HOST;

      // In test/dev environment with mock fallback
      process.env.EMAIL_PROVIDER = 'mock';
      assert.equal(getActiveEmailProvider(), 'mock');

      // When Resend API key is present
      process.env.RESEND_API_KEY = 're_test_key_123';
      assert.equal(getActiveEmailProvider(), 'resend');

      // Cleanup
      if (originalUser) process.env.EMAIL_USER = originalUser;
      if (originalPass) process.env.EMAIL_PASS = originalPass;
      if (originalResend) process.env.RESEND_API_KEY = originalResend;
    });

    test('rejects delivery in production when unconfigured', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalProvider = process.env.EMAIL_PROVIDER;
      delete process.env.EMAIL_USER;
      delete process.env.GMAIL_USER;
      delete process.env.RESEND_API_KEY;
      delete process.env.SMTP_HOST;
      process.env.NODE_ENV = 'production';
      delete process.env.EMAIL_PROVIDER;

      const result = await deliverEmailOtp({
        to: 'testuser@example.com',
        name: 'Test User',
        otp: '123456',
      });

      assert.equal(result.success, false);
      assert.match(result.error, /Email delivery is not configured/);

      // Restore
      process.env.NODE_ENV = originalNodeEnv;
      if (originalProvider) process.env.EMAIL_PROVIDER = originalProvider;
    });
  });

  describe('SMS Provider Safety & Validation', () => {
    test('Fast2SMS rejects non-10-digit Indian numbers with descriptive error', async () => {
      const originalKey = process.env.FAST2SMS_API_KEY;
      process.env.FAST2SMS_API_KEY = 'fake_fast2sms_key';

      // Too short
      const shortResult = await deliverSmsOtp({
        to: '+9198765',
        otp: '123456',
        message: 'Your code is 123456',
      });
      assert.equal(shortResult.success, false);
      assert.match(shortResult.error, /10 digits required/);

      // Restore
      if (originalKey) process.env.FAST2SMS_API_KEY = originalKey;
      else delete process.env.FAST2SMS_API_KEY;
    });

    test('rejects SMS delivery in production when unconfigured', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalSmsProvider = process.env.SMS_PROVIDER;
      delete process.env.FAST2SMS_API_KEY;
      delete process.env.SMS_API_KEY;
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.MSG91_AUTH_KEY;
      process.env.NODE_ENV = 'production';
      delete process.env.SMS_PROVIDER;

      const result = await deliverSmsOtp({
        to: '+919876543210',
        otp: '123456',
        message: 'Your code is 123456',
      });

      assert.equal(result.success, false);
      assert.match(result.error, /SMS delivery is not configured/);

      // Restore
      process.env.NODE_ENV = originalNodeEnv;
      if (originalSmsProvider) process.env.SMS_PROVIDER = originalSmsProvider;
    });
  });
});

