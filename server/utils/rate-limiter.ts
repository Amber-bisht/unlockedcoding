import { LoginAttempt } from '../models';
import { logger } from './logger';
import mongoose from 'mongoose';

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export interface UserRateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if an IP is blocked from login attempts
   */
  async isIpBlocked(ipAddress: string): Promise<{ blocked: boolean; remainingTime?: number }> {
    try {
      const now = new Date();
      const loginAttempt = await LoginAttempt.findOne({ 
        ipAddress,
        isBlocked: true,
        blockedUntil: { $gt: now }
      });

      if (loginAttempt && loginAttempt.blockedUntil) {
        const remainingTime = loginAttempt.blockedUntil.getTime() - now.getTime();
        return { blocked: true, remainingTime };
      }

      return { blocked: false };
    } catch (error) {
      logger.error(`Error checking IP block status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { blocked: false };
    }
  }

  /**
   * Record a failed login attempt
   */
  async recordFailedAttempt(ipAddress: string, username?: string): Promise<{ blocked: boolean; remainingTime?: number }> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Find or create login attempt record for today
      let loginAttempt = await LoginAttempt.findOne({
        ipAddress,
        createdAt: { $gte: startOfDay }
      });

      if (!loginAttempt) {
        loginAttempt = new LoginAttempt({
          ipAddress,
          username,
          attemptCount: 0,
          lastAttempt: now,
          isBlocked: false
        });
      }

      // Increment attempt count
      loginAttempt.attemptCount += 1;
      loginAttempt.lastAttempt = now;
      loginAttempt.username = username;

      // Check if we should block this IP
      if (loginAttempt.attemptCount >= this.config.maxAttempts) {
        loginAttempt.isBlocked = true;
        loginAttempt.blockedUntil = new Date(now.getTime() + this.config.blockDurationMs);
        
        logger.warn(`IP ${ipAddress} blocked due to ${loginAttempt.attemptCount} failed login attempts`);
      }

      await loginAttempt.save();

      if (loginAttempt.isBlocked && loginAttempt.blockedUntil) {
        const remainingTime = loginAttempt.blockedUntil.getTime() - now.getTime();
        return { blocked: true, remainingTime };
      }

      return { blocked: false };
    } catch (error) {
      logger.error(`Error recording failed login attempt: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { blocked: false };
    }
  }

  /**
   * Record a successful login and reset attempts
   */
  async recordSuccessfulLogin(ipAddress: string, username?: string): Promise<void> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Reset attempts for this IP
      await LoginAttempt.updateMany(
        {
          ipAddress,
          createdAt: { $gte: startOfDay }
        },
        {
          attemptCount: 0,
          isBlocked: false,
          blockedUntil: null,
          lastAttempt: now
        }
      );

      logger.info(`Login attempts reset for IP ${ipAddress} after successful login`);
    } catch (error) {
      logger.error(`Error recording successful login: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get remaining attempts for an IP
   */
  async getRemainingAttempts(ipAddress: string): Promise<number> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const loginAttempt = await LoginAttempt.findOne({
        ipAddress,
        createdAt: { $gte: startOfDay }
      });

      if (!loginAttempt) {
        return this.config.maxAttempts;
      }

      return Math.max(0, this.config.maxAttempts - loginAttempt.attemptCount);
    } catch (error) {
      logger.error(`Error getting remaining attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return this.config.maxAttempts;
    }
  }

  /**
   * Format remaining time in a human-readable format
   */
  formatRemainingTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}

export class UserRateLimiter {
  private config: UserRateLimitConfig;
  private collectionName: string;

  constructor(config: UserRateLimitConfig, collectionName: string) {
    this.config = config;
    this.collectionName = collectionName;
  }

  /**
   * Check if a user is rate limited for a specific action
   */
  async isUserRateLimited(userId: string): Promise<{ limited: boolean; remainingTime?: number; remainingAttempts: number }> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Find user's rate limit record for today
      const rateLimitRecord = await mongoose.connection.db
        .collection(this.collectionName)
        .findOne({
          userId,
          createdAt: { $gte: startOfDay }
        });

      if (!rateLimitRecord) {
        return { limited: false, remainingAttempts: this.config.maxAttempts };
      }

      const remainingAttempts = Math.max(0, this.config.maxAttempts - rateLimitRecord.attemptCount);
      
