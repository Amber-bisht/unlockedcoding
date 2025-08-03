import { Request, Response } from 'express';
import { storage } from '../storage';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { logger } from '../utils/logger';
import { loginRateLimiter } from '../utils/rate-limiter';
import { TrackingLink, TrackingEvent } from '../models';
import { trackLoginActivity } from './login-activity.controller';

const scryptAsync = promisify(scrypt);

// Track login from tracking link
async function trackLoginFromTrackingLink(userId: string, sessionId: string, ipAddress: string, userAgent: string, req: Request) {
  try {
    // Check for tracking code in cookies
    const trackingCode = req.cookies?.tracking_code;
    if (!trackingCode) {
      return; // No tracking link associated with this login
    }

    const trackingLink = await TrackingLink.findOne({ trackingCode });
    if (!trackingLink) {
      logger.warn(`Tracking link not found for code: ${trackingCode}`);
      return;
    }

    // Check if this user has already been counted for this tracking link
    const existingLoginEvent = await TrackingEvent.findOne({
      trackingLinkId: trackingLink._id,
      eventType: 'login',
      userId: userId
    });

    if (existingLoginEvent) {
      logger.info(`Login already tracked for user ${userId} and tracking link ${trackingCode}`);
      return;
    }

    // Create tracking event
    const trackingEvent = new TrackingEvent({
      trackingLinkId: trackingLink._id,
      eventType: 'login',
      userId: userId,
      ipAddress,
      userAgent,
      sessionId
    });

    await trackingEvent.save();

    // Update tracking link stats
    trackingLink.loginCount += 1;
    if (trackingLink.clickCount > 0) {
      trackingLink.conversionRate = (trackingLink.loginCount / trackingLink.clickCount) * 100;
    }
    await trackingLink.save();

    logger.info(`User login tracked: ${trackingCode} for user ${userId}`);
  } catch (error) {
    logger.error(`Error tracking user login: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions for password handling
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, email } = req.body;

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const clientIp = Array.isArray(ipAddress) ? ipAddress[0] : ipAddress;

    // Check if IP is blocked
    const blockStatus = await loginRateLimiter.isIpBlocked(clientIp);
    if (blockStatus.blocked) {
      const remainingTime = loginRateLimiter.formatRemainingTime(blockStatus.remainingTime || 0);
      logger.warn(`Blocked registration attempt from IP ${clientIp} - ${remainingTime} remaining`);
      res.status(429).json({ 
        message: `Too many attempts. Please try again in ${remainingTime}.`,
        blocked: true,
        remainingTime: blockStatus.remainingTime
      });
      return;
    }

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      // Record failed attempt for registration
      const failedAttempt = await loginRateLimiter.recordFailedAttempt(clientIp, username);
      const remainingAttempts = await loginRateLimiter.getRemainingAttempts(clientIp);
      
      if (failedAttempt.blocked) {
        const remainingTime = loginRateLimiter.formatRemainingTime(failedAttempt.remainingTime || 0);
        logger.warn(`IP ${clientIp} blocked after failed registration attempt`);
        res.status(429).json({ 
          message: `Too many attempts. Please try again in ${remainingTime}.`,
          blocked: true,
          remainingTime: failedAttempt.remainingTime
        });
        return;
      }

      res.status(400).json({ 
        message: 'Username already exists',
        remainingAttempts
      });
      return;
    }
    


    // Create new user with hashed password (always set isAdmin to false)
    const user = await storage.createUser({
      username,
      password: await hashPassword(password),
      email,
      isAdmin: false, // Never allow setting admin through registration
      hasCompletedProfile: false
    });

    // Successful registration - reset attempts
    await loginRateLimiter.recordSuccessfulLogin(clientIp, username);

    // Format user response
    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;
    
    const cleanUser = {
      id: userObj._id.toString(),
      username: userObj.username,
      email: userObj.email,
      isAdmin: userObj.isAdmin,
      hasCompletedProfile: userObj.hasCompletedProfile,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
      fullName: userObj.fullName,
      bio: userObj.bio,
      interest: userObj.interest,
      profileImageUrl: userObj.profileImageUrl,
      avatar: userObj.avatar
    };

    // Create session
    if (req.login) {
      req.login(user, (err) => {
        if (err) {
          logger.error(`Login error after registration: ${err.message}`);
          res.status(500).json({ message: 'Error logging in after registration' });
          return;
        }
        // Save session explicitly
        req.session.save((saveErr) => {
          if (saveErr) {
            logger.error(`Session save error after registration: ${saveErr.message}`);
            res.status(500).json({ message: 'Error saving session' });
            return;
          }
          res.status(201).json(cleanUser);
        });
      });
    } else {
      // Return user without password if req.login is not available
      res.status(201).json(cleanUser);
    }
  } catch (error) {
    logger.error(`Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const clientIp = Array.isArray(ipAddress) ? ipAddress[0] : ipAddress;

    // Check if IP is blocked
    const blockStatus = await loginRateLimiter.isIpBlocked(clientIp);
    if (blockStatus.blocked) {
      const remainingTime = loginRateLimiter.formatRemainingTime(blockStatus.remainingTime || 0);
      logger.warn(`Blocked login attempt from IP ${clientIp} - ${remainingTime} remaining`);
      res.status(429).json({ 
        message: `Too many login attempts. Please try again in ${remainingTime}.`,
        blocked: true,
        remainingTime: blockStatus.remainingTime
      });
      return;
    }

    // Find user
    const user = await storage.getUserByUsername(username);
    if (!user) {
      // Record failed attempt
      const failedAttempt = await loginRateLimiter.recordFailedAttempt(clientIp, username);
      const remainingAttempts = await loginRateLimiter.getRemainingAttempts(clientIp);
      
      if (failedAttempt.blocked) {
        const remainingTime = loginRateLimiter.formatRemainingTime(failedAttempt.remainingTime || 0);
        logger.warn(`IP ${clientIp} blocked after failed login attempt`);
        res.status(429).json({ 
          message: `Too many failed login attempts. Please try again in ${remainingTime}.`,
          blocked: true,
          remainingTime: failedAttempt.remainingTime
        });
        return;
      }

      res.status(401).json({ 
        message: 'Invalid credentials',
        remainingAttempts
      });
      return;
    }

    // Verify password
    const isMatch = await comparePasswords(password, user.password || '');
    if (!isMatch) {
      // Record failed attempt
      const failedAttempt = await loginRateLimiter.recordFailedAttempt(clientIp, username);
      const remainingAttempts = await loginRateLimiter.getRemainingAttempts(clientIp);
      
      if (failedAttempt.blocked) {
        const remainingTime = loginRateLimiter.formatRemainingTime(failedAttempt.remainingTime || 0);
        logger.warn(`IP ${clientIp} blocked after failed login attempt`);
        res.status(429).json({ 
          message: `Too many failed login attempts. Please try again in ${remainingTime}.`,
          blocked: true,
          remainingTime: failedAttempt.remainingTime
        });
        return;
      }

      res.status(401).json({ 
        message: 'Invalid credentials',
        remainingAttempts
      });
      return;
    }

    // Successful login - reset attempts
    await loginRateLimiter.recordSuccessfulLogin(clientIp, username);

    // Track login if it came from a tracking link
    await trackLoginFromTrackingLink(user._id.toString(), req.sessionID, clientIp, req.get('User-Agent') || '', req);

    // Track login activity for contribution calendar
    await trackLoginActivity(user._id.toString(), req.sessionID, clientIp, req.get('User-Agent') || '');

    // Format user response
    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;
    
    const cleanUser = {
      id: userObj._id.toString(),
      username: userObj.username,
      email: userObj.email,
      isAdmin: userObj.isAdmin,
      hasCompletedProfile: userObj.hasCompletedProfile,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
      fullName: userObj.fullName,
      bio: userObj.bio,
      interest: userObj.interest,
      profileImageUrl: userObj.profileImageUrl,
      avatar: userObj.avatar
    };

    // Create session
    if (req.login) {
      req.login(user, (err) => {
        if (err) {
          logger.error(`Login error: ${err.message}`);
          res.status(500).json({ message: 'Error logging in' });
          return;
        }
        // Save session explicitly
        req.session.save((saveErr) => {
          if (saveErr) {
            logger.error(`Session save error: ${saveErr.message}`);
            res.status(500).json({ message: 'Error saving session' });
            return;
          }
          res.status(200).json(cleanUser);
        });
      });
    } else {
      // Return formatted user if req.login is not available
      res.status(200).json(cleanUser);
    }
  } catch (error) {
    logger.error(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Logout user
export const logout = (req: Request, res: Response): void => {
  if (req.logout) {
    req.logout((err) => {
      if (err) {
        logger.error(`Logout error: ${err.message}`);
        res.status(500).json({ message: 'Error logging out' });
        return;
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } else {
    // Handle case where req.logout is not available
    res.status(200).json({ message: 'Logged out successfully' });
  }
};



// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (!(req.user as any)?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    const users = await storage.getAllUsers();
    const cleanUsers = users.map(user => {
      const userObj = user.toObject();
      const { password: _, ...userWithoutPassword } = userObj;
      return {
        _id: userObj._id,
        username: userObj.username,
        email: userObj.email,
        isAdmin: userObj.isAdmin,
        banned: userObj.banned || false,
        createdAt: userObj.createdAt
      };
    });
    res.status(200).json(cleanUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Ban or unban a user (admin only)
export const banUser = async (req: Request, res: Response) => {
  try {
    if (!(req.user as any)?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    const { banned } = req.body;
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.banned = !!banned;
    await user.save();
    res.status(200).json({ message: `User has been ${banned ? 'banned' : 'unbanned'}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user ban status' });
  }
};

// Get blocked IPs (admin only)
export const getBlockedIPs = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!(req.user as any)?.isAdmin) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    const { LoginAttempt } = await import('../models');
    const now = new Date();
    
    const blockedIPs = await LoginAttempt.find({
      isBlocked: true,
      blockedUntil: { $gt: now }
    }).sort({ lastAttempt: -1 });

    const formattedIPs = blockedIPs.map((attempt: any) => ({
      ipAddress: attempt.ipAddress,
      username: attempt.username,
      attemptCount: attempt.attemptCount,
      lastAttempt: attempt.lastAttempt,
      blockedUntil: attempt.blockedUntil,
      remainingTime: attempt.blockedUntil ? attempt.blockedUntil.getTime() - now.getTime() : 0
    }));

    res.status(200).json(formattedIPs);
  } catch (error) {
    logger.error(`Error getting blocked IPs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error getting blocked IPs' });
  }
};

// Unblock IP (admin only)
export const unblockIP = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!(req.user as any)?.isAdmin) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    const { ipAddress } = req.params;
    const { LoginAttempt } = await import('../models');
    
    const result = await LoginAttempt.updateMany(
      { ipAddress },
      {
        isBlocked: false,
        blockedUntil: null,
        attemptCount: 0
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`IP ${ipAddress} unblocked by admin`);
      res.status(200).json({ message: `IP ${ipAddress} has been unblocked` });
    } else {
      res.status(404).json({ message: 'IP not found or not blocked' });
    }
  } catch (error) {
    logger.error(`Error unblocking IP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error unblocking IP' });
  }
};

// Admin login with Google ID and username
export const adminLoginWithGoogleId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { googleId, username } = req.body;

    // Get client IP address
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const clientIp = Array.isArray(ipAddress) ? ipAddress[0] : ipAddress;

    // Check if IP is blocked
    const blockStatus = await loginRateLimiter.isIpBlocked(clientIp);
    if (blockStatus.blocked) {
      const remainingTime = loginRateLimiter.formatRemainingTime(blockStatus.remainingTime || 0);
      logger.warn(`Blocked admin login attempt from IP ${clientIp} - ${remainingTime} remaining`);
      res.status(429).json({ 
        message: `Too many login attempts. Please try again in ${remainingTime}.`,
        blocked: true,
        remainingTime: blockStatus.remainingTime
      });
      return;
    }

    // Validate input
    if (!googleId || !username) {
      res.status(400).json({ message: 'Google ID and username are required' });
      return;
    }

    // Find user by Google ID and username
    const user = await storage.getUserByGoogleId(googleId);
    if (!user) {
      // Record failed attempt
      const failedAttempt = await loginRateLimiter.recordFailedAttempt(clientIp, username);
      const remainingAttempts = await loginRateLimiter.getRemainingAttempts(clientIp);
      
      if (failedAttempt.blocked) {
        const remainingTime = loginRateLimiter.formatRemainingTime(failedAttempt.remainingTime || 0);
        logger.warn(`IP ${clientIp} blocked after failed admin login attempt`);
        res.status(429).json({ 
          message: `Too many failed login attempts. Please try again in ${remainingTime}.`,
          blocked: true,
          remainingTime: failedAttempt.remainingTime
        });
        return;
      }

      res.status(401).json({ 
        message: 'Invalid credentials',
        remainingAttempts
      });
      return;
    }

    // Check if username matches
    if (user.username !== username) {
      // Record failed attempt
      const failedAttempt = await loginRateLimiter.recordFailedAttempt(clientIp, username);
      const remainingAttempts = await loginRateLimiter.getRemainingAttempts(clientIp);
      
      if (failedAttempt.blocked) {
        const remainingTime = loginRateLimiter.formatRemainingTime(failedAttempt.remainingTime || 0);
        logger.warn(`IP ${clientIp} blocked after failed admin login attempt`);
        res.status(429).json({ 
          message: `Too many failed login attempts. Please try again in ${remainingTime}.`,
          blocked: true,
          remainingTime: failedAttempt.remainingTime
        });
        return;
      }

      res.status(401).json({ 
        message: 'Invalid credentials',
        remainingAttempts
      });
      return;
    }

    // Check if user is admin
    if (!user.isAdmin) {
      // Record failed attempt
      const failedAttempt = await loginRateLimiter.recordFailedAttempt(clientIp, username);
      const remainingAttempts = await loginRateLimiter.getRemainingAttempts(clientIp);
      
      if (failedAttempt.blocked) {
        const remainingTime = loginRateLimiter.formatRemainingTime(failedAttempt.remainingTime || 0);
        logger.warn(`IP ${clientIp} blocked after failed admin login attempt`);
        res.status(429).json({ 
          message: `Too many failed login attempts. Please try again in ${remainingTime}.`,
          blocked: true,
          remainingTime: failedAttempt.remainingTime
        });
        return;
      }

      res.status(403).json({ 
        message: 'Access denied. Admin privileges required.',
        remainingAttempts
      });
      return;
    }

    // Successful login - reset attempts
    await loginRateLimiter.recordSuccessfulLogin(clientIp, username);

    // Format user response
    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;
    
    const cleanUser = {
      id: userObj._id.toString(),
      username: userObj.username,
      email: userObj.email,
      isAdmin: userObj.isAdmin,
      hasCompletedProfile: userObj.hasCompletedProfile,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
      fullName: userObj.fullName,
      bio: userObj.bio,
      interest: userObj.interest,
      profileImageUrl: userObj.profileImageUrl,
      avatar: userObj.avatar,
      googleId: userObj.googleId
    };

    // Create session
    if (req.login) {
      req.login(user, (err) => {
        if (err) {
          logger.error(`Admin login error: ${err.message}`);
          res.status(500).json({ message: 'Error logging in' });
          return;
        }
        // Save session explicitly
        req.session.save((saveErr) => {
          if (saveErr) {
            logger.error(`Session save error: ${saveErr.message}`);
            res.status(500).json({ message: 'Error saving session' });
            return;
          }
          logger.info(`Admin login successful for user: ${username} with Google ID: ${googleId}`);
          res.status(200).json(cleanUser);
        });
      });
    } else {
      // Return formatted user if req.login is not available
      res.status(200).json(cleanUser);
    }
  } catch (error) {
    logger.error(`Admin login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Debug logging for production
    logger.info(`Auth check - isAuthenticated: ${req.isAuthenticated ? req.isAuthenticated() : 'function not available'}`);
    logger.info(`Auth check - session: ${JSON.stringify(req.session)}`);
    logger.info(`Auth check - user: ${req.user ? 'present' : 'not present'}`);
    logger.info(`Auth check - cookies: ${req.headers.cookie}`);
    logger.info(`Auth check - origin: ${req.headers.origin}`);
    logger.info(`Auth check - host: ${req.headers.host}`);
    logger.info(`Auth check - headers: ${JSON.stringify(req.headers)}`);
    logger.info(`Auth check - method: ${req.method}`);
    logger.info(`Auth check - url: ${req.url}`);
    logger.info(`Auth check - protocol: ${req.protocol}`);
    logger.info(`Auth check - ip: ${req.ip}`);
    logger.info(`Auth check - passport: ${JSON.stringify((req.session as any)?.passport)}`);
    logger.info(`Auth check - userId from session: ${(req.session as any)?.passport?.user}`);
    
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // If user is already in req.user, use it
    if (req.user) {
      // Check if req.user is a mongoose document
      const user = req.user as any;
      if (user && typeof user.toObject === 'function') {
        const userObj = user.toObject();
        const { password: _, ...userWithoutPassword } = userObj;
        
        // Clean up mongoose internals
        const cleanUser = {
          id: userObj._id.toString(),
          username: userObj.username,
          email: userObj.email,
          isAdmin: userObj.isAdmin,
          hasCompletedProfile: userObj.hasCompletedProfile,
          createdAt: userObj.createdAt,
          updatedAt: userObj.updatedAt,
          fullName: userObj.fullName,
          bio: userObj.bio,
          interest: userObj.interest,
          profileImageUrl: userObj.profileImageUrl,
          avatar: userObj.avatar,
          // Teacher-related fields
          role: userObj.role,
          teacherApprovalStatus: userObj.teacherApprovalStatus,
          teacherApprovalDate: userObj.teacherApprovalDate,
          teacherRejectionReason: userObj.teacherRejectionReason
        };
        
        res.status(200).json(cleanUser);
      } else {
        // If not a mongoose document, assume it's already formatted
        const userResponse = { ...req.user } as any;
        const { password: _, ...userWithoutPassword } = userResponse;
        res.status(200).json(userWithoutPassword);
      }
      return;
    }

    // Otherwise, fetch from database
    const userId = (req.session as any)?.passport?.user;
    if (!userId) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const user = await storage.getUser(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    
    // Clean up mongoose internals
    const cleanUser = {
      id: userObj._id.toString(),
      username: userObj.username,
      email: userObj.email,
      isAdmin: userObj.isAdmin,
      hasCompletedProfile: userObj.hasCompletedProfile,
      createdAt: userObj.createdAt,
      updatedAt: userObj.updatedAt,
      fullName: userObj.fullName,
      bio: userObj.bio,
      interest: userObj.interest,
      profileImageUrl: userObj.profileImageUrl,
      avatar: userObj.avatar,
      // Teacher-related fields
      role: userObj.role,
      teacherApprovalStatus: userObj.teacherApprovalStatus,
      teacherApprovalDate: userObj.teacherApprovalDate,
      teacherRejectionReason: userObj.teacherRejectionReason
    };
    
    res.status(200).json(cleanUser);
  } catch (error) {
    logger.error(`Get current user error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error getting current user' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = req.user as any;
    const { fullName, bio, interest, profileImageUrl } = req.body;

    // Update user profile
    const updatedUser = await storage.updateUser(user._id.toString(), {
      fullName,
      bio,
      interest,
      profileImageUrl,
      hasCompletedProfile: true
    });

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const userObj = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
    const { password: _, ...userWithoutPassword } = userObj;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    logger.error(`Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error updating profile' });
  }
};