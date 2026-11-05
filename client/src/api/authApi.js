import axiosClient from './axiosClient.js';

export const authApi = {
  // Registration Flow with Dual OTP Verification
  initiateRegistration: (data) => axiosClient.post('/auth/register-initiate', data),
  register: (data) => axiosClient.post('/auth/register-initiate', data),
  sendEmailOtp: (data) => axiosClient.post('/auth/send-email-otp', data),
  verifyEmailOtp: (data) => axiosClient.post('/auth/verify-email-otp', data),
  sendMobileOtp: (data) => axiosClient.post('/auth/send-mobile-otp', data),
  verifyMobileOtp: (data) => axiosClient.post('/auth/verify-mobile-otp', data),
  completeRegistration: (data) => axiosClient.post('/auth/complete-registration', data),
  getRegistrationStatus: (registrationId) =>
    axiosClient.get('/auth/registration-status', { params: { registrationId } }),

  // Standard Login & Sessions
  login: (data) => axiosClient.post('/auth/login', data),
  logout: () => axiosClient.post('/auth/logout'),
  getMe: () => axiosClient.get('/auth/me'),

  // Mobile OTP Login
  sendLoginOtp: (data) => axiosClient.post('/auth/send-login-otp', data),
  verifyLoginOtp: (data) => axiosClient.post('/auth/verify-login-otp', data),
  sendOtp: (data) => axiosClient.post('/auth/send-login-otp', data),
  verifyOtp: (data) => axiosClient.post('/auth/verify-login-otp', data),
  resendOtp: (data) => axiosClient.post('/auth/send-login-otp', data),

  // Password Recovery
  forgotPassword: (data) => axiosClient.post('/auth/forgot-password', data),
  resetPassword: (data) => axiosClient.post('/auth/reset-password', data),
};

export default authApi;
