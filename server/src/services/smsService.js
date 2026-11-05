/**
 * SMS Notification Service
 * Supports Fast2SMS (India), Twilio (Global), and MSG91
 */

/**
 * Normalizes phone numbers to standard E.164 format (+919876543210)
 */
export const normalizePhoneNumber = (countryCode = '+91', nationalNumber = '') => {
  const cleanCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  const cleanNumber = nationalNumber.replace(/\D/g, '');
  return `${cleanCode}${cleanNumber}`;
};

/**
 * Masks a phone number for safe UI display (e.g. +91 ******1234)
 */
export const maskPhoneNumber = (fullNumber = '') => {
  if (!fullNumber || fullNumber.length < 8) return fullNumber;
  const last4 = fullNumber.slice(-4);
  let prefix = '';
  if (fullNumber.startsWith('+')) {
    const nationalLength = 10;
    if (fullNumber.length > nationalLength) {
      prefix = fullNumber.slice(0, fullNumber.length - nationalLength);
    } else {
      prefix = fullNumber.slice(0, 3);
    }
  } else {
    prefix = fullNumber.slice(0, 3);
  }
  return `${prefix} ******${last4}`.trim();
};

/**
 * Detect active SMS provider
 */
export const getActiveSmsProvider = () => {
  if (process.env.SMS_PROVIDER === 'mock') {
    return 'mock';
  }
  if (process.env.FAST2SMS_API_KEY || (process.env.SMS_PROVIDER === 'fast2sms' && process.env.SMS_API_KEY)) {
    return 'fast2sms';
  }
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)
  ) {
    return 'twilio';
  }
  if (process.env.MSG91_AUTH_KEY || (process.env.SMS_PROVIDER === 'msg91' && process.env.SMS_API_KEY)) {
    return 'msg91';
  }
  if (process.env.SMS_PROVIDER === 'mock' || process.env.NODE_ENV !== 'production') {
    return 'mock';
  }
  return 'none';
};

/**
 * Deliver SMS OTP with actual provider verification
 * Returns { success: boolean, provider: string, messageId?: string, error?: string, isMock?: boolean }
 */
