import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import authApi from '../api/authApi.js';
import OtpInput from '../components/auth/OtpInput.jsx';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator.jsx';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN (+91)' },
  { code: '+1', label: 'US (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+65', label: 'SG (+65)' },
  { code: '+61', label: 'AU (+61)' },
];

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currency, setCurrency] = useState('INR');

  // Mobile verification state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpError, setOtpError] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(null);

  // Form submission state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, enterDemoMode } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Send OTP to mobile for verification during registration
  const handleSendMobileOtp = async () => {
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 8) {
      setError('Please enter a valid mobile number with at least 8 digits.');
      return;
    }

    setOtpError(null);
    setOtpSuccess(null);
    setOtpLoading(true);

    try {
      const res = await authApi.sendOtp({
        countryCode,
        mobileNumber: cleanNumber,
        purpose: 'registration',
      });

      if (res.success) {
        setShowOtpModal(true);
        setOtpCooldown(30);
        setOtpSuccess(res.message || 'Verification code sent to your phone.');
      } else {
        setOtpError(res.message || 'Unable to dispatch OTP.');
      }
    } catch (err) {
      setOtpError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify the OTP code
  const handleVerifyMobileOtp = async () => {
    if (!mobileOtp || mobileOtp.length !== 6) {
      setOtpError('Please enter the full 6-digit OTP.');
      return;
    }

    setOtpError(null);
    setOtpLoading(true);

    try {
      const cleanNumber = mobileNumber.replace(/\D/g, '');
      const res = await authApi.verifyOtp({
        countryCode,
        mobileNumber: cleanNumber,
        otp: mobileOtp,
        purpose: 'registration',
      });

      if (res.success && res.verified) {
        setIsMobileVerified(true);
        setShowOtpModal(false);
        setOtpSuccess('Mobile number verified successfully!');
      } else {
        setOtpError(res.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setOtpError(err.message || 'Invalid verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const cleanNumber = mobileNumber.replace(/\D/g, '');

    setLoading(true);
    const res = await register({
      name,
      email,
      mobileNumber: cleanNumber || undefined,
      countryCode,
      mobileVerified: isMobileVerified,
      password,
      preferredCurrency: currency,
    });
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleDemoLogin = () => {
    enterDemoMode?.();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-fin-bg text-fin-text flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-fin-accent/15 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-fin-accent-secondary/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fin-accent to-fin-accent-secondary flex items-center justify-center mx-auto shadow-lg shadow-fin-accent/25 mb-3">
            <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-fin-text">FinFlow</h1>
          <p className="text-xs text-fin-text-muted mt-1">
            Build your personal financial sovereignty
          </p>
        </div>

        <div className="fin-glass-card rounded-3xl p-7 lg:p-8 shadow-2xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-fin-text">Create Account</h2>
            <p className="text-xs text-fin-text-muted">Register to start managing your portfolios & budgets</p>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-fin-text-muted mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fin-text-muted" />
                <input
                  type="text"
                  placeholder="Rajiv Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-fin-text-muted mb-1">
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

            {/* Mobile Number & OTP Verification */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-fin-text-muted">
                  Mobile Number (For OTP Login & Alerts)
                </label>
                {isMobileVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  mobileNumber.length >= 8 && (
                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      disabled={otpLoading}
                      className="text-[11px] font-semibold text-fin-accent hover:underline"
                    >
                      {otpLoading ? 'Sending...' : 'Verify with OTP'}
                    </button>
                  )
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={isMobileVerified}
                  className="w-28 px-2 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-fin-card text-fin-text">
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
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      setIsMobileVerified(false);
                    }}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Inline OTP Verification Box */}
            {showOtpModal && !isMobileVerified && (
              <div className="p-3.5 rounded-2xl bg-fin-card-secondary border border-fin-accent/40 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-fin-text">Enter OTP sent to your phone:</span>
                  <button
                    type="button"
                    onClick={() => setShowOtpModal(false)}
                    className="text-fin-text-muted hover:text-fin-text text-[11px]"
                  >
                    Cancel
                  </button>
                </div>

                {otpError && (
                  <p className="text-[11px] text-rose-400">{otpError}</p>
                )}

                <OtpInput
                  value={mobileOtp}
                  onChange={setMobileOtp}
                  length={6}
                  disabled={otpLoading}
                  autoFocus={true}
                />

                <div className="flex items-center justify-between pt-1">
                  {otpCooldown > 0 ? (
                    <span className="text-[11px] text-fin-text-muted">
                      Resend in <span className="text-fin-accent font-semibold">{otpCooldown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      disabled={otpLoading}
                      className="text-[11px] font-semibold text-fin-accent hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resend OTP</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleVerifyMobileOtp}
                    disabled={otpLoading || mobileOtp.length !== 6}
                    className="px-3.5 py-1.5 rounded-lg bg-fin-accent text-white text-xs font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {otpLoading ? 'Verifying...' : 'Confirm OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-fin-text-muted mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fin-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-fin-text-muted hover:text-fin-text transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrengthIndicator password={password} />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-semibold text-fin-text-muted mb-1">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent cursor-pointer"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="SGD">SGD ($)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fin-accent to-fin-accent-secondary text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-fin-text-secondary pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-fin-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
