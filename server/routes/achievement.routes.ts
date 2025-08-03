import express from 'express';
import achievementController from '../controllers/achievement.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Get user achievements
router.get('/user', isAuthenticated, achievementController.getUserAchievements);

// Check profile completion achievement
router.get('/check-profile', isAuthenticated, achievementController.checkProfileCompletion);

// Get achievement statistics
router.get('/stats', isAuthenticated, achievementController.getAchievementStats);

export default router; 