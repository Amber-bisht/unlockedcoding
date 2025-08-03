import mongoose, { Document, Schema } from 'mongoose';

export interface ITrackingLink extends Document {
  name: string;
  description?: string;
  targetUrl: string;
  trackingCode?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  clickCount: number;
  loginCount: number;
  conversionRate: number;
  trackingUrl: string;
  updateConversionRate(): Promise<ITrackingLink>;
}

const trackingLinkSchema = new Schema<ITrackingLink>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  targetUrl: {
    type: String,
    required: [true, 'Target URL is required'],
    trim: true
  },
  trackingCode: {
    type: String,
    unique: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  loginCount: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full tracking URL
trackingLinkSchema.virtual('trackingUrl').get(function() {
  return `${process.env.BASE_URL || 'http://localhost:5000'}/api/track/${this.trackingCode}`;
});



// Method to generate unique tracking code
trackingLinkSchema.statics.generateTrackingCode = function(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Pre-save middleware to generate tracking code if not provided
trackingLinkSchema.pre('save', function(next) {
  if (!this.trackingCode) {
    this.trackingCode = (this.constructor as any).generateTrackingCode();
  }
  next();
});

// Method to update conversion rate
trackingLinkSchema.methods.updateConversionRate = function() {
  if (this.clickCount > 0) {
    this.conversionRate = (this.loginCount / this.clickCount) * 100;
  }
  return this.save();
};



export default mongoose.model<ITrackingLink>('TrackingLink', trackingLinkSchema); 