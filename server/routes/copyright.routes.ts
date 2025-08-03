import express from 'express';
import { submitCopyrightDispute, getTicketStatus, getUserTickets } from '../controllers/copyright.controller';
import { isAuthenticated } from '../middleware/auth.middleware';
import { userRateLimit } from '../middleware/rate-limit.middleware';
import { copyrightRateLimiter, ticketCheckerRateLimiter } from '../utils/rate-limiter';

const router = express.Router();

// Submit copyright dispute (requires authentication + rate limiting)
router.post('/submit', 
  isAuthenticated, 
  userRateLimit(copyrightRateLimiter, 'copyright_submission'),
  submitCopyrightDispute
);

// Get ticket status by ticket ID (public route - no rate limiting needed)
router.get('/status/:ticketId', getTicketStatus);

// Get user's tickets (requires authentication + rate limiting)
router.get('/user-tickets', 
  isAuthenticated, 
  userRateLimit(ticketCheckerRateLimiter, 'ticket_checking'),
  getUserTickets
);

export default router; 