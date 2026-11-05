import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Mail,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  RotateCcw,
  KeyRound,
} from 'lucide-react';
import authApi from '../api/authApi.js';
import OtpInput from '../components/auth/OtpInput.jsx';

const COUNTRY_CODES = [
  { code: '+91', label: 'IN (+91)' },
  { code: '+1', label: 'US (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+971', label: 'AE (+971)' },
  { code: '+65', label: 'SG (+65)' },
];

export const ForgotPasswordPage = () => {
  const [method, setMethod] = useState('email'); // 'email' | 'mobile'

  // Input states
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');

  // Recovery flow states
  const [step, setStep] = useState('input'); // 'input' | 'email_sent' | 'mobile_otp'
  const [otp, setOtp] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle initial request (Send Email link or Send Mobile OTP)
  const handleInitiateRecovery = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    let identifier = '';
    if (method === 'email') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      identifier = email.trim();
    } else {
      const cleanPhone = mobileNumber.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 8) {
        setError('Please enter a valid mobile number.');
        return;
      }
      identifier = cleanPhone;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword({
        identifier,
        countryCode,
      });

      if (res.success) {
        if (res.deliveryMethod === 'email') {
          setStep('email_sent');
          setSuccessMsg(res.message);
        } else {
          setMaskedPhone(res.maskedNumber || `${countryCode} ******${mobileNumber.slice(-4)}`);
          setStep('mobile_otp');
          setOtp('');
          setResendCooldown(30);
          setSuccessMsg(res.message);
        }
      } else {
        setError(res.message || 'Failed to initiate password recovery.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Mobile OTP verification for password reset
  const handleVerifyMobileOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter the full 6-digit OTP sent to your phone.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const cleanPhone = mobileNumber.replace(/\D/g, '');
      const res = await authApi.verifyOtp({
        countryCode,
        mobileNumber: cleanPhone,
        otp,
        purpose: 'reset_password',
      });

      if (res.success && res.resetToken) {
        // Redirect to Reset Password page with the verified one-time reset token
        navigate(`/reset-password?resetToken=${encodeURIComponent(res.resetToken)}&method=mobile`);
      } else {
        setError(res.message || 'Verification failed. Please check the OTP.');
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Mobile OTP resend
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setLoading(true);

    try {
      const cleanPhone = mobileNumber.replace(/\D/g, '');
      const res = await authApi.forgotPassword({
        identifier: cleanPhone,
        countryCode,
      });

      if (res.success) {
        setResendCooldown(30);
        setSuccessMsg('A new recovery passcode has been sent.');
      } else {
        setError(res.message || 'Unable to resend OTP.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
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
            <KeyRound className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-fin-text">FinFlow</h1>
          <p className="text-xs text-fin-text-muted mt-1">
            Account Recovery & Security Verification
          </p>
        </div>

        {/* Card Container */}
        <div className="fin-glass-card rounded-3xl p-7 lg:p-8 shadow-2xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-fin-text">Reset Password</h2>
            <p className="text-xs text-fin-text-muted">
              {step === 'input' && 'Enter your registered email or phone to receive instructions'}
              {step === 'email_sent' && 'Check your inbox for password reset instructions'}
              {step === 'mobile_otp' && `Enter the verification code dispatched to ${maskedPhone}`}
            </p>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email or Mobile */}
          {step === 'input' && (
            <form onSubmit={handleInitiateRecovery} className="space-y-4">
              {/* Method Switcher */}
              <div className="flex p-1 bg-fin-card-secondary rounded-2xl border border-fin-border">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('email');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    method === 'email'
                      ? 'bg-fin-card text-fin-accent shadow-sm'
                      : 'text-fin-text-muted hover:text-fin-text'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Via Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('mobile');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    method === 'mobile'
                      ? 'bg-fin-card text-fin-accent shadow-sm'
                      : 'text-fin-text-muted hover:text-fin-text'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Via Mobile</span>
                </button>
              </div>

              {method === 'email' ? (
                <div>
                  <label className="block text-xs font-semibold text-fin-text-muted mb-1.5">
                    Registered Email Address
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
              ) : (
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
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fin-accent to-fin-accent-secondary text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2A: Email Sent Confirmation View */}
          {step === 'email_sent' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-fin-text-muted leading-relaxed">
                If an account exists with <strong className="text-fin-text">{email}</strong>, you will receive an email shortly with a secure password reset link valid for 15 minutes.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs text-fin-accent hover:underline font-semibold"
                >
                  Try a different email or phone number
                </button>
              </div>
            </div>
          )}

          {/* STEP 2B: Mobile OTP Verification */}
          {step === 'mobile_otp' && (
            <form onSubmit={handleVerifyMobileOtp} className="space-y-4">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="text-fin-text-muted">Code dispatched to:</span>
                <span className="font-semibold text-fin-text">{maskedPhone}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fin-text-muted mb-2 text-center">
                  Enter 6-Digit Recovery Passcode
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
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fin-accent to-fin-accent-secondary text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <span>Verifying Code...</span>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-fin-text-muted hover:text-fin-text flex items-center gap-1 text-[11px]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Edit Number</span>
                </button>

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
            </form>
          )}

          {/* Footer Back to Login Link */}
          <div className="pt-2 text-center border-t border-fin-border/50">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-xs text-fin-text-muted hover:text-fin-accent transition-colors font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

