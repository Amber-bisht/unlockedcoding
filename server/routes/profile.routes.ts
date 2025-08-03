import express from 'express';
import { profileController } from '../controllers';
import { deleteAccount } from '../controllers/profile.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Get user profile
router.get('/', isAuthenticated, profileController.getProfile);
router.get('/user/enrollments', isAuthenticated, profileController.getUserEnrollments);

// Create or update profile
router.post('/', isAuthenticated, profileController.createOrUpdateProfile);

// Delete account
router.delete('/account', isAuthenticated, deleteAccount);

export default router;