import express from 'express';
import { adController } from '../controllers';
import { isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/:position', adController.getAds); // Get ads for categories or courses
router.post('/:id/click', adController.trackAdClick); // Track ad clicks

// Admin routes
router.get('/', isAdmin, adController.getAllAds); // Get all ads (admin)
router.post('/', isAdmin, adController.createAd); // Create new ad (admin)
router.put('/:id', isAdmin, adController.updateAd); // Update ad (admin)
router.delete('/:id', isAdmin, adController.deleteAd); // Delete ad (admin)
router.get('/stats/overview', isAdmin, adController.getAdStats); // Get ad statistics (admin)

export default router; 