import express from 'express';
import {
  createTrackingLink,
  getAllTrackingLinks,
  getTrackingLinkById,
  updateTrackingLink,
  deleteTrackingLink,
  trackLinkClick,
  trackUserLogin,
  getTrackingStats,
  getTrackingDashboardStats
} from '../controllers/tracking.controller';
import { isAdmin, isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes (for tracking)
router.get('/track/:trackingCode', trackLinkClick);
router.post('/track/:trackingCode/login', isAuthenticated, trackUserLogin);

// Admin routes
router.post('/admin/tracking-links', isAdmin, createTrackingLink);
router.get('/admin/tracking-links', isAdmin, getAllTrackingLinks);
router.get('/admin/tracking-links/:id', isAdmin, getTrackingLinkById);
router.put('/admin/tracking-links/:id', isAdmin, updateTrackingLink);
router.delete('/admin/tracking-links/:id', isAdmin, deleteTrackingLink);
router.get('/admin/tracking-links/:id/stats', isAdmin, getTrackingStats);
router.get('/admin/tracking-dashboard', isAdmin, getTrackingDashboardStats);

export default router; 