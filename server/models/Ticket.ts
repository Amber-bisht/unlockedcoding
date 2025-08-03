import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  ticketId: string;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  reason: 'copyright_infringement' | 'trademark_violation' | 'other';
  disputeLink: string;
  agencyName?: string;
  agencyRepresentative?: string;
  message: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
  adminNotes?: string;
  assignedTo?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const ticketSchema = new Schema<ITicket>({
  ticketId: {
    type: String,
    required: true,
    unique: true,
    default: () => `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['copyright_infringement', 'trademark_violation', 'other']
  },
  disputeLink: {
    type: String,
    required: true,
    trim: true
  },
  agencyName: {
    type: String,
    trim: true
  },
  agencyRepresentative: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'reviewing', 'resolved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
ticketSchema.index({ status: 1, createdAt: -1 });
ticketSchema.index({ userId: 1 });
ticketSchema.index({ ticketId: 1 });

// Pre-save middleware to update resolvedAt when status changes to resolved
ticketSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

export default mongoose.model<ITicket>('Ticket', ticketSchema); 