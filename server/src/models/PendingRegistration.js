import mongoose from 'mongoose';

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    countryCode: {
      type: String,
      default: '+91',
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    preferredCurrency: {
      type: String,
      default: 'INR',
    },
    emailOtpHash: {
      type: String,
      default: null,
    },
    emailOtpExpiresAt: {
      type: Date,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    mobileOtpHash: {
      type: String,
      default: null,
    },
    mobileOtpExpiresAt: {
      type: Date,
      default: null,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    emailAttempts: {
      type: Number,
      default: 0,
    },
    mobileAttempts: {
      type: Number,
      default: 0,
    },
    lastEmailSentAt: {
      type: Date,
      default: Date.now,
    },
    lastMobileSentAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // 1-hour TTL automatic cleanup
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for lookup by registration ID or credentials
pendingRegistrationSchema.index({ email: 1, mobileNumber: 1 });

const PendingRegistration = mongoose.model('PendingRegistration', pendingRegistrationSchema);
export default PendingRegistration;

