import axiosClient from './axiosClient.js';

export const authApi = {
  register: (data) => axiosClient.post('/auth/register', data),
  login: (data) => axiosClient.post('/auth/login', data),
  logout: () => axiosClient.post('/auth/logout'),
  getMe: () => axiosClient.get('/auth/me'),

  // Password Recovery
  forgotPassword: (data) => axiosClient.post('/auth/forgot-password', data),
  resetPassword: (data) => axiosClient.post('/auth/reset-password', data),

  // Mobile OTP Authentication
  sendOtp: (data) => axiosClient.post('/auth/send-otp', data),
  resendOtp: (data) => axiosClient.post('/auth/resend-otp', data),
  verifyOtp: (data) => axiosClient.post('/auth/verify-otp', data),
};

export default authApi;
