import mongoose, { Document, Schema } from 'mongoose';

export interface ILoginAttempt extends Document {
  ipAddress: string;
  username?: string;
  attemptCount: number;
  lastAttempt: Date;
  isBlocked: boolean;
  blockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const loginAttemptSchema = new Schema<ILoginAttempt>({
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: false,
    index: true
  },
  attemptCount: {
    type: Number,
    default: 0
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedUntil: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
loginAttemptSchema.index({ ipAddress: 1, createdAt: 1 });
loginAttemptSchema.index({ username: 1, createdAt: 1 });

// Auto-delete old records (older than 24 hours)
loginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

export const LoginAttempt = mongoose.model<ILoginAttempt>('LoginAttempt', loginAttemptSchema); 