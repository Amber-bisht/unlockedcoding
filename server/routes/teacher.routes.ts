import express from 'express';
import { isTeacher } from '../middleware/auth.middleware';
import { Course, Enrollment, Review } from '../models';
import { logger } from '../utils/logger';

const router = express.Router();

// Get teacher's courses
router.get('/teacher/courses', isTeacher, async (req, res) => {
  try {
    const user = req.user as any;
    const courses = await Course.find({ instructorId: user._id })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({ courseId: course._id });
        const reviews = await Review.find({ courseId: course._id });
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        return {
          _id: course._id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          imageUrl: course.imageUrl,
          price: course.price,
          duration: course.duration,
          enrollmentCount,
          rating: averageRating,
          reviewCount: reviews.length,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        };
      })
    );

    res.status(200).json(coursesWithStats);
  } catch (error) {
    logger.error(`Error fetching teacher courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching teacher courses' });
  }
});

// Get teacher stats
router.get('/teacher/stats', isTeacher, async (req, res) => {
  try {
    const user = req.user as any;
    
    const courses = await Course.find({ instructorId: user._id });
    const courseIds = courses.map(course => course._id);
    
    const totalEnrollments = await Enrollment.countDocuments({ 
      courseId: { $in: courseIds } 
    });
    
    const reviews = await Review.find({ courseId: { $in: courseIds } });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    const stats = {
      totalCourses: courses.length,
      totalEnrollments,
      averageRating,
      totalReviews,
    };

    res.status(200).json(stats);
  } catch (error) {
    logger.error(`Error fetching teacher stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching teacher stats' });
  }
});

// Get teacher's course enrollments
router.get('/teacher/courses/:courseId/enrollments', isTeacher, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user as any;

    // Verify the course belongs to the teacher
    const course = await Course.findOne({ _id: courseId, instructorId: user._id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or access denied' });
    }

    const enrollments = await Enrollment.find({ courseId })
      .populate('userId', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(enrollments);
  } catch (error) {
    logger.error(`Error fetching course enrollments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching course enrollments' });
  }
});

// Get teacher's course reviews
router.get('/teacher/courses/:courseId/reviews', isTeacher, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user as any;

    // Verify the course belongs to the teacher
    const course = await Course.findOne({ _id: courseId, instructorId: user._id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or access denied' });
    }

    const reviews = await Review.find({ courseId })
      .populate('userId', 'username fullName avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    logger.error(`Error fetching course reviews: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching course reviews' });
  }
});

export default router; 