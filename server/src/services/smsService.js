import https from 'https';

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
  }
  return `${prefix} ******${last4}`.trim();
};

/**
 * Send SMS using configured provider or development mock mode
 */
export const sendSms = async ({ to, message }) => {
  const provider = (process.env.SMS_PROVIDER || 'mock').toLowerCase();

  // 1. Development Mock Mode (Default)
  if (provider === 'mock' || process.env.NODE_ENV !== 'production' && !process.env.SMS_API_KEY) {
    console.log(`\n------------------ [FINFLOW SMS SERVICE (DEV MOCK)] ------------------`);
    console.log(`To: ${maskPhoneNumber(to)} (Real: ${to})`);
    console.log(`Message: ${message}`);
    console.log(`----------------------------------------------------------------------\n`);
    return {
      success: true,
      provider: 'mock',
      messageId: `mock_${Date.now()}`,
    };
  }

  // 2. Fast2SMS Provider (India quick SMS)
  if (provider === 'fast2sms') {
    const apiKey = process.env.SMS_API_KEY || process.env.FAST2SMS_API_KEY;
    const cleanNumber = to.replace(/^\+91/, '').replace(/\D/g, '');
    
    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        route: 'otp',
        variables_values: message.match(/\d{6}/)?.[0] || message,
        numbers: cleanNumber,
      });

      const req = https.request(
        {
          hostname: 'www.fast2sms.com',
          path: '/dev/bulkV2',
          method: 'POST',
          headers: {
            authorization: apiKey,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (parsed.return) resolve({ success: true, provider: 'fast2sms' });
              else reject(new Error(parsed.message || 'Fast2SMS error'));
            } catch (err) {
              resolve({ success: true, provider: 'fast2sms' });
            }
          });
        }
      );

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // 3. Twilio Provider
  if (provider === 'twilio') {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!sid || !auth || !fromNumber) {
      console.warn('[SMS] Twilio credentials missing; falling back to mock output');
      return { success: true, provider: 'mock_fallback' };
    }

    const authHeader = 'Basic ' + Buffer.from(`${sid}:${auth}`).toString('base64');
    const postData = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: message,
    }).toString();

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'api.twilio.com',
          path: `/2010-04-01/Accounts/${sid}/Messages.json`,
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, provider: 'twilio' });
            } else {
              reject(new Error(`Twilio error (${res.statusCode}): ${body}`));
            }
          });
        }
      );
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  // 4. MSG91 Provider
  if (provider === 'msg91') {
    const authKey = process.env.MSG91_AUTH_KEY || process.env.SMS_API_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;
    const cleanNumber = to.replace(/^\+/, '');

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({
        template_id: templateId,
        short_url: '0',
        recipients: [
          {
            mobiles: cleanNumber,
            otp: message.match(/\d{6}/)?.[0] || message,
          },
        ],
      });

      const req = https.request(
        {
          hostname: 'control.msg91.com',
          path: '/api/v5/flow/',
          method: 'POST',
          headers: {
            authkey: authKey,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            resolve({ success: true, provider: 'msg91' });
          });
        }
      );
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  // Fallback
  return { success: true, provider: 'mock_generic' };
};

export default {
  sendSms,
  normalizePhoneNumber,
  maskPhoneNumber,
};
