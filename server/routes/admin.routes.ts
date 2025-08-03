import express from 'express';
import { User, Course, Category, Enrollment, PopularCourse, Lesson, Review, Comment, Notification, ContactSubmission, Ticket } from '../models';
import { banUser, getAllUsers } from '../controllers/auth.controller';
import adminController from '../controllers/admin.controller';
import { isAdmin } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';
import { UserRole, TeacherApprovalStatus } from '../models/User';

const router = express.Router();

// Get total users count
router.get('/admin/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    logger.error(`Error getting users count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching users count' });
  }
});

// Get total courses count
router.get('/admin/courses/count', async (req, res) => {
  try {
    const count = await Course.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    logger.error(`Error getting courses count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching courses count' });
  }
});

// Get total categories count
router.get('/admin/categories/count', async (req, res) => {
  try {
    const count = await Category.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    logger.error(`Error getting categories count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching categories count' });
  }
});

// Get total enrollments count
router.get('/admin/enrollments/count', async (req, res) => {
  try {
    const count = await Enrollment.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    logger.error(`Error getting enrollments count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching enrollments count' });
  }
});

// Teacher Applications Management
router.get('/admin/teacher-applications', isAdmin, async (req, res) => {
  try {
    const applications = await User.find({
      teacherApprovalStatus: { $exists: true }
    }).select('-password').sort({ createdAt: -1 });

    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.teacherApprovalStatus === TeacherApprovalStatus.PENDING).length,
      approved: applications.filter(app => app.teacherApprovalStatus === TeacherApprovalStatus.APPROVED).length,
      rejected: applications.filter(app => app.teacherApprovalStatus === TeacherApprovalStatus.REJECTED).length,
    };

    res.status(200).json({ applications, stats });
  } catch (error) {
    logger.error(`Error fetching teacher applications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching teacher applications' });
  }
});

router.post('/admin/teacher-applications/:id/approve', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminUser = req.user as any;

    const application = await User.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.role = UserRole.TEACHER;
    application.teacherApprovalStatus = TeacherApprovalStatus.APPROVED;
    application.teacherApprovalDate = new Date();
    application.teacherApprovedBy = adminUser._id;

    await application.save();

    logger.info(`Teacher application approved by admin ${adminUser.username} for user ${application.username}`);

    res.status(200).json({ message: 'Teacher application approved successfully' });
  } catch (error) {
    logger.error(`Error approving teacher application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error approving teacher application' });
  }
});

router.post('/admin/teacher-applications/:id/reject', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminUser = req.user as any;

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const application = await User.findById(id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.teacherApprovalStatus = TeacherApprovalStatus.REJECTED;
    application.teacherRejectionReason = reason.trim();
    application.teacherApprovalDate = new Date();
    application.teacherApprovedBy = adminUser._id;

    await application.save();

    logger.info(`Teacher application rejected by admin ${adminUser.username} for user ${application.username}`);

    res.status(200).json({ message: 'Teacher application rejected successfully' });
  } catch (error) {
    logger.error(`Error rejecting teacher application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error rejecting teacher application' });
  }
});

// Add a course to popular courses
router.post('/admin/popular-courses', isAdmin, async (req, res) => {
  try {
    const { courseId, slug } = req.body;
    if (!courseId || !slug) {
      return res.status(400).json({ message: 'courseId and slug are required' });
    }
    const exists = await PopularCourse.findOne({ courseId });
    if (exists) {
      return res.status(409).json({ message: 'Course is already marked as popular' });
    }
    const newPopular = await PopularCourse.create({ courseId, slug });
    res.status(201).json(newPopular);
  } catch (error) {
    logger.error(`Error adding popular course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error adding popular course' });
  }
});

// Remove a course from popular courses
router.delete('/admin/popular-courses/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PopularCourse.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Popular course not found' });
    }
    res.status(200).json({ message: 'Popular course removed' });
  } catch (error) {
    logger.error(`Error removing popular course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error removing popular course' });
  }
});

// List all popular courses
router.get('/admin/popular-courses', isAdmin, async (_req, res) => {
  try {
    const popularCourses = await PopularCourse.find().populate('courseId');
    res.status(200).json(popularCourses);
  } catch (error) {
    logger.error(`Error fetching popular courses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching popular courses' });
  }
});

// Get dashboard summary stats
router.get('/admin/dashboard/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const courseCount = await Course.countDocuments();
    const categoryCount = await Category.countDocuments();
    const enrollmentCount = await Enrollment.countDocuments();
    const lessonCount = await Lesson.countDocuments();
    const reviewCount = await Review.countDocuments();
    const commentCount = await Comment.countDocuments();
    const notificationCount = await Notification.countDocuments();
    const contactSubmissionCount = await ContactSubmission.countDocuments();
    const unreadContactCount = await ContactSubmission.countDocuments({ isRead: false });
    const popularCourseCount = await PopularCourse.countDocuments();
    const copyrightTicketCount = await Ticket.countDocuments();
    const pendingCopyrightTickets = await Ticket.countDocuments({ status: 'pending' });
    const reviewingCopyrightTickets = await Ticket.countDocuments({ status: 'reviewing' });
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentCourses = await Course.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentEnrollments = await Enrollment.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const recentReviews = await Review.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    

    
    // Get recent contact submissions
    const recentContacts = await ContactSubmission.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Get recent reviews
    const recentReviewsList = await Review.find()
      .populate('userId', 'username fullName')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    res.status(200).json({
      // Basic stats
      users: userCount,
      courses: courseCount,
      categories: categoryCount,
      enrollments: enrollmentCount,
      lessons: lessonCount,
      reviews: reviewCount,
      comments: commentCount,
      notifications: notificationCount,
      contactSubmissions: contactSubmissionCount,
      unreadContacts: unreadContactCount,
      popularCourses: popularCourseCount,
      copyrightTickets: copyrightTicketCount,
      pendingCopyrightTickets,
      reviewingCopyrightTickets,
      
      // Recent activity (7 days)
      recentUsers,
      recentCourses,
      recentEnrollments,
      recentReviews,
      
      // Detailed data
      recentContacts,
      recentReviewsList
    });
  } catch (error) {
    logger.error(`Error getting dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

router.get('/admin/users', isAdmin, getAllUsers);
router.patch('/users/:id/ban', isAdmin, banUser);

// Account deletion analytics
router.get('/admin/analytics/deletions', isAdmin, adminController.getAccountDeletionAnalytics);

// User management
router.get('/admin/users/all', isAdmin, adminController.getAllUsers);
router.get('/admin/users/deleted', isAdmin, adminController.getDeletedUsers);

// Placement statistics
router.get('/admin/analytics/placement', isAdmin, adminController.getUserPlacementStats);

// Copyright Tickets Management
router.get('/admin/copyright-tickets', isAdmin, adminController.getAllCopyrightTickets);
router.patch('/admin/copyright-tickets/:ticketId/status', isAdmin, adminController.updateCopyrightTicketStatus);
router.delete('/admin/copyright-tickets/:ticketId', isAdmin, adminController.deleteCopyrightTicket);

export default router;