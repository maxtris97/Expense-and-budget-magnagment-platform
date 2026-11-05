import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Otp from '../models/Otp.js';
import PendingRegistration from '../models/PendingRegistration.js';
import { sendSms, normalizePhoneNumber, maskPhoneNumber } from '../services/smsService.js';
import { sendEmailOtp, sendPasswordResetEmail, maskEmail } from '../services/emailService.js';

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

// Helper to provision clean accounts for a newly verified user
const provisionDefaultAccounts = async (userId, preferredCurrency = 'INR') => {
  await Account.create([
    {
      userId,
      name: 'Primary Checking',
      type: 'bank',
      balance: 0,
      currency: preferredCurrency,
      institution: 'Primary Account',
      isDefault: true,
    },
    {
      userId,
      name: 'Savings Vault',
      type: 'savings',
      balance: 0,
      currency: preferredCurrency,
      institution: 'FinFlow Vault',
      isDefault: false,
    },
    {
      userId,
      name: 'Platinum Credit Card',
      type: 'credit',
      balance: 0,
      currency: preferredCurrency,
      institution: 'FinFlow Credit Instrument',
      accountNumberLast4: '4192',
      isDefault: false,
    },
  ]);
};

// ==========================================
// REGISTRATION WITH EMAIL & MOBILE OTP
// ==========================================

