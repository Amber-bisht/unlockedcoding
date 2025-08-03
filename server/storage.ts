import session from "express-session";
import connectMongo from "connect-mongo";
import { 
  User, 
  Category, 
  Course, 
  Lesson, 
  Enrollment, 
  Review, 
  ContactSubmission,
  type InsertUser, 
  type InsertProfile,
  type InsertCategory,
  type InsertCourse,
  type InsertLesson,
  type InsertReview,
  type InsertContactSubmission
} from "@shared/schema";
import { connectDB } from "@db";

// Extend session interface
declare module "express-session" {
  interface SessionData {
    userId: string;
    isAdmin: boolean;
  }
}

export interface IStorage {
  // User management
  createUser(userData: InsertUser): Promise<User>;
  getUser(id: string): Promise<User>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByGoogleId(googleId: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  
  // Profile management
  createOrUpdateProfile(userId: string, profileData: InsertProfile): Promise<void>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(categoryData: InsertCategory): Promise<Category>;
  updateCategory(id: string, categoryData: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Courses
  getCourses(): Promise<Course[]>;
  getCourseById(id: string): Promise<Course | null>;
  getCourseBySlug(slug: string): Promise<Course | null>;
  getCoursesByCategory(categoryId: string): Promise<Course[]>;
  getCoursesByCategorySlug(slug: string): Promise<Course[]>;
  createCourse(courseData: InsertCourse): Promise<Course>;
  updateCourse(id: string, courseData: Partial<Course>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;
  
  // Lessons
  getLessonsByCourse(courseId: string): Promise<Lesson[]>;
  getLessonById(id: string): Promise<Lesson | null>;
  createLesson(lessonData: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, lessonData: Partial<Lesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;
  
  // Enrollments
  enrollUserInCourse(userId: string, courseId: string): Promise<Enrollment>;
  getUserEnrollments(userId: string): Promise<Enrollment[]>;
  checkUserEnrollment(userId: string, courseId: string): Promise<boolean>;
  updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<void>;
  
  // Reviews
  getCourseReviews(courseId: string): Promise<Review[]>;
  createReview(reviewData: InsertReview): Promise<Review>;
  updateReview(id: string, reviewData: Partial<Review>): Promise<Review>;
  deleteReview(id: string): Promise<void>;
  
  // Contact submissions
  createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  getContactSubmissionById(id: string): Promise<ContactSubmission | null>;
  markContactSubmissionAsRead(id: string): Promise<void>;
  deleteContactSubmission(id: string): Promise<void>;
  
  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    // Session store will be initialized after database connection
    this.sessionStore = null;
  }
  
  initializeSessionStore() {
    if (!this.sessionStore) {
      this.sessionStore = connectMongo.create({

        mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://bishtamber0:ispRUER29IIYsKpR@cluster0.f2mvi.mongodb.net/unlocked-coding',
        collectionName: 'sessions',
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native', // Use MongoDB's native TTL index
      });
    }
    return this.sessionStore;
  }
  
  // User management
  async createUser(userData: InsertUser): Promise<User> {
    const user = new User(userData);
    return await user.save();
  }
  
  async getUser(id: string): Promise<User> {
    const user = await User.findById(id);
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user;
  }
  
    async getUserByUsername(username: string): Promise<User | null> {
    return await User.findOne({ username });
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await User.findOne({ googleId });
  }

  async getAllUsers(): Promise<User[]> {
    return await User.find().sort({ createdAt: -1 });
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const user = await User.findByIdAndUpdate(id, userData, { new: true });
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    return user;
  }
  
  // Profile management
  async createOrUpdateProfile(userId: string, profileData: InsertProfile): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      ...profileData,
      hasCompletedProfile: true,
      updatedAt: new Date(),
    });
  }
  
