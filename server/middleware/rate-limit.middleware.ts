import { Request, Response, NextFunction } from 'express';
import { UserRateLimiter } from '../utils/rate-limiter';
import { logger } from '../utils/logger';

/**
 * Middleware to apply user-based rate limiting
 * @param rateLimiter - The rate limiter instance to use
 * @param actionName - Name of the action for logging purposes
 */
export const userRateLimit = (rateLimiter: UserRateLimiter, actionName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        res.status(401).json({ 
          message: 'Authentication required for this action',
          action: actionName
        });
        return;
      }

      const userId = (req.user as any)?._id?.toString();
      if (!userId) {
        res.status(401).json({ 
          message: 'User ID not found',
          action: actionName
        });
        return;
      }

      // Check if user is rate limited
      const rateLimitStatus = await rateLimiter.isUserRateLimited(userId);
      
      if (rateLimitStatus.limited) {
        const remainingTime = rateLimiter.formatRemainingTime(rateLimitStatus.remainingTime || 0);
        logger.warn(`User ${userId} rate limited for ${actionName} - ${remainingTime} remaining`);
        
        res.status(429).json({
          message: `Rate limit exceeded for ${actionName}. Please try again in ${remainingTime}.`,
          action: actionName,
          limited: true,
          remainingTime: rateLimitStatus.remainingTime
        });
        return;
      }

      // Record the attempt
      const attemptResult = await rateLimiter.recordAttempt(userId);
      
      if (attemptResult.limited) {
        const remainingTime = rateLimiter.formatRemainingTime(attemptResult.remainingTime || 0);
        logger.warn(`User ${userId} blocked after attempt for ${actionName} - ${remainingTime} remaining`);
        
        res.status(429).json({
          message: `Rate limit exceeded for ${actionName}. Please try again in ${remainingTime}.`,
          action: actionName,
          limited: true,
          remainingTime: attemptResult.remainingTime
        });
        return;
      }

      // Add rate limit info to response headers
      res.setHeader('X-RateLimit-Limit', rateLimiter['config'].maxAttempts);
      res.setHeader('X-RateLimit-Remaining', attemptResult.remainingAttempts);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

      // Add rate limit info to request for controllers to use
      (req as any).rateLimitInfo = {
        remainingAttempts: attemptResult.remainingAttempts,
        action: actionName
      };

      next();
    } catch (error) {
      logger.error(`Error in rate limit middleware for ${actionName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Allow the request to proceed if rate limiting fails
      next();
    }
  };
};

/**
 * Middleware to reset rate limits after successful action
 * @param rateLimiter - The rate limiter instance to use
 * @param actionName - Name of the action for logging purposes
 */
export const resetUserRateLimit = (rateLimiter: UserRateLimiter, actionName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as any)?._id?.toString();
      if (userId) {
        await rateLimiter.resetAttempts(userId);
        logger.info(`Rate limit reset for user ${userId} after successful ${actionName}`);
      }
      next();
    } catch (error) {
      logger.error(`Error resetting rate limit for ${actionName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      next();
    }
  };
}; 