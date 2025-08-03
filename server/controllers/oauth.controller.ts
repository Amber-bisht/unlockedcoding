import { Request, Response } from 'express';
import { storage } from '../storage';
import { logger } from '../utils/logger';
import { TrackingLink, TrackingEvent } from '../models';
import { trackLoginActivity } from './login-activity.controller';

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

// Google OAuth callback
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info(`Google callback - User: ${req.user ? 'present' : 'not present'}`);
    logger.info(`Google callback - Session ID: ${req.sessionID}`);
    logger.info(`Google callback - Is authenticated: ${req.isAuthenticated ? req.isAuthenticated() : 'function not available'}`);
    logger.info(`Google callback - Passport in session: ${JSON.stringify((req.session as any)?.passport)}`);

    if (!req.user) {
      logger.error('Google callback - No user found');
      res.status(401).json({ message: 'Authentication failed' });
      return;
    }

    // Explicitly log in the user to ensure session is established
    req.login(req.user, (loginErr) => {
      if (loginErr) {
        logger.error(`Google callback - Login error: ${loginErr.message}`);
        res.redirect('/auth/error?message=Login error');
        return;
      }

      logger.info(`Google callback - User logged in successfully`);
      
      // Ensure session is saved before redirecting
      req.session.save(async (err) => {
        if (err) {
          logger.error(`Session save error in Google callback: ${err.message}`);
          res.redirect('/auth/error?message=Session error');
          return;
        }
        
        logger.info(`Google callback - Session saved successfully`);
        logger.info(`Google callback - Final session data: ${JSON.stringify(req.session)}`);
        
        // Track login if it came from a tracking link
        if (req.user) {
          await trackLoginFromTrackingLink((req.user as any)._id.toString(), req.sessionID, req.ip || '', req.get('User-Agent') || '', req);
        }
        
        // Track login activity for contribution calendar
        if (req.user) {
          await trackLoginActivity((req.user as any)._id.toString(), req.sessionID, req.ip || '', req.get('User-Agent') || '');
        }
        
        // Redirect to success page - the session is now established
        res.redirect('/auth/success');
      });
    });
  } catch (error) {
    logger.error(`Google OAuth callback error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.redirect('/auth/error?message=Authentication failed');
  }
};

// GitHub OAuth callback
export const githubCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication failed' });
      return;
    }

    // Explicitly log in the user to ensure session is established
    req.login(req.user, (loginErr) => {
      if (loginErr) {
        logger.error(`GitHub callback - Login error: ${loginErr.message}`);
        res.redirect('/auth/error?message=Login error');
        return;
      }

      logger.info(`GitHub callback - User logged in successfully`);

      // Ensure session is saved before redirecting
      req.session.save(async (err) => {
        if (err) {
          logger.error(`Session save error in GitHub callback: ${err.message}`);
          res.redirect('/auth/error?message=Session error');
          return;
        }
        
        // Track login if it came from a tracking link
        if (req.user) {
          await trackLoginFromTrackingLink((req.user as any)._id.toString(), req.sessionID, req.ip || '', req.get('User-Agent') || '', req);
        }
        
        // Track login activity for contribution calendar
        if (req.user) {
          await trackLoginActivity((req.user as any)._id.toString(), req.sessionID, req.ip || '', req.get('User-Agent') || '');
        }
        
        // Redirect to success page - the session is now established
        res.redirect('/auth/success');
      });
    });
  } catch (error) {
    logger.error(`GitHub OAuth callback error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.redirect('/auth/error?message=Authentication failed');
  }
};

// OAuth success endpoint
export const oauthSuccess = (req: Request, res: Response): void => {
  logger.info(`OAuth success - User: ${req.user ? 'present' : 'not present'}`);
  logger.info(`OAuth success - Session ID: ${req.sessionID}`);
  logger.info(`OAuth success - Is authenticated: ${req.isAuthenticated ? req.isAuthenticated() : 'function not available'}`);
  logger.info(`OAuth success - Passport in session: ${JSON.stringify((req.session as any)?.passport)}`);
  
  // Check if user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    logger.error('OAuth success - User not authenticated');
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  // Return the authenticated user
  const user = req.user as any;
  if (user && typeof user.toObject === 'function') {
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
      avatar: userObj.avatar,
      googleId: userObj.googleId,
      githubId: userObj.githubId
    };
    
    logger.info(`OAuth success - Returning user: ${cleanUser.username}`);
    res.json(cleanUser);
  } else {
    logger.error('OAuth success - Invalid user data');
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// OAuth error endpoint
export const oauthError = (req: Request, res: Response): void => {
  const message = req.query.message as string || 'Authentication failed';
  res.status(400).json({ message });
}; 