  // Categories
  async getCategories(): Promise<Category[]> {
    return await Category.find().sort({ name: 1 });
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return await Category.findOne({ slug });
  }
  
  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const category = new Category(categoryData);
    return await category.save();
  }
  
  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    const category = await Category.findByIdAndUpdate(id, {
      ...categoryData,
      updatedAt: new Date(),
    }, { new: true });
    
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }
  
  async deleteCategory(id: string): Promise<void> {
    const result = await Category.findByIdAndDelete(id);
    if (!result) {
      throw new Error(`Category with ID ${id} not found`);
    }
  }
  
  // Courses
  async getCourses(): Promise<Course[]> {
    return await Course.find()
      .populate('categoryId', 'name slug')
      .populate('instructorId', 'username fullName')
      .sort({ order: 1, createdAt: -1 }) as Course[];
  }
  
  async getCourseById(id: string): Promise<Course | null> {
    return await Course.findById(id)
      .populate('categoryId', 'name slug')
      .populate('instructorId', 'username fullName') as Course | null;
  }
  
  async getCourseBySlug(slug: string): Promise<Course | null> {
    return await Course.findOne({ slug });
  }

  async getCoursesByCategory(categoryId: string): Promise<Course[]> {
    return await Course.find({ categoryId })
      .populate('categoryId', 'name slug')
      .populate('instructorId', 'username fullName')
      .sort({ order: 1, createdAt: -1 }) as Course[];
  }
  
  async getCoursesByCategorySlug(slug: string): Promise<Course[]> {
    const category = await Category.findOne({ slug });
    if (!category) {
      return [];
    }
    
    return await Course.find({ categoryId: category._id })
      .populate('categoryId', 'name slug')
      .populate('instructorId', 'username fullName')
      .sort({ order: 1, createdAt: -1 }) as Course[];
  }
  
  async createCourse(courseData: InsertCourse): Promise<Course> {
    let lessonCount = 0;
    if (Array.isArray(courseData.videoLinks) && courseData.videoLinks.length > 0) {
      lessonCount = courseData.videoLinks.length;
    } else if (typeof (courseData as any).lessonCount === 'number') {
      lessonCount = (courseData as any).lessonCount;
    }
    const course = new Course({
      ...courseData,
      lessonCount,
    });
    return await course.save();
  }
  
  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    let lessonCountUpdate = {};
    if (Array.isArray(courseData.videoLinks) && courseData.videoLinks.length > 0) {
      lessonCountUpdate = { lessonCount: courseData.videoLinks.length };
    } else if (typeof (courseData as any).lessonCount === 'number') {
      lessonCountUpdate = { lessonCount: (courseData as any).lessonCount };
    }
    const course = await Course.findByIdAndUpdate(id, {
      ...courseData,
      ...lessonCountUpdate,
      updatedAt: new Date(),
    }, { new: true });
    
    if (!course) {
      throw new Error(`Course with ID ${id} not found`);
    }
    return course;
  }
  
  async deleteCourse(id: string): Promise<void> {
    const result = await Course.findByIdAndDelete(id);
    if (!result) {
      throw new Error(`Course with ID ${id} not found`);
    }
    
    // Delete related lessons and enrollments
    await Lesson.deleteMany({ courseId: id });
    await Enrollment.deleteMany({ courseId: id });
    await Review.deleteMany({ courseId: id });
  }
  
  // Lessons
  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return await Lesson.find({ courseId }).sort({ position: 1 });
  }
  
  async getLessonById(id: string): Promise<Lesson | null> {
    return await Lesson.findById(id);
  }
  
  async createLesson(lessonData: InsertLesson): Promise<Lesson> {
    const lesson = new Lesson(lessonData);
    const savedLesson = await lesson.save();
    
    // Update course lesson count
    await this.updateCourseLessonCount(lessonData.courseId);
    
    return savedLesson;
  }
  
  async updateLesson(id: string, lessonData: Partial<Lesson>): Promise<Lesson> {
    const lesson = await Lesson.findByIdAndUpdate(id, {
      ...lessonData,
      updatedAt: new Date(),
    }, { new: true });
    
    if (!lesson) {
      throw new Error(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }
  
  async deleteLesson(id: string): Promise<void> {
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      throw new Error(`Lesson with ID ${id} not found`);
    }
    
    await Lesson.findByIdAndDelete(id);
    
    // Update course lesson count
    await this.updateCourseLessonCount(lesson.courseId.toString());
  }
  
  private async updateCourseLessonCount(courseId: string): Promise<void> {
    const lessonCount = await Lesson.countDocuments({ courseId });
    await Course.findByIdAndUpdate(courseId, { lessonCount });
  }
  
  // Enrollments
  async enrollUserInCourse(userId: string, courseId: string): Promise<Enrollment> {
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      throw new Error('User is already enrolled in this course');
    }
    
    const enrollment = new Enrollment({
      userId,
      courseId,
      progress: 0,
      completed: false,
    });
    
    return await enrollment.save();
  }
  
  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return await Enrollment.find({ userId })
      .populate('courseId')
      .populate('userId', 'username fullName')
      .sort({ createdAt: -1 }) as Enrollment[];
  }
  
  async checkUserEnrollment(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await Enrollment.findOne({ userId, courseId });
    return !!enrollment;
  }
  
  async updateEnrollmentProgress(userId: string, courseId: string, progress: number): Promise<void> {
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId },
      { 
        progress,
        completed: progress >= 100,
        updatedAt: new Date(),
      },
      { new: true }
    );
    
    if (!enrollment) {
      throw new Error('Enrollment not found');
    }
  }
  
  // Reviews
  async getCourseReviews(courseId: string): Promise<Review[]> {
    return await Review.find({ courseId })
      .populate('userId', 'username fullName')
      .sort({ createdAt: -1 }) as Review[];
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const review = new Review(reviewData);
    const savedReview = await review.save();
    
    // Update course rating
    await this.updateCourseRating(reviewData.courseId);
    
    return savedReview;
  }
  
  async updateReview(id: string, reviewData: Partial<Review>): Promise<Review> {
    const review = await Review.findByIdAndUpdate(id, {
      ...reviewData,
      updatedAt: new Date(),
    }, { new: true });
    
    if (!review) {
      throw new Error(`Review with ID ${id} not found`);
    }
    
    // Update course rating
    await this.updateCourseRating(review.courseId.toString());
    
    return review;
  }
  
  async deleteReview(id: string): Promise<void> {
    const review = await Review.findById(id);
    if (!review) {
      throw new Error(`Review with ID ${id} not found`);
    }
    
    await Review.findByIdAndDelete(id);
    
    // Update course rating
    await this.updateCourseRating(review.courseId.toString());
  }
  
  private async updateCourseRating(courseId: string): Promise<void> {
    const reviews = await Review.find({ courseId });
    
    if (reviews.length === 0) {
      await Course.findByIdAndUpdate(courseId, {
        rating: undefined,
        reviewCount: 0,
      });
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: reviews.length,
    });
  }
  
  // Contact submissions
  async createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission> {
    const submission = new ContactSubmission(data);
    return await submission.save();
  }
  
  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await ContactSubmission.find().sort({ createdAt: -1 });
  }
  
  async getContactSubmissionById(id: string): Promise<ContactSubmission | null> {
    return await ContactSubmission.findById(id);
  }
  
  async markContactSubmissionAsRead(id: string): Promise<void> {
    const result = await ContactSubmission.findByIdAndUpdate(id, { isRead: true });
    if (!result) {
      throw new Error(`Contact submission with ID ${id} not found`);
    }
  }
  
  async deleteContactSubmission(id: string): Promise<void> {
    const result = await ContactSubmission.findByIdAndDelete(id);
    if (!result) {
      throw new Error(`Contact submission with ID ${id} not found`);
    }
  }
}

// Create and export storage instance
export const storage = new DatabaseStorage();
