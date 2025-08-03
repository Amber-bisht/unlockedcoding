import mongoose, { Document, Schema } from 'mongoose';

// Define achievement interface
export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Achievement schema
const achievementSchema = new Schema<IAchievement>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  type: { 
    type: String, 
    required: true,
    enum: ['profile_completion', 'course_completion', 'streak', 'engagement', 'milestone']
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  icon: { 
    type: String, 
    required: true 
  },
  points: { 
    type: Number, 
    default: 0 
  },
  isUnlocked: { 
    type: Boolean, 
    default: false 
  },
  unlockedAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create compound index to prevent duplicate achievements
achievementSchema.index({ userId: 1, type: 1 }, { unique: true });

// Create virtuals for relationships
achievementSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

export default mongoose.model<IAchievement>('Achievement', achievementSchema); 