import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';
import authApi from '../api/authApi.js';
import PasswordStrengthIndicator from '../components/auth/PasswordStrengthIndicator.jsx';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const resetToken = searchParams.get('resetToken');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token && !resetToken) {
      setError('Password reset token is missing. Please initiate a new recovery request.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    // Frontend validation
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword)) {
      setError('Password must contain at least one special character.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({
        token: token || undefined,
        resetToken: resetToken || undefined,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(err.message || 'Password reset link is invalid or has expired.');
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
            <ShieldCheck className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-fin-text">FinFlow</h1>
          <p className="text-xs text-fin-text-muted mt-1">
            Choose a New Secure Password
          </p>
        </div>

        {/* Card */}
        <div className="fin-glass-card rounded-3xl p-7 lg:p-8 shadow-2xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-fin-text">Set New Password</h2>
            <p className="text-xs text-fin-text-muted">
              Must be at least 8 characters with letters, numbers, and symbols
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4 text-center py-4 animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-fin-text">Password Reset Successful!</h3>
                <p className="text-xs text-fin-text-muted mt-1">
                  Your credentials have been updated securely. Redirecting to login in 3 seconds...
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-fin-accent text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 transition-all"
              >
                <span>Go to Login Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-fin-text-muted mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fin-text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-fin-text-muted hover:text-fin-text transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={newPassword} />

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-fin-text-muted mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-fin-text-muted" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-fin-card-secondary border border-fin-border text-xs text-fin-text focus:border-fin-accent transition-all"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fin-accent to-fin-accent-secondary text-white font-semibold text-xs shadow-md shadow-fin-accent/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <span>Updating Credentials...</span>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-2 text-center border-t border-fin-border/50">
            <Link
              to="/login"
              className="text-xs text-fin-text-muted hover:text-fin-accent transition-colors font-medium"
            >
              Cancel and Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

