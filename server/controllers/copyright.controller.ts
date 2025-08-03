import { Request, Response } from 'express';
import Ticket from '../models/Ticket';
import { logger } from '../utils/logger';
import { copyrightRateLimiter, ticketCheckerRateLimiter } from '../utils/rate-limiter';

export const submitCopyrightDispute = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to submit copyright disputes'
      });
    }

    const userId = (req.user as any)?._id?.toString();
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    const {
      name,
      email,
      reason,
      disputeLink,
      agencyName,
      agencyRepresentative,
      message
    } = req.body;

    // Validate required fields
    if (!name || !email || !reason || !disputeLink || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check rate limit before processing
    const rateLimitStatus = await copyrightRateLimiter.isUserRateLimited(userId);
    if (rateLimitStatus.limited) {
      const remainingTime = copyrightRateLimiter.formatRemainingTime(rateLimitStatus.remainingTime || 0);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. You can submit ${rateLimitStatus.remainingAttempts} more copyright disputes today. Please try again in ${remainingTime}.`,
        limited: true,
        remainingTime: rateLimitStatus.remainingTime,
        remainingAttempts: rateLimitStatus.remainingAttempts
      });
    }

    // Record the attempt
    const attemptResult = await copyrightRateLimiter.recordAttempt(userId);
    if (attemptResult.limited) {
      const remainingTime = copyrightRateLimiter.formatRemainingTime(attemptResult.remainingTime || 0);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please try again in ${remainingTime}.`,
        limited: true,
        remainingTime: attemptResult.remainingTime
      });
    }

    // Create new ticket
    const ticket = new Ticket({
      userId: (req.user as any)._id,
      name,
      email,
      reason,
      disputeLink,
      agencyName,
      agencyRepresentative,
      message,
      status: 'pending'
    });

    await ticket.save();

    logger.info(`Copyright dispute ticket created: ${ticket.ticketId} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Copyright dispute submitted successfully',
      data: {
        ticketId: ticket.ticketId,
        status: ticket.status,
        remainingAttempts: attemptResult.remainingAttempts
      }
    });

  } catch (error) {
    logger.error('Error submitting copyright dispute:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit copyright dispute'
    });
  }
};

export const getTicketStatus = async (req: Request, res: Response) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findOne({ ticketId }).select('-__v');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: {
        ticketId: ticket.ticketId,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        resolvedAt: ticket.resolvedAt
      }
    });

  } catch (error) {
    logger.error('Error getting ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ticket status'
    });
  }
};

export const getUserTickets = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to view tickets'
      });
    }

    const userId = (req.user as any)?._id?.toString();
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found'
      });
    }

    // Check rate limit for ticket checking
    const rateLimitStatus = await ticketCheckerRateLimiter.isUserRateLimited(userId);
    if (rateLimitStatus.limited) {
      const remainingTime = ticketCheckerRateLimiter.formatRemainingTime(rateLimitStatus.remainingTime || 0);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. You can check tickets ${rateLimitStatus.remainingAttempts} more times today. Please try again in ${remainingTime}.`,
        limited: true,
        remainingTime: rateLimitStatus.remainingTime,
        remainingAttempts: rateLimitStatus.remainingAttempts
      });
    }

    // Record the attempt
    const attemptResult = await ticketCheckerRateLimiter.recordAttempt(userId);
    if (attemptResult.limited) {
      const remainingTime = ticketCheckerRateLimiter.formatRemainingTime(attemptResult.remainingTime || 0);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please try again in ${remainingTime}.`,
        limited: true,
        remainingTime: attemptResult.remainingTime
      });
    }

    const tickets = await Ticket.find({ userId: (req.user as any)._id })
      .select('ticketId status reason createdAt updatedAt resolvedAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tickets,
      rateLimitInfo: {
        remainingAttempts: attemptResult.remainingAttempts,
        limit: 5
      }
    });

  } catch (error) {
    logger.error('Error getting user tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user tickets'
    });
  }
}; 