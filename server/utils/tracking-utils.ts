import { TrackingLink, TrackingEvent } from '../models';
import { logger } from './logger';

// Track user login from tracking link
export const trackUserLoginFromLink = async (userId: string, sessionId: string, ipAddress: string, userAgent: string) => {
  try {
    // Check if there's a tracking session in the user's session
    // This will be set when the user clicks a tracking link
    const trackingCode = sessionId ? await getTrackingCodeFromSession(sessionId) : null;
    
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
};

// Store tracking code in session (called when user clicks tracking link)
export const storeTrackingCodeInSession = async (sessionId: string, trackingCode: string) => {
  try {
    // In a real implementation, you might want to store this in Redis or a database
    // For now, we'll use a simple in-memory store (not recommended for production)
    // You should implement a proper session storage solution
    
    // This is a placeholder - you'll need to implement proper session storage
    logger.info(`Storing tracking code ${trackingCode} for session ${sessionId}`);
  } catch (error) {
    logger.error(`Error storing tracking code in session: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get tracking code from session
export const getTrackingCodeFromSession = async (sessionId: string): Promise<string | null> => {
  try {
    // This is a placeholder - you'll need to implement proper session storage
    // In a real implementation, you would retrieve this from Redis or your session store
    logger.info(`Getting tracking code for session ${sessionId}`);
    return null; // Placeholder
  } catch (error) {
    logger.error(`Error getting tracking code from session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
};

// Alternative approach: Use URL parameters or cookies for tracking
export const getTrackingCodeFromRequest = (req: any): string | null => {
  try {
    // Check for tracking code in query parameters
    const trackingCode = req.query.tracking || req.query.ref || req.query.source;
    if (trackingCode) {
      return trackingCode;
    }

    // Check for tracking code in cookies
    const trackingCookie = req.cookies?.tracking_code;
    if (trackingCookie) {
      return trackingCookie;
    }

    // Check for tracking code in referrer
    const referrer = req.get('Referrer');
    if (referrer) {
      const url = new URL(referrer);
      const trackingCode = url.searchParams.get('tracking') || url.searchParams.get('ref') || url.searchParams.get('source');
      if (trackingCode) {
        return trackingCode;
      }
    }

    return null;
  } catch (error) {
    logger.error(`Error getting tracking code from request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}; 