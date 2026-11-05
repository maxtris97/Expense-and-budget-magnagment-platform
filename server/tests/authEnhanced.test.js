import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validatePasswordStrength } from '../src/controllers/authController.js';
import { normalizePhoneNumber, maskPhoneNumber } from '../src/services/smsService.js';

describe('Enhanced Authentication Features', () => {
  describe('Password Complexity Validation', () => {
    test('rejects short passwords (< 8 characters)', () => {
      const res = validatePasswordStrength('Ab1!');
      assert.equal(res.valid, false);
      assert.match(res.message, /at least 8 characters/);
    });

    test('rejects passwords missing uppercase letters', () => {
      const res = validatePasswordStrength('password123!');
      assert.equal(res.valid, false);
      assert.match(res.message, /uppercase letter/);
    });

    test('rejects passwords missing numbers', () => {
      const res = validatePasswordStrength('Password!@#');
      assert.equal(res.valid, false);
      assert.match(res.message, /number/);
    });

    test('rejects passwords missing special characters', () => {
      const res = validatePasswordStrength('Password123');
      assert.equal(res.valid, false);
      assert.match(res.message, /special character/);
    });

    test('accepts strong, compliant passwords', () => {
      const res = validatePasswordStrength('FinFlow@2026Secure!');
      assert.equal(res.valid, true);
    });
  });

  describe('Phone Number Normalization & Masking', () => {
    test('normalizes Indian phone number with E.164 code', () => {
      const normalized = normalizePhoneNumber('+91', '9876543210');
      assert.equal(normalized, '+919876543210');
    });

    test('normalizes national number containing spaces or dashes', () => {
      const normalized = normalizePhoneNumber('+91', '98765-43210');
      assert.equal(normalized, '+919876543210');
    });

    test('correctly masks phone number for UI display', () => {
      const masked = maskPhoneNumber('+919876543210');
      assert.equal(masked, '+91 ******3210');
    });
  });
});

