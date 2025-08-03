import mongoose, { Document, Schema } from 'mongoose';

export interface ITrackingEvent extends Document {
  trackingLinkId: mongoose.Types.ObjectId;
  eventType: 'click' | 'login';
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const trackingEventSchema = new Schema<ITrackingEvent>({
  trackingLinkId: {
    type: Schema.Types.ObjectId,
    ref: 'TrackingLink',
    required: true,
    index: true
  },
  eventType: {
    type: String,
    enum: ['click', 'login'],
    required: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  referrer: {
    type: String,
    trim: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
trackingEventSchema.index({ trackingLinkId: 1, eventType: 1, timestamp: -1 });
trackingEventSchema.index({ timestamp: -1 });

export default mongoose.model<ITrackingEvent>('TrackingEvent', trackingEventSchema); 