export const deliverSmsOtp = async ({ to, message, otp }) => {
  const masked = maskPhoneNumber(to);
  const provider = getActiveSmsProvider();
  const extractedOtp = otp || message.match(/\b\d{6}\b/)?.[0] || '';

  console.log(`[SMS Service] Initiating delivery to ${masked} using provider: [${provider.toUpperCase()}]`);

  // ============================================================
  // 1. FAST2SMS PROVIDER (Optimized for India Mobile Numbers)
  // ============================================================
  if (provider === 'fast2sms') {
    const apiKey = (process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY || '').trim();
    // Fast2SMS requires exact 10-digit Indian national number without +91 or leading 0
    const cleanNumber = to.replace(/^\+91/, '').replace(/^0/, '').replace(/\D/g, '');

    if (cleanNumber.length !== 10) {
      console.error(`[SMS Service Error] Fast2SMS requires 10-digit Indian number, got: ${cleanNumber.length} digits`);
      return {
        success: false,
        provider: 'fast2sms',
        error: `Invalid Indian mobile number. Exactly 10 digits required, received: ${cleanNumber.length}`,
      };
    }

    try {
      // Use OTP route if 6-digit OTP extracted, otherwise fallback to Quick SMS route
      const useOtpRoute = !!extractedOtp && (process.env.FAST2SMS_ROUTE !== 'q');
      const payload = useOtpRoute
        ? {
            route: 'otp',
            variables_values: extractedOtp,
            numbers: cleanNumber,
          }
        : {
            route: 'q',
            message: message || `Your FineFlow Finance verification code is: ${extractedOtp}. Valid for 5 minutes.`,
            language: 'english',
            numbers: cleanNumber,
          };

      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (data.return === true || (Array.isArray(data.message) && data.message[0]?.toLowerCase().includes('success'))) {
        const requestId = data.request_id || `f2s_${Date.now()}`;
        console.log(`[SMS Service] Accepted by Fast2SMS. Request ID: ${requestId}`);
        return {
          success: true,
          provider: 'fast2sms',
          messageId: requestId,
        };
      }

      const errorDetail = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Fast2SMS rejected delivery');
      console.error(`[SMS Service Error] Fast2SMS error: ${errorDetail}`);
      return {
        success: false,
        provider: 'fast2sms',
        error: `Fast2SMS rejected: ${errorDetail}`,
      };
    } catch (err) {
      console.error(`[SMS Service Error] Fast2SMS connection failed: ${err.message}`);
      return {
        success: false,
        provider: 'fast2sms',
        error: `Fast2SMS network error: ${err.message}`,
      };
    }
  }

  // ============================================================
  // 2. TWILIO PROVIDER (Global SMS)
  // ============================================================
  if (provider === 'twilio') {
    const sid = process.env.TWILIO_ACCOUNT_SID.trim();
    const auth = process.env.TWILIO_AUTH_TOKEN.trim();
    const from = process.env.TWILIO_PHONE_NUMBER?.trim();
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();

    try {
      const basicAuth = Buffer.from(`${sid}:${auth}`).toString('base64');
      const params = new URLSearchParams({
        To: to,
        Body: message || `Your FineFlow Finance code is: ${extractedOtp}. Valid for 5 minutes.`,
      });

      if (messagingServiceSid) {
        params.append('MessagingServiceSid', messagingServiceSid);
      } else if (from) {
        params.append('From', from);
      }

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.sid) {
        console.log(`[SMS Service] Accepted by Twilio. SID: ${data.sid}`);
        return {
          success: true,
          provider: 'twilio',
          messageId: data.sid,
        };
      }

      const errorMsg = data.message || `Twilio returned status ${response.status}`;
      console.error(`[SMS Service Error] Twilio rejected: ${errorMsg}`);
      return {
        success: false,
        provider: 'twilio',
        error: `Twilio SMS failed: ${errorMsg}`,
      };
    } catch (err) {
      console.error(`[SMS Service Error] Twilio connection failed: ${err.message}`);
      return {
        success: false,
        provider: 'twilio',
        error: `Twilio connection error: ${err.message}`,
      };
    }
  }

  // ============================================================
  // 3. MSG91 PROVIDER (India & Global Enterprise)
  // ============================================================
  if (provider === 'msg91') {
    const authKey = (process.env.MSG91_AUTH_KEY || process.env.SMS_API_KEY || '').trim();
    const templateId = (process.env.MSG91_TEMPLATE_ID || '').trim();
    // MSG91 expects number with country code, without '+' (e.g. 919876543210)
    const cleanNumber = to.replace(/^\+/, '').replace(/\D/g, '');

    try {
      const payload = {
        template_id: templateId,
        short_url: '0',
        recipients: [
          {
            mobiles: cleanNumber,
            otp: extractedOtp,
          },
        ],
      };

      const response = await fetch('https://control.msg91.com/api/v5/flow/', {
        method: 'POST',
        headers: {
          authkey: authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && (data.type === 'success' || !data.type)) {
        console.log(`[SMS Service] Accepted by MSG91.`);
        return {
          success: true,
          provider: 'msg91',
        };
      }

      const errorMsg = data.message || `MSG91 returned status ${response.status}`;
      console.error(`[SMS Service Error] MSG91 rejected: ${errorMsg}`);
      return {
        success: false,
        provider: 'msg91',
        error: `MSG91 error: ${errorMsg}`,
      };
    } catch (err) {
      return {
        success: false,
        provider: 'msg91',
        error: `MSG91 connection failed: ${err.message}`,
      };
    }
  }

  // ============================================================
  // 4. DEVELOPMENT MOCK MODE (Local Only)
  // ============================================================
  if (provider === 'mock') {
    console.log(`\n------------------- [FINEFLOW SMS (DEV MOCK MODE)] -------------------`);
    console.log(`To: ${to} (Masked: ${masked})`);
    console.log(`Status: Simulated acceptance. In production, configure FAST2SMS_API_KEY, TWILIO_ACCOUNT_SID, or MSG91_AUTH_KEY.`);
    console.log(`----------------------------------------------------------------------\n`);

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
  console.error('[SMS Service Error] No SMS provider configured.');
  return {
    success: false,
    provider: 'none',
    error: 'SMS delivery is not configured. Please add FAST2SMS_API_KEY, TWILIO_ACCOUNT_SID, or MSG91_AUTH_KEY to your Render environment variables.',
  };
};

// Backward-compatible alias
export const sendSms = deliverSmsOtp;

export default {
  normalizePhoneNumber,
  maskPhoneNumber,
  getActiveSmsProvider,
  deliverSmsOtp,
  sendSms,
};
