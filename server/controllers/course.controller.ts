import { Request, Response } from 'express';
import { storage } from '../storage';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import { insertReviewSchema } from '@shared/schema';
import { reviewRateLimiter } from '../utils/rate-limiter';

// Get all courses
export const getAllCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await storage.getCourses();
    // Remove instructorId from response and ensure lessonCount/rating
    const filteredCourses = courses.map((course: any) => {
      const obj = course.toObject ? course.toObject() : course;
      const { instructorId, ...rest } = obj;
      return {
        ...rest,
        lessonCount: typeof rest.lessonCount === 'number' ? rest.lessonCount : 0,
        rating: typeof rest.rating === 'number' ? rest.rating : 0,
      };
    });
    res.status(200).json(filteredCourses);
  } catch (error) {
    logger.error(`Get all courses error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching courses' });
  }
};

// Get course by ID
export const getCourseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
    }
    
    const course = await storage.getCourseById(id);
    
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    // Remove instructorId from response and ensure lessonCount/rating
    const obj = course.toObject ? course.toObject() : course;
    const { instructorId, ...rest } = obj;
    res.status(200).json({
      ...rest,
      lessonCount: typeof rest.lessonCount === 'number' ? rest.lessonCount : 0,
      rating: typeof rest.rating === 'number' ? rest.rating : 0,
    });
  } catch (error) {
    logger.error(`Get course by ID error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching course' });
  }
};

// Get course by slug
export const getCourseBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    
    const course = await storage.getCourseById(slug);
    
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    res.status(200).json(course);
  } catch (error) {
    logger.error(`Get course by slug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching course' });
  }
};

// Get courses by category slug
export const getCoursesByCategorySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    
    const courses = await storage.getCoursesByCategorySlug(slug);
    
    // Remove instructorId from response and ensure lessonCount/rating
    const filteredCourses = courses.map((course: any) => {
      const obj = course.toObject ? course.toObject() : course;
      const { instructorId, ...rest } = obj;
      return {
        ...rest,
        lessonCount: typeof rest.lessonCount === 'number' ? rest.lessonCount : 0,
        rating: typeof rest.rating === 'number' ? rest.rating : 0,
      };
    });
    res.status(200).json(filteredCourses);
  } catch (error) {
    logger.error(`Get courses by category slug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching courses by category' });
  }
};

