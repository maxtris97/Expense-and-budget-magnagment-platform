import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import authApi from '../api/authApi.js';
import OtpInput from '../components/auth/OtpInput.jsx';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN (+91)', name: 'India' },
  { code: '+1', label: 'US (+1)', name: 'United States' },
  { code: '+44', label: 'UK (+44)', name: 'United Kingdom' },
  { code: '+971', label: 'AE (+971)', name: 'UAE' },
  { code: '+65', label: 'SG (+65)', name: 'Singapore' },
  { code: '+61', label: 'AU (+61)', name: 'Australia' },
  { code: '+49', label: 'DE (+49)', name: 'Germany' },
  { code: '+1', label: 'CA (+1)', name: 'Canada' },
];

export const LoginPage = () => {
  const [authMode, setAuthMode] = useState('email'); // 'email' | 'mobile'

  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Mobile state
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'otp'
  const [otp, setOtp] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Common UI state
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  // Handle countdown timer for Resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Email + Password Submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  // Handle Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 8) {
      setError('Please enter a valid mobile number (minimum 8 digits).');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.sendLoginOtp({
        countryCode,
        mobileNumber: cleanNumber,
      });

      if (res.success) {
        setMaskedPhone(res.maskedNumber || `${countryCode} ******${cleanNumber.slice(-4)}`);
        setOtpStep('otp');
        setOtp('');
        setResendCooldown(30);
        setSuccessMsg(res.message || 'OTP sent successfully to your registered mobile number.');
      } else {
        setError(res.message || 'Unable to verify this mobile number. Please check your details or create an account.');
      }
    } catch (err) {
      setError(err.message || 'Unable to verify this mobile number. Please check your details or create an account.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const cleanNumber = mobileNumber.replace(/\D/g, '');
      const res = await authApi.sendLoginOtp({
        countryCode,
        mobileNumber: cleanNumber,
      });

      if (res.success) {
        setResendCooldown(30);
        setSuccessMsg('A fresh verification code has been dispatched.');
      } else {
        setError(res.message || 'Unable to resend OTP.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const cleanNumber = mobileNumber.replace(/\D/g, '');
    const res = await loginWithOtp({
      countryCode,
      mobileNumber: cleanNumber,
      otp,
    });

    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Invalid or expired OTP.');
    }
  };

  const resetMobileFlow = () => {
    setOtpStep('phone');
    setOtp('');
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen bg-fin-bg text-fin-text flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Ambient background glows */}
      <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-fin-accent/15 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-fin-accent-secondary/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fin-accent to-fin-accent-secondary flex items-center justify-center mx-auto shadow-lg shadow-fin-accent/25 mb-3">
            <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-fin-text">FinFlow</h1>
          <p className="text-xs text-fin-text-muted mt-1">
            Personal Finance & Wealth Architecture
          </p>
        </div>

        {/* Login Card */}
        <div className="fin-glass-card rounded-3xl p-7 lg:p-8 shadow-2xl space-y-5">
          {/* Header Title */}
          <div>
            <h2 className="text-lg font-bold text-fin-text">Welcome back</h2>
            <p className="text-xs text-fin-text-muted">
              Choose your preferred sign-in method to access your portfolio
            </p>
          </div>

          {/* Authentication Mode Switcher Tabs */}
          <div className="flex p-1 bg-fin-card-secondary rounded-2xl border border-fin-border">
            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                authMode === 'email'
                  ? 'bg-fin-card text-fin-accent shadow-sm'
                  : 'text-fin-text-muted hover:text-fin-text'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('mobile');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                authMode === 'mobile'
                  ? 'bg-fin-card text-fin-accent shadow-sm'
                  : 'text-fin-text-muted hover:text-fin-text'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Mobile OTP</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Email & Password Form */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-fin-text-muted mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fin-text-muted" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-fin-text-muted">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-fin-accent hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fin-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fin-text-muted hover:text-fin-text transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fin-accent to-fin-accent-secondary text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: Mobile OTP Login */}
          {authMode === 'mobile' && (
            <div className="space-y-4">
              {otpStep === 'phone' ? (
                /* Step 1: Phone Input */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-fin-text-muted mb-1.5">
                      Registered Mobile Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-28 px-2 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code + c.label} value={c.code} className="bg-fin-card text-fin-text">
                            {c.label}
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fin-text-muted" />
                        <input
                          type="tel"
                          placeholder="9876543210"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-fin-text-muted mt-1.5">
                      We'll dispatch a 6-digit one-time verification passcode.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fin-accent to-fin-accent-secondary text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span>Dispatching OTP...</span>
                    ) : (
                      <>
                        <span>Send Login OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: 6-Digit OTP Verification Screen */
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="flex items-center justify-between text-xs pb-1">
                    <span className="text-fin-text-muted">Passcode sent to:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-fin-text">{maskedPhone}</span>
                      <button
                        type="button"
                        onClick={resetMobileFlow}
                        className="text-fin-accent hover:underline text-[11px] font-medium"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-fin-text-muted mb-2 text-center">
                      Enter 6-Digit Verification Code
                    </label>
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      length={6}
                      disabled={loading}
                      autoFocus={true}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fin-accent to-fin-accent-secondary text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span>Verifying Passcode...</span>
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Resend OTP & Countdown */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={resetMobileFlow}
                      className="text-fin-text-muted hover:text-fin-text flex items-center gap-1 text-[11px]"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Back to Number</span>
                    </button>

                    <div>
                      {resendCooldown > 0 ? (
                        <span className="text-fin-text-muted text-[11px]">
                          Resend in <span className="font-semibold text-fin-accent">{resendCooldown}s</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={loading}
                          className="text-fin-accent hover:underline flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Resend OTP</span>
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Registration Link */}
          <p className="text-center text-xs text-fin-text-secondary pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="text-fin-accent font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
