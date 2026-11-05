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
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import authApi from '../api/authApi.js';
import OtpInput from '../components/auth/OtpInput.jsx';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator.jsx';

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

export const RegisterPage = () => {
  // Step: 'form' | 'verify' | 'completed'
  const [step, setStep] = useState('form');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currency, setCurrency] = useState('INR');

  // Verification State
  const [registrationId, setRegistrationId] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);

  // Active sub-tab in verification screen ('email' | 'mobile')
  const [verifyTab, setVerifyTab] = useState('email');

  // Cooldown timers
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [mobileCooldown, setMobileCooldown] = useState(0);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingMobile, setVerifyingMobile] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { enterDemoMode } = useAuth();
  const navigate = useNavigate();

  // Restore pending registration from sessionStorage if user refreshed
  useEffect(() => {
    const savedPending = sessionStorage.getItem('finflow_pending_reg');
    if (savedPending) {
      try {
        const parsed = JSON.parse(savedPending);
        if (parsed.registrationId) {
          setRegistrationId(parsed.registrationId);
          setMaskedEmail(parsed.maskedEmail || '');
          setMaskedPhone(parsed.maskedPhone || '');
          setEmail(parsed.email || '');
          setMobileNumber(parsed.mobileNumber || '');
          setEmailVerified(!!parsed.emailVerified);
          setMobileVerified(!!parsed.mobileVerified);
          setStep('verify');

          // Check live status from server
          authApi
            .getRegistrationStatus(parsed.registrationId)
            .then((res) => {
              if (res.success) {
                setEmailVerified(res.emailVerified);
                setMobileVerified(res.mobileVerified);
                if (res.emailVerified && !res.mobileVerified) {
                  setVerifyTab('mobile');
                }
              }
            })
            .catch(() => {
              // Session expired on server; clean up
              sessionStorage.removeItem('finflow_pending_reg');
              setStep('form');
            });
        }
      } catch (_) {}
    }
  }, []);

  // Cooldown timer tick
  useEffect(() => {
    if (emailCooldown <= 0 && mobileCooldown <= 0) return;
    const interval = setInterval(() => {
      setEmailCooldown((prev) => Math.max(0, prev - 1));
      setMobileCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [emailCooldown, mobileCooldown]);

  // Handle Form Submission -> Initiate Registration & OTP Dispatch
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validation
    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Please provide a valid mobile number (minimum 8 digits).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.initiateRegistration({
        name: name.trim(),
        email: email.trim(),
        countryCode,
        mobileNumber: cleanPhone,
        password,
        confirmPassword,
        preferredCurrency: currency,
      });

      if (res.success && res.registrationId) {
        setRegistrationId(res.registrationId);
        setMaskedEmail(res.maskedEmail);
        setMaskedPhone(res.maskedPhone);
        setEmailVerified(false);
        setMobileVerified(false);
        setEmailCooldown(30);
        setMobileCooldown(30);
        setStep('verify');
        setVerifyTab('email');
        setSuccessMsg(res.message);
        if (res.mockMobileOtp) {
          setMobileOtp(res.mockMobileOtp);
        }
        if (res.mockEmailOtp) {
          setEmailOtp(res.mockEmailOtp);
        }

        // Save session so page refresh does not lose progress
        sessionStorage.setItem(
          'finflow_pending_reg',
          JSON.stringify({
            registrationId: res.registrationId,
            maskedEmail: res.maskedEmail,
            maskedPhone: res.maskedPhone,
            email: email.trim(),
            mobileNumber: cleanPhone,
            emailVerified: false,
            mobileVerified: false,
          })
        );
      } else {
        setError(res.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setError(err.message || 'Registration error. An account with this email or mobile may already exist.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmail = async (e) => {
    e?.preventDefault();
    if (!emailOtp || emailOtp.length !== 6) {
      setError('Please enter the complete 6-digit email verification code.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setVerifyingEmail(true);

    try {
      const res = await authApi.verifyEmailOtp({
        registrationId,
        email,
        otp: emailOtp,
      });

      if (res.success && res.emailVerified) {
        setEmailVerified(true);
        setSuccessMsg('Email verified successfully!');
        setEmailOtp('');

        // Update sessionStorage
        const saved = JSON.parse(sessionStorage.getItem('finflow_pending_reg') || '{}');
        saved.emailVerified = true;
        sessionStorage.setItem('finflow_pending_reg', JSON.stringify(saved));

        // If mobile is not yet verified, switch tab to mobile
        if (!mobileVerified && !res.mobileVerified) {
          setVerifyTab('mobile');
        } else {
          // Both verified -> complete registration!
          await checkAndCompleteRegistration();
        }
      } else {
        setError(res.message || 'Invalid or expired email OTP.');
      }
    } catch (err) {
      setError(err.message || 'Email verification failed.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Verify Mobile OTP
  const handleVerifyMobile = async (e) => {
    e?.preventDefault();
    if (!mobileOtp || mobileOtp.length !== 6) {
      setError('Please enter the complete 6-digit mobile verification code.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setVerifyingMobile(true);

    try {
      const res = await authApi.verifyMobileOtp({
        registrationId,
        mobileNumber,
        countryCode,
        otp: mobileOtp,
      });

      if (res.success && res.mobileVerified) {
        setMobileVerified(true);
        setSuccessMsg('Mobile number verified successfully!');
        setMobileOtp('');

        // Update sessionStorage
        const saved = JSON.parse(sessionStorage.getItem('finflow_pending_reg') || '{}');
        saved.mobileVerified = true;
        sessionStorage.setItem('finflow_pending_reg', JSON.stringify(saved));

        // If email is not yet verified, switch tab to email
        if (!emailVerified && !res.emailVerified) {
          setVerifyTab('email');
        } else {
          // Both verified -> complete registration!
          await checkAndCompleteRegistration();
        }
      } else {
        setError(res.message || 'Invalid or expired mobile OTP.');
      }
    } catch (err) {
      setError(err.message || 'Mobile verification failed.');
    } finally {
      setVerifyingMobile(false);
    }
  };

  // Complete Registration once both are verified
  const checkAndCompleteRegistration = async () => {
    setLoading(true);
    try {
      const res = await authApi.completeRegistration({ registrationId });
      if (res.success) {
        sessionStorage.removeItem('finflow_pending_reg');
        setStep('completed');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(res.message || 'Could not complete registration.');
      }
    } catch (err) {
      setError(err.message || 'Registration activation error.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Email OTP
  const handleResendEmailOtp = async () => {
    if (emailCooldown > 0 || loading) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await authApi.sendEmailOtp({ registrationId, email });
      if (res.success) {
        setEmailCooldown(30);
        setSuccessMsg(res.message || 'A new verification code has been sent to your email.');
        if (res.mockEmailOtp) {
          setEmailOtp(res.mockEmailOtp);
        }
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend email code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend Mobile OTP
  const handleResendMobileOtp = async () => {
    if (mobileCooldown > 0 || loading) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await authApi.sendMobileOtp({ registrationId, mobileNumber, countryCode });
      if (res.success) {
        setMobileCooldown(30);
        setSuccessMsg(res.message || 'A new verification code has been sent to your mobile phone.');
        if (res.mockMobileOtp) {
          setMobileOtp(res.mockMobileOtp);
        }
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to resend mobile code.');
    } finally {
      setLoading(false);
    }
  };

  // Reset verification to edit details
  const handleEditDetails = () => {
    sessionStorage.removeItem('finflow_pending_reg');
    setStep('form');
    setError(null);
    setSuccessMsg(null);
  };

  const handleDemoLogin = () => {
    enterDemoMode?.();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-fin-bg text-fin-text flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
      {/* Ambient background glows */}
      <div className="absolute -left-20 -top-20 w-96 h-96 rounded-full bg-fin-accent/15 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-fin-accent-secondary/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 py-6">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fin-accent to-fin-accent-secondary flex items-center justify-center mx-auto shadow-lg shadow-fin-accent/25 mb-3">
            <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-fin-text">FinFlow</h1>
          <p className="text-xs text-fin-text-muted mt-1">
            Build your personal financial sovereignty
          </p>
        </div>

        {/* Card Container */}
        <div className="fin-glass-card rounded-3xl p-7 lg:p-8 shadow-2xl space-y-5">
          {/* Header Title */}
          <div>
            <h2 className="text-lg font-bold text-fin-text">
              {step === 'form' && 'Create Account'}
              {step === 'verify' && 'Verify Your Account'}
              {step === 'completed' && 'Registration Complete!'}
            </h2>
            <p className="text-xs text-fin-text-muted">
              {step === 'form' && 'Register to start managing your portfolios & budgets'}
              {step === 'verify' && 'Verify both your email address and mobile number to activate'}
              {step === 'completed' && 'Your account has been fully verified and activated.'}
            </p>
          </div>

          {/* Feedback Banners */}
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

          {/* ============================================================ */}
          {/* STEP 1: Registration Form with all required fields           */}
          {/* ============================================================ */}
          {step === 'form' && (
            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              {/* 1. Full Name */}
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

              {/* 2. Email Address */}
              <div>
                <label className="block text-xs font-semibold text-fin-text-muted mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fin-text-muted" />
                  <input
                    type="email"
                    placeholder="trishav@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
                  />
                </div>
              </div>

              {/* 3. Mobile Number with Country Code */}
              <div>
                <label className="block text-xs font-semibold text-fin-text-muted mb-1">
                  Mobile Number
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
              </div>

              {/* 4. Password */}
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

              {/* 5. Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-fin-text-muted mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-fin-text-muted" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fin-text-muted hover:text-fin-text transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 6. Currency Selection */}
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

              {/* 7. Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fin-accent to-fin-accent-secondary text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <span>Initiating Verification...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ============================================================ */}
          {/* STEP 2: Dual Verification Screen (Email OTP + Mobile OTP)    */}
          {/* ============================================================ */}
          {step === 'verify' && (
            <div className="space-y-4">
              {/* Verification Status Overview Badges */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-fin-card-secondary rounded-2xl border border-fin-border">
                <button
                  type="button"
                  onClick={() => {
                    setVerifyTab('email');
                    setError(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    verifyTab === 'email'
                      ? 'bg-fin-card text-fin-accent shadow-sm'
                      : 'text-fin-text-muted hover:text-fin-text'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                  {emailVerified ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerifyTab('mobile');
                    setError(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    verifyTab === 'mobile'
                      ? 'bg-fin-card text-fin-accent shadow-sm'
                      : 'text-fin-text-muted hover:text-fin-text'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                  {mobileVerified ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </button>
              </div>

              {/* Sub-tab 1: Verify Email OTP */}
              {verifyTab === 'email' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-fin-card-secondary/70 border border-fin-border space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-fin-text-muted">Target Email:</span>
                      <span className="font-semibold text-fin-text">{maskedEmail}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-fin-border/50">
                      <span className="text-fin-text-muted">Status:</span>
                      {emailVerified ? (
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="font-bold text-amber-400">Pending Verification</span>
                      )}
                    </div>
                  </div>

                  {!emailVerified ? (
                    <form onSubmit={handleVerifyEmail} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-fin-text-muted mb-2 text-center">
                          Enter 6-Digit Email Passcode
                        </label>
                        <OtpInput
                          value={emailOtp}
                          onChange={setEmailOtp}
                          length={6}
                          disabled={verifyingEmail || loading}
                          autoFocus={true}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={verifyingEmail || emailOtp.length !== 6}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fin-accent to-fin-accent-secondary text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {verifyingEmail ? (
                          <span>Verifying Email...</span>
                        ) : (
                          <>
                            <span>Verify Email</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-fin-text-muted text-[11px]">Didn't receive email?</span>
                        {emailCooldown > 0 ? (
                          <span className="text-fin-text-muted text-[11px]">
                            Resend in <span className="text-fin-accent font-semibold">{emailCooldown}s</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendEmailOtp}
                            disabled={loading}
                            className="text-fin-accent hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-emerald-400">Email Address Verified</p>
                      {!mobileVerified && (
                        <button
                          type="button"
                          onClick={() => setVerifyTab('mobile')}
                          className="px-4 py-2 rounded-xl bg-fin-accent text-white text-xs font-semibold shadow-sm hover:brightness-110 transition-all inline-flex items-center gap-1.5"
                        >
                          <span>Proceed to Mobile Verification</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: Verify Mobile OTP */}
              {verifyTab === 'mobile' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-fin-card-secondary/70 border border-fin-border space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-fin-text-muted">Target Phone:</span>
                      <span className="font-semibold text-fin-text">{maskedPhone}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-fin-border/50">
                      <span className="text-fin-text-muted">Status:</span>
                      {mobileVerified ? (
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="font-bold text-amber-400">Pending Verification</span>
                      )}
                    </div>
                  </div>

                  {!mobileVerified ? (
                    <form onSubmit={handleVerifyMobile} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-fin-text-muted mb-2 text-center">
                          Enter 6-Digit SMS Passcode
                        </label>
                        <OtpInput
                          value={mobileOtp}
                          onChange={setMobileOtp}
                          length={6}
                          disabled={verifyingMobile || loading}
                          autoFocus={true}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={verifyingMobile || mobileOtp.length !== 6}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fin-accent to-fin-accent-secondary text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {verifyingMobile ? (
                          <span>Verifying Phone...</span>
                        ) : (
                          <>
                            <span>Verify Mobile Number</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-fin-text-muted text-[11px]">Didn't receive SMS?</span>
                        {mobileCooldown > 0 ? (
                          <span className="text-fin-text-muted text-[11px]">
                            Resend in <span className="text-fin-accent font-semibold">{mobileCooldown}s</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendMobileOtp}
                            disabled={loading}
                            className="text-fin-accent hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Resend SMS</span>
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <p className="text-xs font-bold text-emerald-400">Mobile Number Verified</p>
                      {!emailVerified && (
                        <button
                          type="button"
                          onClick={() => setVerifyTab('email')}
                          className="px-4 py-2 rounded-xl bg-fin-accent text-white text-xs font-semibold shadow-sm hover:brightness-110 transition-all inline-flex items-center gap-1.5"
                        >
                          <span>Proceed to Email Verification</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Activate Account Button if both are verified */}
              {emailVerified && mobileVerified && (
                <button
                  type="button"
                  onClick={checkAndCompleteRegistration}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Activate Account & Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Edit Details Option */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-fin-border/50">
                <button
                  type="button"
                  onClick={handleEditDetails}
                  className="text-fin-text-muted hover:text-fin-text flex items-center gap-1 text-[11px]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Change Email or Phone</span>
                </button>

                <Link
                  to="/login"
                  className="text-fin-accent hover:underline text-[11px] font-semibold"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: Completed Screen                                     */}
          {/* ============================================================ */}
          {step === 'completed' && (
            <div className="text-center py-4 space-y-3 animate-in fade-in duration-300">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-fin-text">Account Activated!</h3>
              <p className="text-xs text-fin-text-muted leading-relaxed">
                Your email and mobile number have been verified. Redirecting you to sign in...
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-fin-accent text-white font-semibold text-xs shadow-md"
                >
                  <span>Go to Sign In Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Instant Sandbox Demo (Preserved as requested) */}
          {step === 'form' && (
            <>
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-fin-border w-full" />
                <span className="bg-fin-card px-3 text-[11px] text-fin-text-muted uppercase tracking-wider relative">
                  Or
                </span>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2.5 rounded-xl bg-fin-card-secondary hover:bg-fin-card-hover border border-fin-border hover:border-fin-accent text-fin-text text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Instant Sandbox Demo</span>
              </button>

              <p className="text-center text-xs text-fin-text-secondary pt-2">
                Already have an account?{' '}
                <Link to="/login" className="text-fin-accent font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
