import mongoose, { Document, Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

// Define user roles
export enum UserRole {
  USER = 'user',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

// Define teacher approval status
export enum TeacherApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Define user interface
export interface IUser extends Document {
  username: string;
  password?: string; // Optional for OAuth users
  email?: string;
  isAdmin: boolean;
  hasCompletedProfile: boolean;
  createdAt: Date;
  banned?: boolean;
  // Role-based access control
  role: UserRole;
  // Teacher-specific fields
  teacherApprovalStatus?: TeacherApprovalStatus;
  teacherApprovalDate?: Date;
  teacherApprovedBy?: mongoose.Types.ObjectId;
  teacherRejectionReason?: string;
  // OAuth fields
  googleId?: string;
  githubId?: string;
  avatar?: string;
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
  updatedAt: Date;
}

// User schema
const userSchema = new Schema<IUser>({
  username: { 
    type: String, 
    required: [true, 'Username is required'], 
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'] 
  },
  password: { 
    type: String, 
    required: function(this: IUser) {
      // Password is required only if not using OAuth
      return !this.googleId && !this.githubId;
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  email: { 
    type: String,
    trim: true 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  },
  hasCompletedProfile: { 
    type: Boolean, 
    default: false 
  },
  banned: {
    type: Boolean,
    default: false
  },
  // Role-based access control
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  // Teacher-specific fields
  teacherApprovalStatus: {
    type: String,
    enum: Object.values(TeacherApprovalStatus)
    // No default - will be undefined until application is submitted
  },
  teacherApprovalDate: {
    type: Date
  },
  teacherApprovedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  teacherRejectionReason: {
    type: String,
    trim: true
  },
  // OAuth fields
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  githubId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  avatar: { 
    type: String 
  },
  fullName: { 
    type: String 
  },
  bio: { 
    type: String 
  },
  interest: { 
    type: String 
  },
  profileImageUrl: { 
    type: String 
  },
  // New profile fields
  githubLink: { 
    type: String,
    trim: true 
  },
  linkedinLink: { 
    type: String,
    trim: true 
  },
  xLink: { 
    type: String,
    trim: true 
  },
  codeforcesLink: { 
    type: String,
    trim: true 
  },
  leetcodeLink: { 
    type: String,
    trim: true 
  },
  collegeName: { 
    type: String,
    trim: true 
  },
  companyName: { 
    type: String,
    trim: true 
  },
  isPlaced: { 
    type: Boolean,
    default: false 
  },
  // Account deletion fields
  isDeleted: { 
    type: Boolean,
    default: false 
  },
  deletionReason: { 
    type: String 
  },
  deletedAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add plugin for better error handling on unique fields
userSchema.plugin(uniqueValidator, { message: '{PATH} already exists' });

// Create virtual for profile
userSchema.virtual('profile', {
  ref: 'Profile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// Helper methods
userSchema.methods.isTeacher = function(): boolean {
  return this.role === UserRole.TEACHER && this.teacherApprovalStatus === TeacherApprovalStatus.APPROVED;
};

userSchema.methods.isApprovedTeacher = function(): boolean {
  return this.role === UserRole.TEACHER && this.teacherApprovalStatus === TeacherApprovalStatus.APPROVED;
};

userSchema.methods.canCreateCourses = function(): boolean {
  return this.isAdmin || this.isApprovedTeacher();
};

export default mongoose.model<IUser>('User', userSchema);