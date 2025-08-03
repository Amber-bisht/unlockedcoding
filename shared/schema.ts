import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// MongoDB Schema Definitions
export interface IUser extends Document {
  username: string;
  password?: string; // Optional for OAuth users
  email?: string;
  isAdmin: boolean;
  banned?: boolean;
  hasCompletedProfile: boolean;
  // Role-based access control
  role?: 'user' | 'teacher' | 'admin';
  // Teacher-specific fields
  teacherApprovalStatus?: 'pending' | 'approved' | 'rejected';
  teacherApprovalDate?: Date;
  teacherApprovedBy?: mongoose.Types.ObjectId;
  teacherRejectionReason?: string;
  fullName?: string;
  bio?: string;
  interest?: string;
  profileImageUrl?: string;
  // New profile fields
  githubLink?: string;
  linkedinLink?: string;
  xLink?: string;
  codeforcesLink?: string;
  leetcodeLink?: string;
  collegeName?: string;
  companyName?: string;
  isPlaced?: boolean;
  // Account deletion
  isDeleted?: boolean;
  deletionReason?: string;
  deletedAt?: Date;
  // OAuth fields
  googleId?: string;
  githubId?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  imageUrl: string;
  categoryId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  instructorName?: string;
  price?: number;
  originalPrice?: number;
  duration: string;
  lessonCount: number;
  rating?: number;
  reviewCount: number;
  order: number;
  learningObjectives: string[];
  requirements: string[];
  targetAudience: string[];
  videoLinks: Array<{ title: string; url: string }>;
  enrollmentLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILesson extends Document {
  title: string;
  description: string;
  content?: string;
  videoUrl?: string;
  duration: string;
  courseId: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  progress: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  telegramUsername?: string;
  purpose: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
  isRead: boolean;
  createdAt: Date;
}

// Mongoose Schemas
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, minlength: 3 },
  password: { 
    type: String, 
    required: function(this: IUser) {
      // Password is required only if not using OAuth
      return !this.googleId && !this.githubId;
    },
    minlength: 6 
  },
  email: { type: String },
  isAdmin: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  hasCompletedProfile: { type: Boolean, default: false },
  // Role-based access control
  role: { type: String, enum: ['user', 'teacher', 'admin'], default: 'user' },
  // Teacher-specific fields
  teacherApprovalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  teacherApprovalDate: { type: Date },
  teacherApprovedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  teacherRejectionReason: { type: String },
  fullName: { type: String, minlength: 2 },
  bio: { type: String },
  interest: { type: String },
  profileImageUrl: { type: String },
  // OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  githubId: { type: String, unique: true, sparse: true },
  avatar: { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, minlength: 2 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true, minlength: 10 },
  imageUrl: { type: String, required: true },
}, {
  timestamps: true
});

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true, minlength: 5 },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true, minlength: 10 },
  longDescription: { type: String },
  imageUrl: { type: String, required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  instructorName: { type: String },
  price: { type: Number, min: 0 },
  originalPrice: { type: Number, min: 0 },
  duration: { type: String, required: true },
  lessonCount: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  order: { type: Number, required: true },
  learningObjectives: [{ type: String }],
  requirements: [{ type: String }],
  targetAudience: [{ type: String }],
  videoLinks: [{
    title: { type: String, required: true },
    url: { type: String, required: true, validate: { validator: (v: string) => /^https?:\/\//.test(v), message: 'URL must start with http:// or https://' } }
  }],
  enrollmentLink: { type: String },
}, {
  timestamps: true
});

const LessonSchema = new Schema<ILesson>({
  title: { type: String, required: true, minlength: 3 },
  description: { type: String, required: true, minlength: 10 },
  content: { type: String },
  videoUrl: { type: String },
  duration: { type: String, required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  position: { type: Number, required: true },
}, {
  timestamps: true
});

const EnrollmentSchema = new Schema<IEnrollment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completed: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Compound index to ensure unique enrollment per user per course
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const ReviewSchema = new Schema<IReview>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true, minlength: 3 },
  content: { type: String, required: true, minlength: 10 },
  rating: { type: Number, required: true, min: 1, max: 5 },
}, {
  timestamps: true
});

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

// Create and export models (with overwrite protection)
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export const Lesson = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
export const Enrollment = mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export const ContactSubmission = mongoose.models.ContactSubmission || mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);

// Zod validation schemas
export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email().optional(),
  isAdmin: z.boolean().default(false),
  hasCompletedProfile: z.boolean().default(false),
  fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
  bio: z.string().optional(),
  interest: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

export const insertProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().optional(),
  interest: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

export const insertCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string(),
});

export const insertCourseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  longDescription: z.string().optional(),
  imageUrl: z.string(),
  categoryId: z.string(),
  instructorId: z.string(),
  instructorName: z.string().optional(),
  price: z.number().min(0).optional(),
  originalPrice: z.number().min(0).optional(),
  duration: z.string(),
  order: z.number(),
  learningObjectives: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  videoLinks: z.array(z.object({
    title: z.string(),
    url: z.string().url()
  })).optional(),
  enrollmentLink: z.string().optional(),
});

export const insertLessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.string(),
  courseId: z.string(),
  position: z.number(),
});

export const insertReviewSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  content: z.string().min(10, "Content must be at least 10 characters").optional(),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  courseId: z.string(),
});

export const insertContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  telegramUsername: z.string().optional(),
  purpose: z.enum(["become_admin", "share_course", "copyright", "other"]),
  message: z.string().min(10, "Message must be at least 10 characters"),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export const insertEnrollmentSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  progress: z.number().default(0),
  completed: z.boolean().default(false),
});

// Type exports
export type User = IUser;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Profile = Pick<IUser, 'fullName' | 'bio' | 'interest' | 'profileImageUrl'>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Category = ICategory;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Course = ICourse;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Lesson = ILesson;
export type InsertLesson = z.infer<typeof insertLessonSchema>;

export type Enrollment = IEnrollment;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;

export type Review = IReview;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ContactSubmission = IContactSubmission;
export type InsertContactSubmission = z.infer<typeof insertContactSchema>; 