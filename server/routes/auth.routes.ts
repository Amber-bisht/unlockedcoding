import express from 'express';
import { login, register, logout, getCurrentUser, updateProfile, banUser, getAllUsers, adminLoginWithGoogleId } from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import { UserRole, TeacherApprovalStatus } from '../models/User';
import { logger } from '../utils/logger';

const router = express.Router();

// Login route
router.post('/auth/login', login);

// Login route (alternative endpoint for frontend compatibility)
router.post('/login', login);

// Admin login with Google ID route
router.post('/admin-login-google', adminLoginWithGoogleId);

// Register route
router.post('/auth/register', register);

// Logout route
router.post('/auth/logout', logout);

// Logout route (alternative endpoint for frontend compatibility)
router.post('/logout', logout);

// Get current user
router.get('/auth/me', isAuthenticated, getCurrentUser);

// Get current user (alternative endpoint for frontend compatibility)
router.get('/user', isAuthenticated, getCurrentUser);

// Update profile
router.put('/auth/profile', isAuthenticated, updateProfile);

// Ban user (admin only)
router.post('/auth/ban/:id', isAuthenticated, banUser);

// Get all users (admin only)
router.get('/auth/users', isAuthenticated, getAllUsers);

// Teacher application routes
router.get('/auth/teacher-status', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const teacherStatus = {
      role: user.role || 'user',
      teacherApprovalStatus: user.teacherApprovalStatus,
      teacherRejectionReason: user.teacherRejectionReason,
      teacherApprovalDate: user.teacherApprovalDate,
      teacherRejectionDate: user.teacherApprovalDate, // For rejected applications, this is the rejection date
    };
    
    res.status(200).json(teacherStatus);
  } catch (error) {
    logger.error(`Error getting teacher status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error getting teacher status' });
  }
});

router.post('/auth/apply-teacher', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const { bio, experience, expertise, motivation } = req.body;

    // Validate required fields
    if (!bio?.trim() || !experience?.trim() || !expertise?.trim() || !motivation?.trim()) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already has a pending or approved application
    if (user.teacherApprovalStatus === TeacherApprovalStatus.PENDING || 
        user.teacherApprovalStatus === TeacherApprovalStatus.APPROVED) {
      return res.status(400).json({ message: 'You already have a teacher application' });
    }

    // Update user with teacher application
    user.role = UserRole.TEACHER;
    user.teacherApprovalStatus = TeacherApprovalStatus.PENDING;
    user.bio = bio.trim();
    // Store additional application data in user document or create separate collection
    user.teacherApplication = {
      experience: experience.trim(),
      expertise: expertise.trim(),
      motivation: motivation.trim(),
      submittedAt: new Date()
    };

    await user.save();

    logger.info(`Teacher application submitted by user ${user.username}`);

    res.status(200).json({ 
      message: 'Teacher application submitted successfully',
      status: 'pending'
    });
  } catch (error) {
    logger.error(`Error submitting teacher application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error submitting teacher application' });
  }
});

// Reset teacher status for rejected applications
router.post('/auth/reset-teacher-status', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Only allow reset if status is rejected
    if (user.teacherApprovalStatus !== TeacherApprovalStatus.REJECTED) {
      return res.status(400).json({ message: 'Can only reset rejected applications' });
    }

    // Check if 1 month has passed since rejection
    const rejectionDate = user.teacherApprovalDate;
    if (rejectionDate) {
      const oneMonthLater = new Date(rejectionDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (new Date() < oneMonthLater) {
        return res.status(400).json({ 
          message: 'Must wait 1 month before reapplying',
          canReapplyAfter: oneMonthLater.toISOString()
        });
      }
    }

    // Reset teacher status
    user.role = UserRole.USER;
    user.teacherApprovalStatus = undefined;
    user.teacherApprovalDate = undefined;
    user.teacherApprovedBy = undefined;
    user.teacherRejectionReason = undefined;
    user.teacherApplication = undefined;

    await user.save();

    logger.info(`Teacher status reset for user ${user.username}`);

    res.status(200).json({ 
      message: 'Teacher status reset successfully',
      status: 'user'
    });
  } catch (error) {
    logger.error(`Error resetting teacher status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error resetting teacher status' });
  }
});

export default router;