import { Router } from 'express';
import { getUserLoginActivity, getLoginActivityByUserId, addLoginActivity } from '../controllers/login-activity.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

// Get current user's login activity
router.get('/user', isAuthenticated, getUserLoginActivity);

// Add login activity (for testing)
router.post('/user', isAuthenticated, addLoginActivity);

// Get login activity for a specific user (admin only)
router.get('/user/:userId', isAuthenticated, getLoginActivityByUserId);

export default router; 