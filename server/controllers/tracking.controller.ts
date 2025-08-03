import { Request, Response } from 'express';
import { TrackingLink, TrackingEvent, User } from '../models';
import { logger } from '../utils/logger';

// Create a new tracking link
export const createTrackingLink = async (req: Request, res: Response) => {
  try {
    const { name, description, targetUrl } = req.body;
    const userId = (req.user as any)?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const trackingLink = new TrackingLink({
      name,
      description,
      targetUrl,
      createdBy: userId
    });

    await trackingLink.save();

    logger.info(`Tracking link created: ${trackingLink.trackingCode} by user ${userId}`);

    res.status(201).json({
      message: 'Tracking link created successfully',
      trackingLink: {
        id: trackingLink._id,
        name: trackingLink.name,
        description: trackingLink.description,
        targetUrl: trackingLink.targetUrl,
        trackingCode: trackingLink.trackingCode || '',
        trackingUrl: trackingLink.trackingUrl,
        isActive: trackingLink.isActive,
        clickCount: trackingLink.clickCount,
        loginCount: trackingLink.loginCount,
        conversionRate: trackingLink.conversionRate,
        createdAt: trackingLink.createdAt
      }
    });
  } catch (error) {
    logger.error(`Error creating tracking link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error creating tracking link' });
  }
};

// Get all tracking links for admin
export const getAllTrackingLinks = async (req: Request, res: Response) => {
  try {
    const trackingLinks = await TrackingLink.find()
      .populate('createdBy', 'username fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json(trackingLinks);
  } catch (error) {
    logger.error(`Error fetching tracking links: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching tracking links' });
  }
};

// Get tracking link by ID
export const getTrackingLinkById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const trackingLink = await TrackingLink.findById(id)
      .populate('createdBy', 'username fullName email');

    if (!trackingLink) {
      return res.status(404).json({ message: 'Tracking link not found' });
    }

    res.status(200).json(trackingLink);
  } catch (error) {
    logger.error(`Error fetching tracking link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching tracking link' });
  }
};

// Update tracking link
export const updateTrackingLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, targetUrl, isActive } = req.body;

    const trackingLink = await TrackingLink.findById(id);
    if (!trackingLink) {
      return res.status(404).json({ message: 'Tracking link not found' });
    }

    trackingLink.name = name || trackingLink.name;
    trackingLink.description = description !== undefined ? description : trackingLink.description;
    trackingLink.targetUrl = targetUrl || trackingLink.targetUrl;
    trackingLink.isActive = isActive !== undefined ? isActive : trackingLink.isActive;

    await trackingLink.save();

    logger.info(`Tracking link updated: ${trackingLink.trackingCode}`);

    res.status(200).json({
      message: 'Tracking link updated successfully',
      trackingLink
    });
  } catch (error) {
    logger.error(`Error updating tracking link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error updating tracking link' });
  }
};

// Delete tracking link
export const deleteTrackingLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trackingLink = await TrackingLink.findById(id);
    if (!trackingLink) {
      return res.status(404).json({ message: 'Tracking link not found' });
    }

    // Delete associated tracking events
    await TrackingEvent.deleteMany({ trackingLinkId: id });

    await TrackingLink.findByIdAndDelete(id);

    logger.info(`Tracking link deleted: ${trackingLink.trackingCode}`);

    res.status(200).json({ message: 'Tracking link deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting tracking link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error deleting tracking link' });
  }
};