// Create new course (admin or approved teacher)
export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin or approved teacher
    const user = req.user as any;
    
    // Debug logging for user object
    logger.info(`User object: ${JSON.stringify({
      user: user,
      userId: user?._id,
      username: user?.username,
      isAdmin: user?.isAdmin,
      role: user?.role,
      teacherApprovalStatus: user?.teacherApprovalStatus,
      session: req.session,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : 'function not available'
    })}`);
    
    if (!user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    // Check if user is admin or approved teacher
    const isAdmin = user.isAdmin;
    const isApprovedTeacher = user.role === 'teacher' && user.teacherApprovalStatus === 'approved';
    
    if (!isAdmin && !isApprovedTeacher) {
      res.status(403).json({ message: 'Forbidden: Admin or approved teacher access required' });
      return;
    }
    
    const { title, description, imageUrl, price, duration, categoryId, enrollmentLink, instructorName, videoLinks, longDescription, learningObjectives, requirements, targetAudience, originalPrice, order } = req.body;
    
    // Get the actual user from database to ensure we have the correct ID
    let actualUser;
    if (user._id && mongoose.Types.ObjectId.isValid(user._id)) {
      actualUser = await storage.getUser(user._id.toString());
    } else if (user.username) {
      actualUser = await storage.getUserByUsername(user.username);
    } else {
      res.status(400).json({ message: 'Invalid user session' });
      return;
    }
    
    if (!actualUser) {
      res.status(400).json({ message: 'User not found' });
      return;
    }
    
    if (!actualUser._id) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    // Debug logging
    logger.info(`Creating course with data: ${JSON.stringify({
      title,
      categoryId,
      instructorId: actualUser._id,
      userType: typeof actualUser._id
    })}`);
    
    // Create slug from title
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    
    // Check if course with slug already exists
    const existingCourse = await storage.getCourseBySlug(slug);
    if (existingCourse) {
      res.status(400).json({ message: 'Course with this title already exists' });
      return;
    }
    
    // Check if category exists
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }
    
    // Create new course
    const course = await storage.createCourse({
      title,
      slug,
      description,
      imageUrl,
      price,
      duration,
      categoryId,
      instructorId: actualUser._id.toString(), // Convert to string as expected by InsertCourse type
      videoLinks: videoLinks || [],
      enrollmentLink,
      instructorName,
      longDescription,
      learningObjectives,
      requirements,
      targetAudience,
      originalPrice,
      order: order || 0, // Set default order if not provided
    });
    
    const populatedCourse = await storage.getCourseById(course._id.toString());
    
    res.status(201).json(populatedCourse);
  } catch (error) {
    logger.error(`Create course error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error creating course' });
  }
};

// Update course (admin or course owner)
export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
    }
    
    // Check if course exists
    const course = await storage.getCourseById(id);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    // Check if user is admin or the course owner (teacher)
    const isAdmin = user?.isAdmin;
    const isCourseOwner = user?.role === 'teacher' && 
                         user?.teacherApprovalStatus === 'approved' && 
                         (course.instructorId?._id?.toString() === user?.id || 
                          course.instructorId?.toString() === user?.id);
    
    if (!isAdmin && !isCourseOwner) {
      res.status(403).json({ message: 'Forbidden: Admin or course owner access required' });
      return;
    }
    
    const { title, description, imageUrl, price, duration, categoryId, enrollmentLink, instructorName, videoLinks, longDescription, learningObjectives, requirements, targetAudience, originalPrice } = req.body;
    
    // Create new slug if title changes
    let slug = course.slug;
    if (title && title !== course.title) {
      slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      
      // Check if new slug already exists
      const existingCourse = await storage.getCourseById(slug);
      
      if (existingCourse && existingCourse._id.toString() !== id) {
        res.status(400).json({ message: 'Course with this title already exists' });
        return;
      }
    }
    
    // Check if category exists if categoryId is provided
    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId)) {
      res.status(400).json({ message: 'Invalid category ID' });
      return;
    }
    
    // Update course
    const updatedCourse = await storage.updateCourse(id, {
      title,
      slug,
      description,
      imageUrl,
      price,
      duration,
      categoryId,
      videoLinks: videoLinks || [],
      enrollmentLink,
      instructorName,
      longDescription,
      learningObjectives,
      requirements,
      targetAudience,
      originalPrice,
    });
    
    res.status(200).json(updatedCourse);
  } catch (error) {
    logger.error(`Update course error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error updating course' });
  }
};

// Delete course (admin or course owner)
export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid course ID' });
      return;
    }
    
    // Check if course exists
    const course = await storage.getCourseById(id);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    // Check if user is admin or the course owner (teacher)
    const isAdmin = user?.isAdmin;
    const isCourseOwner = user?.role === 'teacher' && 
                         user?.teacherApprovalStatus === 'approved' && 
                         (course.instructorId?._id?.toString() === user?.id || 
                          course.instructorId?.toString() === user?.id);
    
    // Debug logging
    logger.info(`Delete course debug - User: ${JSON.stringify({
      id: user?.id,
      role: user?.role,
      teacherApprovalStatus: user?.teacherApprovalStatus,
      isAdmin: user?.isAdmin
    })}`);
    logger.info(`Delete course debug - Course: ${JSON.stringify({
      id: course._id,
      instructorId: course.instructorId,
      instructorIdType: typeof course.instructorId,
      instructorIdId: course.instructorId?._id,
      instructorIdString: course.instructorId?.toString()
    })}`);
    logger.info(`Delete course debug - Access check: ${JSON.stringify({
      isAdmin,
      isCourseOwner,
      userRole: user?.role,
      teacherStatus: user?.teacherApprovalStatus,
      userIdMatch: course.instructorId?._id?.toString() === user?.id || course.instructorId?.toString() === user?.id
    })}`);
    
    if (!isAdmin && !isCourseOwner) {
      res.status(403).json({ message: 'Forbidden: Admin or course owner access required' });
      return;
    }
    
    // Delete course
    await storage.deleteCourse(id);
    
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    logger.error(`Delete course error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error deleting course' });
  }
};

// Enroll in a course
export const enrollInCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const userId = (req.user as any)?._id || (req.session as any)?.passport?.user;
    const { courseId } = req.params;
    if (!userId || !courseId) {
      res.status(400).json({ message: 'Missing user or course ID' });
      return;
    }
    const enrollment = await storage.enrollUserInCourse(userId, courseId);
    res.status(201).json(enrollment);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already enrolled')) {
      res.status(400).json({ message: error.message });
    } else {
      logger.error(`Enroll in course error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ message: 'Error enrolling in course' });
    }
  }
};

