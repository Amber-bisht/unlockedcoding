import express from 'express';
import { getFeaturedTestimonials, getAllTestimonials } from '../controllers/testimonials.controller';

const router = express.Router();

// Get featured testimonials for home page
router.get('/featured', getFeaturedTestimonials);

// Get all testimonials with pagination
router.get('/', getAllTestimonials);

export default router; 