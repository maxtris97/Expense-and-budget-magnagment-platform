import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Otp from '../models/Otp.js';
import { sendSms, normalizePhoneNumber, maskPhoneNumber } from '../services/smsService.js';
import { sendPasswordResetEmail } from '../services/emailService.js';

// Helper to generate signed JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'finflow_super_secret_jwt_key_2026_production_style', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper to set cookie
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Cryptographic hash helper (SHA-256)
const hashSecret = (secret) => {
  return crypto.createHash('sha256').update(String(secret)).digest('hex');
};

// Constant-time comparison to prevent timing attacks
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

// Generates cryptographically secure 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Password complexity validation matching strict security requirements
export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character.' };
  }
  return { valid: true };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, mobileNumber, countryCode = '+91', preferredCurrency = 'INR' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.valid) {
      return res.status(400).json({
        success: false,
        message: strengthCheck.message,
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    let normalizedPhone = undefined;
    if (mobileNumber && mobileNumber.trim()) {
      normalizedPhone = normalizePhoneNumber(countryCode, mobileNumber);
      const existingPhoneUser = await User.findOne({ mobileNumber: normalizedPhone });
      if (existingPhoneUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this mobile number already exists.',
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      mobileNumber: normalizedPhone,
      mobileVerified: Boolean(mobileVerified || normalizedPhone),
      passwordHash,
      preferredCurrency,
      themePreference: 'dark',
    });

    // Create default clean accounts for new user
    await Account.create([
      {
        userId: newUser._id,
        name: 'Primary Checking',
        type: 'bank',
        balance: 0,
        currency: preferredCurrency,
        institution: 'Primary Account',
        isDefault: true,
      },
      {
        userId: newUser._id,
        name: 'Savings Vault',
        type: 'savings',
        balance: 0,
        currency: preferredCurrency,
        institution: 'FinFlow Vault',
        isDefault: false,
      },
      {
        userId: newUser._id,
        name: 'Platinum Credit Card',
        type: 'credit',
        balance: 0,
        currency: preferredCurrency,
        institution: 'FinFlow Credit Instrument',
        accountNumberLast4: '4192',
        isDefault: false,
      },
    ]);

    const token = signToken(newUser._id);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req, res, next) => {
  try {
    const accounts = await Account.find({ userId: req.user._id });
    res.status(200).json({
      success: true,
      user: req.user,
      accounts,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// FORGOT & RESET PASSWORD IMPLEMENTATION
// ==========================================

export const forgotPassword = async (req, res, next) => {
  try {
    const { identifier, countryCode = '+91' } = req.body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your registered email address or mobile number.',
      });
    }

    const input = identifier.trim();
    const isEmail = input.includes('@');

    if (isEmail) {
      const email = input.toLowerCase();
      const user = await User.findOne({ email });

      if (user) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetTokenHash = hashSecret(rawToken);
        user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
        });
      }

      // Anti-enumeration: Generic response regardless of whether user exists
      return res.status(200).json({
        success: true,
        deliveryMethod: 'email',
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    } else {
      // Mobile Number Flow
      const normalizedPhone = normalizePhoneNumber(countryCode, input);
      const user = await User.findOne({ mobileNumber: normalizedPhone });

      if (user) {
        // Enforce 30-second cooldown
        const existingOtp = await Otp.findOne({ identifier: normalizedPhone, purpose: 'reset_password' });
        if (existingOtp && existingOtp.lastSentAt && Date.now() - existingOtp.lastSentAt.getTime() < 30 * 1000) {
          const waitSecs = Math.ceil((30 * 1000 - (Date.now() - existingOtp.lastSentAt.getTime())) / 1000);
          return res.status(429).json({
            success: false,
            message: `Please wait ${waitSecs} seconds before requesting another code.`,
          });
        }

        const otp = generateOtp();
        const otpHash = hashSecret(otp);

        await Otp.findOneAndUpdate(
          { identifier: normalizedPhone, purpose: 'reset_password' },
          {
            otpHash,
            attempts: 0,
            maxAttempts: 5,
            lastSentAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
            resetTokenHash: null,
            resetTokenExpiresAt: null,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await sendSms({
          to: normalizedPhone,
          message: `Your FinFlow password reset code is: ${otp}. Valid for 5 minutes. Do not share it.`,
        });
      }

      return res.status(200).json({
        success: true,
        deliveryMethod: 'mobile',
        maskedNumber: maskPhoneNumber(normalizedPhone),
        mobileNumber: normalizedPhone,
        message: 'If an account exists with that mobile number, a verification code has been sent.',
      });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, resetToken, newPassword, confirmPassword } = req.body;

    const activeToken = token || resetToken;
    if (!activeToken) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token or verified session is missing.',
      });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both new password and confirmation password.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return res.status(400).json({
        success: false,
        message: strengthCheck.message,
      });
    }

    const hashedToken = hashSecret(activeToken);

    // 1. Try finding by email reset token
    let user = await User.findOne({
      passwordResetTokenHash: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpiresAt');

    let otpRecord = null;
    if (!user) {
      // 2. Try finding by mobile OTP verified resetToken
      otpRecord = await Otp.findOne({
        resetTokenHash: hashedToken,
        resetTokenExpiresAt: { $gt: new Date() },
        purpose: 'reset_password',
      });

      if (otpRecord) {
        user = await User.findOne({ mobileNumber: otpRecord.identifier });
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link or verification code has expired or is invalid.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    if (otpRecord) {
      await otpRecord.deleteOne();
    }

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MOBILE NUMBER OTP AUTHENTICATION
// ==========================================

export const sendOtp = async (req, res, next) => {
  try {
    const { countryCode = '+91', mobileNumber, nationalNumber, purpose = 'login' } = req.body;
    const rawNumber = mobileNumber || nationalNumber;

    if (!rawNumber || !rawNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your mobile number.',
      });
    }

    const normalizedPhone = normalizePhoneNumber(countryCode, rawNumber);

    if (!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number with correct digits.',
      });
    }

    if (purpose === 'login') {
      const user = await User.findOne({ mobileNumber: normalizedPhone });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found registered with this mobile number. Please check the number or sign up.',
        });
      }
    } else if (purpose === 'registration') {
      const user = await User.findOne({ mobileNumber: normalizedPhone });
      if (user) {
        return res.status(400).json({
          success: false,
          message: 'An account with this mobile number already exists. Please log in.',
        });
      }
    }

    // Rate-limiting: Enforce 30-second cooldown
    const existingOtp = await Otp.findOne({ identifier: normalizedPhone, purpose });
    if (existingOtp && existingOtp.lastSentAt && Date.now() - existingOtp.lastSentAt.getTime() < 30 * 1000) {
      const waitSecs = Math.ceil((30 * 1000 - (Date.now() - existingOtp.lastSentAt.getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSecs} seconds before requesting another OTP.`,
      });
    }

    const otp = generateOtp();
    const otpHash = hashSecret(otp);

    await Otp.findOneAndUpdate(
      { identifier: normalizedPhone, purpose },
      {
        otpHash,
        attempts: 0,
        maxAttempts: 5,
        lastSentAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    let messageText = `Your FinFlow login code is ${otp}. Valid for 5 minutes. Do not share this with anyone.`;
    if (purpose === 'reset_password') {
      messageText = `Your FinFlow password reset code is ${otp}. Valid for 5 minutes.`;
    } else if (purpose === 'registration') {
      messageText = `Your FinFlow mobile verification code is ${otp}. Valid for 5 minutes.`;
    }

    await sendSms({
      to: normalizedPhone,
      message: messageText,
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your registered mobile number.',
      maskedNumber: maskPhoneNumber(normalizedPhone),
      mobileNumber: normalizedPhone,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  return sendOtp(req, res, next);
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { countryCode = '+91', mobileNumber, otp, purpose = 'login' } = req.body;

    if (!mobileNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and 6-digit OTP code are required.',
      });
    }

    const normalizedPhone = normalizePhoneNumber(countryCode, mobileNumber);
    const cleanOtp = String(otp).trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 6-digit verification code.',
      });
    }

    const record = await Otp.findOne({ identifier: normalizedPhone, purpose });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired or is invalid. Please request a new code.',
      });
    }

    if (record.attempts >= record.maxAttempts) {
      await record.deleteOne();
      return res.status(429).json({
        success: false,
        message: 'Maximum OTP verification attempts exceeded. Please request a new code.',
      });
    }

    const incomingHash = hashSecret(cleanOtp);
    const isMatch = safeCompare(record.otpHash, incomingHash);

    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      const remaining = Math.max(0, record.maxAttempts - record.attempts);
      return res.status(400).json({
        success: false,
        message:
          remaining > 0
            ? `Incorrect OTP. You have ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.`
            : 'Maximum verification attempts exceeded. Please request a new code.',
      });
    }

    // Success flow
    if (purpose === 'login') {
      await record.deleteOne(); // Invalidate OTP after success

      const user = await User.findOne({ mobileNumber: normalizedPhone });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User account not found for this mobile number.',
        });
      }

      if (!user.mobileVerified) {
        user.mobileVerified = true;
        await user.save();
      }

      const token = signToken(user._id);
      setAuthCookie(res, token);

      return res.status(200).json({
        success: true,
        token,
        user,
        message: 'Authenticated successfully.',
      });
    } else if (purpose === 'reset_password') {
      const resetToken = crypto.randomBytes(32).toString('hex');
      record.resetTokenHash = hashSecret(resetToken);
      record.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      record.otpHash = 'EXHAUSTED'; // Invalidate the numeric OTP
      await record.save();

      return res.status(200).json({
        success: true,
        resetToken,
        message: 'Mobile OTP verified successfully. You may now reset your password.',
      });
    } else if (purpose === 'registration') {
      await record.deleteOne(); // Invalidate OTP after success
      return res.status(200).json({
        success: true,
        verified: true,
        message: 'Mobile number verified successfully.',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Unknown verification purpose.',
    });
  } catch (error) {
    next(error);
  }
};
