import React from 'react';
import { Check, X } from 'lucide-react';

export const PasswordStrengthIndicator = ({ password = '' }) => {
  const criteria = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { label: 'One number (0-9)', valid: /[0-9]/.test(password) },
    { label: 'One special symbol (!@#$%...)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password) },
  ];

  const score = criteria.filter((c) => c.valid).length;

  let strengthLabel = 'Very Weak';
  let strengthColor = 'bg-rose-500';
  let textColor = 'text-rose-400';

  if (score === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    textColor = 'text-emerald-400';
  } else if (score >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
    textColor = 'text-amber-400';
  } else if (score >= 1) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-orange-500';
    textColor = 'text-orange-400';
  }

  return (
    <div className="space-y-2 mt-2">
      {/* Visual meter bar */}
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span className="text-fin-text-muted">Password Strength:</span>
        <span className={textColor}>{password ? strengthLabel : 'Required'}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={`h-full rounded-full transition-all duration-300 ${
              i < score ? strengthColor : 'bg-fin-card-secondary border border-fin-border'
            }`}
          />
        ))}
      </div>

      {/* Rules checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 text-[11px]">
        {criteria.map((c, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 transition-colors ${
              c.valid ? 'text-emerald-400 font-medium' : 'text-fin-text-muted'
            }`}
          >
            {c.valid ? (
              <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            ) : (
              <X className="w-3.5 h-3.5 shrink-0 text-fin-text-muted/60" />
            )}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;

