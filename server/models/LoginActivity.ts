import mongoose, { Document, Schema } from 'mongoose';

export interface ILoginActivity extends Document {
  userId: mongoose.Types.ObjectId;
  loginDate: Date;
  loginCount: number;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const loginActivitySchema = new Schema<ILoginActivity>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  loginDate: {
    type: Date,
    required: true,
    index: true
  },
  loginCount: {
    type: Number,
    default: 1,
    min: 1
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  sessionId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries by user and date
loginActivitySchema.index({ userId: 1, loginDate: 1 }, { unique: true });

// Index for date range queries
loginActivitySchema.index({ loginDate: -1 });

export default mongoose.model<ILoginActivity>('LoginActivity', loginActivitySchema); 