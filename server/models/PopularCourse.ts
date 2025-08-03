import mongoose, { Document, Schema } from 'mongoose';

export interface IPopularCourse extends Document {
  courseId: mongoose.Types.ObjectId;
  slug: string; // SEO-friendly URL slug
  createdAt: Date;
}

const popularCourseSchema = new Schema<IPopularCourse>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PopularCourse = mongoose.model<IPopularCourse>('PopularCourse', popularCourseSchema);
export default PopularCourse; 