export const initiateRegistration = async (req, res, next) => {
  try {
    const {
      name,
      email,
      countryCode = '+91',
      mobileNumber,
      password,
      confirmPassword,
      preferredCurrency = 'INR',
    } = req.body;

    if (!name || !email || !mobileNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email Address, Mobile Number, and Password are required.',
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.valid) {
      return res.status(400).json({
        success: false,
        message: strengthCheck.message,
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalizedPhone = normalizePhoneNumber(countryCode, mobileNumber);
    if (!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number with correct digits.',
      });
    }

    // Check if account already exists with this email
    const existingEmailUser = await User.findOne({ email: cleanEmail });
    if (existingEmailUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Check if account already exists with this mobile number
    const existingPhoneUser = await User.findOne({ mobileNumber: normalizedPhone });
    if (existingPhoneUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists. Please log in.',
      });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate 6-digit OTPs
    const emailOtp = generateOtp();
    const mobileOtp = generateOtp();

    const emailOtpHash = hashSecret(emailOtp);
    const mobileOtpHash = hashSecret(mobileOtp);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Upsert pending registration challenge (1-hour TTL)
    const pending = await PendingRegistration.findOneAndUpdate(
      { email: cleanEmail },
      {
        name: name.trim(),
        email: cleanEmail,
        countryCode,
        mobileNumber: normalizedPhone,
        passwordHash,
        preferredCurrency,
        emailOtpHash,
        emailOtpExpiresAt: otpExpiry,
        emailVerified: false,
        mobileOtpHash,
        mobileOtpExpiresAt: otpExpiry,
        mobileVerified: false,
        emailAttempts: 0,
        mobileAttempts: 0,
        lastEmailSentAt: new Date(),
        lastMobileSentAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour TTL
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send actual Email OTP
    await sendEmailOtp({
      to: cleanEmail,
      name: name.trim(),
      otp: emailOtp,
      purpose: 'registration',
    });

    // Send actual SMS OTP
    await sendSms({
      to: normalizedPhone,
      message: `Your FinFlow mobile verification code is: ${mobileOtp}. Valid for 5 minutes.`,
    });

    res.status(200).json({
      success: true,
      registrationId: pending._id,
      email: cleanEmail,
      mobileNumber: normalizedPhone,
      maskedEmail: maskEmail(cleanEmail),
      maskedPhone: maskPhoneNumber(normalizedPhone),
      emailVerified: false,
      mobileVerified: false,
      message: 'Verification codes have been dispatched to your email address and mobile phone.',
    });
  } catch (error) {
    next(error);
  }
};

export const sendEmailOtp = async (req, res, next) => {
  try {
    const { registrationId, email } = req.body;

    const query = registrationId ? { _id: registrationId } : { email: email?.toLowerCase() };
    const pending = await PendingRegistration.findOne(query);

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: 'Registration session expired or not found. Please register again.',
      });
    }

    if (pending.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your email address is already verified.',
      });
    }

    // 30s Cooldown
    if (pending.lastEmailSentAt && Date.now() - pending.lastEmailSentAt.getTime() < 30 * 1000) {
      const waitSecs = Math.ceil((30 * 1000 - (Date.now() - pending.lastEmailSentAt.getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSecs} seconds before requesting a new email code.`,
      });
    }

    const otp = generateOtp();
    pending.emailOtpHash = hashSecret(otp);
    pending.emailOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    pending.lastEmailSentAt = new Date();
    pending.emailAttempts = 0;
    await pending.save();

    await sendEmailOtp({
      to: pending.email,
      name: pending.name,
      otp,
      purpose: 'registration',
    });

    res.status(200).json({
      success: true,
      message: 'A fresh verification passcode has been sent to your email.',
      maskedEmail: maskEmail(pending.email),
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailOtp = async (req, res, next) => {
  try {
    const { registrationId, email, otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit email verification code.',
      });
    }

    const query = registrationId ? { _id: registrationId } : { email: email?.toLowerCase() };
    const pending = await PendingRegistration.findOne(query);

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: 'Registration session expired. Please start over.',
      });
    }

    if (pending.emailVerified) {
      return res.status(200).json({
        success: true,
        emailVerified: true,
        mobileVerified: pending.mobileVerified,
        message: 'Email address is already verified.',
      });
    }

    if (pending.emailOtpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Email verification code has expired. Please request a new one.',
      });
    }

    if (pending.emailAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Maximum email verification attempts exceeded. Please request a new code.',
      });
    }

    const incomingHash = hashSecret(String(otp).trim());
    const isMatch = safeCompare(pending.emailOtpHash, incomingHash);

    if (!isMatch) {
      pending.emailAttempts += 1;
      await pending.save();
      const remaining = Math.max(0, 5 - pending.emailAttempts);
      return res.status(400).json({
        success: false,
        message:
          remaining > 0
            ? `Incorrect email OTP. You have ${remaining} attempts remaining.`
            : 'Maximum attempts exceeded. Please request a new code.',
      });
    }

    pending.emailVerified = true;
    pending.emailOtpHash = 'VERIFIED';
    await pending.save();

    res.status(200).json({
      success: true,
      emailVerified: true,
      mobileVerified: pending.mobileVerified,
      canActivate: pending.mobileVerified,
      message: 'Email address verified successfully!',
    });
  } catch (error) {
    next(error);
  }
};

export const sendMobileOtp = async (req, res, next) => {
  try {
    const { registrationId, mobileNumber, countryCode = '+91' } = req.body;

    const query = registrationId
      ? { _id: registrationId }
      : { mobileNumber: normalizePhoneNumber(countryCode, mobileNumber) };
    const pending = await PendingRegistration.findOne(query);

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: 'Registration session expired or not found. Please register again.',
      });
    }

    if (pending.mobileVerified) {
      return res.status(400).json({
        success: false,
        message: 'Your mobile number is already verified.',
      });
    }

    // 30s Cooldown
    if (pending.lastMobileSentAt && Date.now() - pending.lastMobileSentAt.getTime() < 30 * 1000) {
      const waitSecs = Math.ceil((30 * 1000 - (Date.now() - pending.lastMobileSentAt.getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSecs} seconds before requesting a new mobile code.`,
      });
    }

    const otp = generateOtp();
    pending.mobileOtpHash = hashSecret(otp);
    pending.mobileOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    pending.lastMobileSentAt = new Date();
    pending.mobileAttempts = 0;
    await pending.save();

    await sendSms({
      to: pending.mobileNumber,
      message: `Your FinFlow mobile verification code is: ${otp}. Valid for 5 minutes.`,
    });

    res.status(200).json({
      success: true,
      message: 'A fresh verification passcode has been sent to your phone.',
      maskedPhone: maskPhoneNumber(pending.mobileNumber),
    });
  } catch (error) {
    next(error);
  }
};

