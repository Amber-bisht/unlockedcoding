import express from 'express';
import authRoutes from './auth.routes';
import oauthRoutes from './oauth.routes';
import profileRoutes from './profile.routes';
import categoryRoutes from './category.routes';
import courseRoutes from './course.routes';
import lessonRoutes from './lesson.routes';
import adminRoutes from './admin.routes';
import teacherRoutes from './teacher.routes';
import notificationRoutes from './notification.routes';
import contactRoutes from './contact.routes';
import testimonialsRoutes from './testimonials.routes';
import commentRoutes from './comment.routes';
import adRoutes from './ad.routes';
import trackingRoutes from './tracking.routes';
import loginActivityRoutes from './login-activity.routes';
import achievementRoutes from './achievement.routes';
import youtubeRoutes from './youtube.routes';
import copyrightRoutes from './copyright.routes';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Health check endpoint for Docker
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint to trigger activity tracking
router.get('/api/test-activity', isAuthenticated, (req, res) => {
  res.status(200).json({ 
    message: 'Activity triggered successfully',
    timestamp: new Date().toISOString(),
    userId: (req.user as any)?._id
  });
});

// Define API routes
router.use('/api', authRoutes);
router.use('/api/auth', oauthRoutes); // OAuth routes
router.use('/api/profile', profileRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/courses', courseRoutes);
router.use('/api', lessonRoutes); // Using /api as base since lesson routes have complex paths
router.use('/api', adminRoutes); // Admin routes for dashboard functionality
router.use('/api', teacherRoutes); // Teacher routes for teacher functionality
router.use('/api', notificationRoutes); // Notification routes
router.use('/api/contact', contactRoutes); // Contact form submissions
router.use('/api/testimonials', testimonialsRoutes); // Testimonials routes
router.use('/api/comments', commentRoutes); // Comment routes
router.use('/api/ads', adRoutes); // Ad routes
router.use('/api', trackingRoutes); // Tracking routes
router.use('/api/login-activity', loginActivityRoutes); // Login activity routes
router.use('/api/achievements', achievementRoutes); // Achievement routes
router.use('/api/youtube', youtubeRoutes); // YouTube API routes
router.use('/api/copyright', copyrightRoutes); // Copyright dispute routes

export default router;