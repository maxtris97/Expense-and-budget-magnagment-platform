import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  sendOtp,
  resendOtp,
  verifyOtp,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Core Authentication
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

// Forgot & Reset Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Mobile OTP Authentication
router.post('/send-otp', sendOtp);
router.post('/resend-otp', resendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