export const verifyMobileOtp = async (req, res, next) => {
  try {
    const { registrationId, mobileNumber, countryCode = '+91', otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 6-digit mobile verification code.',
      });
    }

    const query = registrationId
      ? { _id: registrationId }
      : { mobileNumber: normalizePhoneNumber(countryCode, mobileNumber) };
    const pending = await PendingRegistration.findOne(query);

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: 'Registration session expired. Please start over.',
      });
    }

    if (pending.mobileVerified) {
      return res.status(200).json({
        success: true,
        mobileVerified: true,
        emailVerified: pending.emailVerified,
        message: 'Mobile number is already verified.',
      });
    }

    if (pending.mobileOtpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Mobile verification code has expired. Please request a new one.',
      });
    }

    if (pending.mobileAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Maximum mobile verification attempts exceeded. Please request a new code.',
      });
    }

    const incomingHash = hashSecret(String(otp).trim());
    const isMatch = safeCompare(pending.mobileOtpHash, incomingHash);

    if (!isMatch) {
      pending.mobileAttempts += 1;
      await pending.save();
      const remaining = Math.max(0, 5 - pending.mobileAttempts);
      return res.status(400).json({
        success: false,
        message:
          remaining > 0
            ? `Incorrect mobile OTP. You have ${remaining} attempts remaining.`
            : 'Maximum attempts exceeded. Please request a new code.',
      });
    }

    pending.mobileVerified = true;
    pending.mobileOtpHash = 'VERIFIED';
    await pending.save();

    res.status(200).json({
      success: true,
      mobileVerified: true,
      emailVerified: pending.emailVerified,
      canActivate: pending.emailVerified,
      message: 'Mobile number verified successfully!',
    });
  } catch (error) {
    next(error);
  }
};

export const completeRegistration = async (req, res, next) => {
  try {
    const { registrationId } = req.body;

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: 'Registration challenge ID is required.',
      });
    }

    const pending = await PendingRegistration.findById(registrationId);
    if (!pending) {
      return res.status(404).json({
        success: false,
        message: 'Pending registration not found or expired. Please register again.',
      });
    }

    if (!pending.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email address before activating your account.',
        emailVerified: false,
        mobileVerified: pending.mobileVerified,
      });
    }

    if (!pending.mobileVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your mobile number before activating your account.',
        emailVerified: pending.emailVerified,
        mobileVerified: false,
      });
    }

    // Check once more against User collection for duplicates
    const existing = await User.findOne({
      $or: [{ email: pending.email }, { mobileNumber: pending.mobileNumber }],
    });
    if (existing) {
      await pending.deleteOne();
      return res.status(400).json({
        success: false,
        message: 'An account with this email or mobile number already exists. Please log in.',
      });
    }

    // Create the actual verified User in MongoDB
    const newUser = await User.create({
      name: pending.name,
      email: pending.email,
      mobileNumber: pending.mobileNumber,
      passwordHash: pending.passwordHash,
      preferredCurrency: pending.preferredCurrency,
      emailVerified: true,
      mobileVerified: true,
      accountStatus: 'active',
      themePreference: 'dark',
    });

    // Provision default accounts
    await provisionDefaultAccounts(newUser._id, newUser.preferredCurrency);

    // Delete the pending challenge
    await pending.deleteOne();

    res.status(201).json({
      success: true,
      message: 'Account successfully registered and verified! You can now sign in with your email or mobile OTP.',
    });
  } catch (error) {
    next(error);
  }
};