      // Check if user is blocked
      if (rateLimitRecord.isBlocked && rateLimitRecord.blockedUntil && rateLimitRecord.blockedUntil > now) {
        const remainingTime = rateLimitRecord.blockedUntil.getTime() - now.getTime();
        return { 
          limited: true, 
          remainingTime, 
          remainingAttempts: 0 
        };
      }

      return { 
        limited: remainingAttempts === 0, 
        remainingAttempts 
      };
    } catch (error) {
      logger.error(`Error checking user rate limit: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { limited: false, remainingAttempts: this.config.maxAttempts };
    }
  }

  /**
   * Record an attempt for a user
   */
  async recordAttempt(userId: string): Promise<{ limited: boolean; remainingTime?: number; remainingAttempts: number }> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Find or create rate limit record for today
      let rateLimitRecord = await mongoose.connection.db
        .collection(this.collectionName)
        .findOne({
          userId,
          createdAt: { $gte: startOfDay }
        });

      if (!rateLimitRecord) {
        rateLimitRecord = {
          _id: new mongoose.Types.ObjectId(),
          userId,
          attemptCount: 0,
          lastAttempt: now,
          isBlocked: false,
          createdAt: now
        };
      }

      // Increment attempt count
      rateLimitRecord.attemptCount += 1;
      rateLimitRecord.lastAttempt = now;

      // Check if we should block this user
      if (rateLimitRecord.attemptCount >= this.config.maxAttempts) {
        rateLimitRecord.isBlocked = true;
        rateLimitRecord.blockedUntil = new Date(now.getTime() + this.config.blockDurationMs);
        
        logger.warn(`User ${userId} blocked for ${this.collectionName} due to ${rateLimitRecord.attemptCount} attempts`);
      }

      // Upsert the record
      await mongoose.connection.db
        .collection(this.collectionName)
        .updateOne(
          { userId, createdAt: { $gte: startOfDay } },
          { $set: rateLimitRecord },
          { upsert: true }
        );

      const remainingAttempts = Math.max(0, this.config.maxAttempts - rateLimitRecord.attemptCount);

      if (rateLimitRecord.isBlocked && rateLimitRecord.blockedUntil) {
        const remainingTime = rateLimitRecord.blockedUntil.getTime() - now.getTime();
        return { limited: true, remainingTime, remainingAttempts: 0 };
      }

      return { 
        limited: remainingAttempts === 0, 
        remainingAttempts 
      };
    } catch (error) {
      logger.error(`Error recording user attempt: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { limited: false, remainingAttempts: this.config.maxAttempts };
    }
  }

  /**
   * Reset attempts for a user (after successful action)
   */
  async resetAttempts(userId: string): Promise<void> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      await mongoose.connection.db
        .collection(this.collectionName)
        .updateMany(
          {
            userId,
            createdAt: { $gte: startOfDay }
          },
          {
            $set: {
              attemptCount: 0,
              isBlocked: false,
              blockedUntil: null,
              lastAttempt: now
            }
          }
        );

      logger.info(`Rate limit attempts reset for user ${userId} in ${this.collectionName}`);
    } catch (error) {
      logger.error(`Error resetting user attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Format remaining time in a human-readable format
   */
  formatRemainingTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
}

// Default rate limiter instance with 10 attempts per day, 24-hour block
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 10,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
});

// Copyright form rate limiter - 2 attempts per day per authenticated user
export const copyrightRateLimiter = new UserRateLimiter({
  maxAttempts: 2,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
}, 'copyright_rate_limits');

// Ticket checker rate limiter - 5 attempts per day per authenticated user
export const ticketCheckerRateLimiter = new UserRateLimiter({
  maxAttempts: 5,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
}, 'ticket_checker_rate_limits');

// Contact form rate limiter - 3 attempts per day per IP (public endpoint)
export const contactRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
});

// Comment submission rate limiter - 10 attempts per day per authenticated user
export const commentRateLimiter = new UserRateLimiter({
  maxAttempts: 10,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
}, 'comment_rate_limits');

// Course review rate limiter - 5 attempts per day per authenticated user
export const reviewRateLimiter = new UserRateLimiter({
  maxAttempts: 5,
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
}, 'review_rate_limits'); 