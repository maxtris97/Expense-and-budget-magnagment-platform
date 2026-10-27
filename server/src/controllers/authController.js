import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Account from '../models/Account.js';

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

export const register = async (req, res, next) => {
  try {
    const { name, email, password, preferredCurrency = 'INR' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      preferredCurrency,
      themePreference: 'dark',
    });

    // Create default clean accounts for new user (0 balance)
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