export const getRegistrationStatus = async (req, res, next) => {
  try {
    const { registrationId } = req.query;
    if (!registrationId) {
      return res.status(400).json({ success: false, message: 'registrationId is required' });
    }

    const pending = await PendingRegistration.findById(registrationId);
    if (!pending) {
      return res.status(404).json({ success: false, message: 'Registration session expired.' });
    }

    res.status(200).json({
      success: true,
      name: pending.name,
      email: pending.email,
      mobileNumber: pending.mobileNumber,
      maskedEmail: maskEmail(pending.email),
      maskedPhone: maskPhoneNumber(pending.mobileNumber),
      emailVerified: pending.emailVerified,
      mobileVerified: pending.mobileVerified,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// STANDARD LOGIN (EMAIL & PASSWORD)
// ==========================================

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

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
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
// MOBILE OTP LOGIN
// ==========================================

export const sendLoginOtp = async (req, res, next) => {
  try {
    const { countryCode = '+91', mobileNumber } = req.body;

    if (!mobileNumber || !mobileNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your mobile number.',
      });
    }

    const normalizedPhone = normalizePhoneNumber(countryCode, mobileNumber);

    if (!/^\+[1-9]\d{6,14}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid mobile number with correct digits.',
      });
    }

    // Check if user exists and has a verified mobile number
    const user = await User.findOne({ mobileNumber: normalizedPhone });
    if (!user || !user.mobileVerified) {
      return res.status(404).json({
        success: false,
        message: 'Unable to verify this mobile number. Please check your details or create an account.',
      });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Enforce 30-second cooldown
    const existingOtp = await Otp.findOne({ identifier: normalizedPhone, purpose: 'login' });
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
      { identifier: normalizedPhone, purpose: 'login' },
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
      message: `Your FinFlow login code is ${otp}. Valid for 5 minutes. Do not share this with anyone.`,
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

export const verifyLoginOtp = async (req, res, next) => {
  try {
    const { countryCode = '+91', mobileNumber, otp } = req.body;

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

    const record = await Otp.findOne({ identifier: normalizedPhone, purpose: 'login' });
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

    // Invalidate the OTP immediately after successful verification
    await record.deleteOne();

    const user = await User.findOne({ mobileNumber: normalizedPhone });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found for this mobile number.',
      });
    }

    const token = signToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      token,
      user,
      message: 'Authenticated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// FORGOT & RESET PASSWORD
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
      const cleanEmail = input.toLowerCase();
      const user = await User.findOne({ email: cleanEmail });

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

      return res.status(200).json({
        success: true,
        deliveryMethod: 'email',
        message: 'If an account exists with that email, a password reset link has been sent.',
      });
    } else {
      const normalizedPhone = normalizePhoneNumber(countryCode, input);
      const user = await User.findOne({ mobileNumber: normalizedPhone });

      if (user) {
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

// Aliases for compatibility with earlier endpoints
export const register = initiateRegistration;
export const sendOtp = sendLoginOtp;
export const resendOtp = sendLoginOtp;
export const verifyOtp = async (req, res, next) => {
  const { purpose } = req.body;
  if (purpose === 'registration_email') return verifyEmailOtp(req, res, next);
  if (purpose === 'registration_mobile') return verifyMobileOtp(req, res, next);
  if (purpose === 'reset_password') {
    // Reset password OTP verification
    const { countryCode = '+91', mobileNumber, otp } = req.body;
    const normalizedPhone = normalizePhoneNumber(countryCode, mobileNumber);
    const cleanOtp = String(otp).trim();
    const record = await Otp.findOne({ identifier: normalizedPhone, purpose: 'reset_password' });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired or is invalid.' });
    }
    const incomingHash = hashSecret(cleanOtp);
    if (!safeCompare(record.otpHash, incomingHash)) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    record.resetTokenHash = hashSecret(resetToken);
    record.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    record.otpHash = 'EXHAUSTED';
    await record.save();
    return res.status(200).json({ success: true, resetToken, message: 'OTP verified successfully.' });
  }
  return verifyLoginOtp(req, res, next);
};
