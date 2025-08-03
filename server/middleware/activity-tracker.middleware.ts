import { Request, Response, NextFunction } from 'express';
import { LoginActivity } from '../models';
import { logger } from '../utils/logger';

// Track user activity when they hit any API endpoint
export const trackUserActivity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Only track if user is authenticated
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return next();
    }

    const userId = (req.user as any)?._id || (req.session as any)?.passport?.user;
    if (!userId) {
      return next();
    }

    // Skip tracking for certain endpoints to avoid spam
    const skipEndpoints = [
      '/api/login-activity/user', // Avoid recursive tracking
      '/api/notifications', // Too frequent
      '/api/user', // Too frequent
      '/api/profile/user/enrollments', // Too frequent
      '/api/test-activity', // Test endpoint
    ];

    if (skipEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
      return next();
    }

    // Track activity asynchronously (don't block the request)
    // Only track once per user per day
    trackActivityOncePerDay(userId, req.sessionID, req.ip || '', req.get('User-Agent') || '');

    next();
  } catch (error) {
    // Don't block the request if tracking fails
    logger.error(`Error in activity tracker middleware: ${error instanceof Error ? error.message : 'Unknown error'}`);
    next();
  }
};

// Async function to track activity once per day per user
async function trackActivityOncePerDay(userId: string, sessionId: string, ipAddress: string, userAgent: string): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    // Check if activity already exists for today
    const existingActivity = await LoginActivity.findOne({
      userId,
      loginDate: today
    });

    if (existingActivity) {
      // Activity already tracked for today, don't increment
      logger.debug(`Activity already tracked for user ${userId} on ${today.toISOString()}`);
      return;
    }

    // Create new activity record for today (only once per day)
    const activity = new LoginActivity({
      userId,
      loginDate: today,
      loginCount: 1, // Always 1 since we only track once per day
      ipAddress,
      userAgent,
      sessionId
    });
    await activity.save();

    logger.debug(`Activity tracked for user ${userId} on ${today.toISOString()}`);
  } catch (error) {
    logger.error(`Error tracking user activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 