// Check if user is enrolled in a course
export const getEnrollmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ enrolled: false, message: 'Not authenticated' });
      return;
    }
    const userId = (req.user as any)?._id || (req.session as any)?.passport?.user;
    const { courseId } = req.params;
    if (!userId || !courseId) {
      res.status(400).json({ enrolled: false, message: 'Missing user or course ID' });
      return;
    }
    const isEnrolled = await storage.checkUserEnrollment(userId, courseId);
    res.json({ enrolled: isEnrolled });
  } catch (error) {
    logger.error(`Get enrollment status error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ enrolled: false, message: 'Error checking enrollment status' });
  }
};

// Get all reviews for a course
export const getCourseReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      res.status(400).json({ message: 'Missing course ID' });
      return;
    }
    const reviews = await storage.getCourseReviews(courseId);
    res.status(200).json(reviews);
  } catch (error) {
    logger.error(`Get course reviews error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching course reviews' });
  }
};

// Create a review for a course
export const createCourseReview = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const userId = (req.user as any)?._id || (req.session as any)?.passport?.user;
    const { courseId } = req.params;
    if (!userId || !courseId) {
      res.status(400).json({ message: 'Missing user or course ID' });
      return;
    }

    // Check rate limit for review submissions
    const rateLimitStatus = await reviewRateLimiter.isUserRateLimited(userId.toString());
    if (rateLimitStatus.limited) {
      const remainingTime = reviewRateLimiter.formatRemainingTime(rateLimitStatus.remainingTime || 0);
      logger.warn(`User ${userId} rate limited for review submission - ${remainingTime} remaining`);
      res.status(429).json({ 
        message: `Rate limit exceeded. You can submit ${rateLimitStatus.remainingAttempts} more reviews today. Please try again in ${remainingTime}.`,
        limited: true,
        remainingTime: rateLimitStatus.remainingTime,
        remainingAttempts: rateLimitStatus.remainingAttempts
      });
      return;
    }

    // Record the attempt
    const attemptResult = await reviewRateLimiter.recordAttempt(userId.toString());
    if (attemptResult.limited) {
      const remainingTime = reviewRateLimiter.formatRemainingTime(attemptResult.remainingTime || 0);
      logger.warn(`User ${userId} blocked after review submission attempt - ${remainingTime} remaining`);
      res.status(429).json({ 
        message: `Rate limit exceeded. Please try again in ${remainingTime}.`,
        limited: true,
        remainingTime: attemptResult.remainingTime
      });
      return;
    }

    // Validate input
    const parsed = insertReviewSchema.safeParse({ ...req.body, courseId });
    if (!parsed.success) {
      res.status(400).json({ errors: parsed.error.errors });
      return;
    }
    // Check if review already exists
    const existing = await storage.getCourseReviews(courseId);
    if (existing.some(r => r.userId.toString() === userId.toString())) {
      res.status(400).json({ message: 'You have already reviewed this course.' });
      return;
    }
    // Create review
    const review = await storage.createReview({ ...parsed.data });

    // Reset rate limit on successful review
    await reviewRateLimiter.resetAttempts(userId.toString());

    res.status(201).json({
      ...review,
      rateLimitInfo: {
        remainingAttempts: attemptResult.remainingAttempts,
        limit: 5
      }
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'You have already reviewed this course.' });
    } else {
      logger.error(`Create review error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ message: 'Error creating review' });
    }
  }
};