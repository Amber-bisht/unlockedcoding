import mongoose, { Document, Schema } from 'mongoose';

export interface IAd extends Document {
  name: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  position: 'categories' | 'courses';
  order: number;
  isActive: boolean;
  clickCount: number;
  loggedInClickCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const adSchema = new Schema<IAd>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Ad name must be at least 2 characters']
  },
  description: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  linkUrl: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    enum: ['categories', 'courses'],
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  loggedInClickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
adSchema.index({ position: 1, order: 1, isActive: 1 });
adSchema.index({ isActive: 1 });

export const Ad = mongoose.model<IAd>('Ad', adSchema); 