import express from 'express';
import { courseController } from '../controllers';
import { isAdmin, isAuthenticated, isAdminOrTeacher } from '../middleware/auth.middleware';
import { getComments, addComment } from '../controllers/comment.controller';

const router = express.Router();

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/slug/:slug', courseController.getCourseBySlug);
router.get('/:id', courseController.getCourseById);
router.post('/:courseId/enroll', isAuthenticated, courseController.enrollInCourse);
router.get('/:courseId/enrollment', isAuthenticated, courseController.getEnrollmentStatus);
router.get('/:courseId/reviews', courseController.getCourseReviews);
router.post('/:courseId/reviews', isAuthenticated, courseController.createCourseReview);
router.get('/:id/comments', getComments);
router.post('/:id/comments', isAuthenticated, addComment);

// Admin/Teacher routes
router.post('/', isAdminOrTeacher, courseController.createCourse);
router.put('/:id', isAdminOrTeacher, courseController.updateCourse);
router.delete('/:id', isAdminOrTeacher, courseController.deleteCourse);

export default router;