// Track link click
export const trackLinkClick = async (req: Request, res: Response) => {
  try {
    const { trackingCode } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const userAgent = req.get('User-Agent') || '';
    const referrer = req.get('Referrer') || '';

    const trackingLink = await TrackingLink.findOne({ trackingCode, isActive: true });
    if (!trackingLink) {
      return res.status(404).json({ message: 'Tracking link not found or inactive' });
    }

    // Create tracking event
    const trackingEvent = new TrackingEvent({
      trackingLinkId: trackingLink._id,
      eventType: 'click',
      ipAddress,
      userAgent,
      referrer,
      sessionId: req.sessionID
    });

    await trackingEvent.save();

    // Update tracking link stats
    trackingLink.clickCount += 1;
    if (trackingLink.clickCount > 0) {
      trackingLink.conversionRate = (trackingLink.loginCount / trackingLink.clickCount) * 100;
    }
    await trackingLink.save();

    logger.info(`Link click tracked: ${trackingCode} from IP ${ipAddress}`);

    // Set tracking cookie for 30 days
    res.cookie('tracking_code', trackingCode, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Redirect to target URL
    res.redirect(trackingLink.targetUrl);
  } catch (error) {
    logger.error(`Error tracking link click: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error processing tracking link' });
  }
};

// Track user login (called when user successfully logs in)
export const trackUserLogin = async (req: Request, res: Response) => {
  try {
    const { trackingCode } = req.params;
    const userId = (req.user as any)?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const trackingLink = await TrackingLink.findOne({ trackingCode });
    if (!trackingLink) {
      return res.status(404).json({ message: 'Tracking link not found' });
    }

    // Check if this user has already been counted for this tracking link
    const existingLoginEvent = await TrackingEvent.findOne({
      trackingLinkId: trackingLink._id,
      eventType: 'login',
      userId: userId
    });

    if (existingLoginEvent) {
      return res.status(200).json({ message: 'Login already tracked for this user' });
    }

    // Create tracking event
    const trackingEvent = new TrackingEvent({
      trackingLinkId: trackingLink._id,
      eventType: 'login',
      userId: userId,
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('User-Agent') || '',
      sessionId: req.sessionID
    });

    await trackingEvent.save();

    // Update tracking link stats
    trackingLink.loginCount += 1;
    if (trackingLink.clickCount > 0) {
      trackingLink.conversionRate = (trackingLink.loginCount / trackingLink.clickCount) * 100;
    }
    await trackingLink.save();

    logger.info(`User login tracked: ${trackingCode} for user ${userId}`);

    res.status(200).json({ message: 'Login tracked successfully' });
  } catch (error) {
    logger.error(`Error tracking user login: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error tracking login' });
  }
};

// Get tracking statistics
export const getTrackingStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { period = '7d' } = req.query;

    const trackingLink = await TrackingLink.findById(id);
    if (!trackingLink) {
      return res.status(404).json({ message: 'Tracking link not found' });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get events for the period
    const events = await TrackingEvent.find({
      trackingLinkId: trackingLink._id,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });

    // Calculate daily stats
    const dailyStats = await TrackingEvent.aggregate([
      {
        $match: {
          trackingLinkId: trackingLink._id,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            eventType: "$eventType"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          events: {
            $push: {
              eventType: "$_id.eventType",
              count: "$count"
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get recent events with user details
    const recentEvents = await TrackingEvent.find({
      trackingLinkId: trackingLink._id
    })
    .populate('userId', 'username fullName email')
    .sort({ timestamp: -1 })
    .limit(20);

    res.status(200).json({
      trackingLink: {
        id: trackingLink._id,
        name: trackingLink.name,
        description: trackingLink.description,
        targetUrl: trackingLink.targetUrl,
        trackingCode: trackingLink.trackingCode || '',
        trackingUrl: trackingLink.trackingUrl,
        isActive: trackingLink.isActive,
        clickCount: trackingLink.clickCount,
        loginCount: trackingLink.loginCount,
        conversionRate: trackingLink.conversionRate,
        createdAt: trackingLink.createdAt
      },
      periodStats: {
        totalClicks: events.filter(e => e.eventType === 'click').length,
        totalLogins: events.filter(e => e.eventType === 'login').length,
        conversionRate: events.filter(e => e.eventType === 'click').length > 0 
          ? (events.filter(e => e.eventType === 'login').length / events.filter(e => e.eventType === 'click').length) * 100 
          : 0
      },
      dailyStats,
      recentEvents
    });
  } catch (error) {
    logger.error(`Error fetching tracking stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching tracking statistics' });
  }
};

// Get overall tracking dashboard stats
export const getTrackingDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalLinks = await TrackingLink.countDocuments();
    const activeLinks = await TrackingLink.countDocuments({ isActive: true });
    
    const totalClicks = await TrackingEvent.countDocuments({ eventType: 'click' });
    const totalLogins = await TrackingEvent.countDocuments({ eventType: 'login' });
    
    const overallConversionRate = totalClicks > 0 ? (totalLogins / totalClicks) * 100 : 0;

    // Get recent tracking links
    const recentLinks = await TrackingLink.find()
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get top performing links
    const topLinks = await TrackingLink.find()
      .sort({ loginCount: -1 })
      .limit(5);

    res.status(200).json({
      totalLinks,
      activeLinks,
      totalClicks,
      totalLogins,
      overallConversionRate,
      recentLinks,
      topLinks
    });
  } catch (error) {
    logger.error(`Error fetching tracking dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching tracking dashboard statistics' });
  }
}; 