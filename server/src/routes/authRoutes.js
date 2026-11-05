import express from 'express';
import {
  initiateRegistration,
  sendEmailOtp,
  verifyEmailOtp,
  sendMobileOtp,
  verifyMobileOtp,
  completeRegistration,
  getRegistrationStatus,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  sendOtp,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// Registration & Independent Verification
router.post('/register-initiate', initiateRegistration);
router.post('/register', initiateRegistration);
router.post('/send-email-otp', sendEmailOtp);
router.post('/verify-email-otp', verifyEmailOtp);
router.post('/send-mobile-otp', sendMobileOtp);
router.post('/verify-mobile-otp', verifyMobileOtp);
router.post('/complete-registration', completeRegistration);
router.get('/registration-status', getRegistrationStatus);

// Standard Login & Sessions
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

// Mobile OTP Login
router.post('/send-login-otp', sendLoginOtp);
router.post('/verify-login-otp', verifyLoginOtp);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Password Recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
