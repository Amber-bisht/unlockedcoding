import mongoose, { Schema } from 'mongoose';

interface IContactSubmission {
  name: string;
  email: string;
  telegramUsername?: string;
  purpose: 'become_admin' | 'share_course' | 'copyright' | 'other';
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>({
  name: { type: String, required: true, minlength: 2 },
  email: { type: String, required: true },
  telegramUsername: { type: String },
  purpose: { 
    type: String, 
    required: true,
    enum: ['become_admin', 'share_course', 'copyright', 'other']
  },
  message: { type: String, required: true, minlength: 10 },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true
});

export default mongoose.models.ContactSubmission || mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema); 