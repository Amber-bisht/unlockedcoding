import { Request, Response } from 'express';
import { LoginActivity } from '../models';
import { logger } from '../utils/logger';

// Track user activity (legacy function for login events)
export const trackLoginActivity = async (userId: string, sessionId: string, ipAddress: string, userAgent: string): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    // Find existing activity for today
    let activity = await LoginActivity.findOne({
      userId,
      loginDate: today
    });

    if (activity) {
      // Increment activity count for today
      activity.loginCount += 1;
      activity.updatedAt = new Date();
      await activity.save();
    } else {
      // Create new activity record for today
      activity = new LoginActivity({
        userId,
        loginDate: today,
        loginCount: 1,
        ipAddress,
        userAgent,
        sessionId
      });
      await activity.save();
    }

    logger.info(`User activity tracked for user ${userId} on ${today.toISOString()}`);
  } catch (error) {
    logger.error(`Error tracking user activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Manual add login activity (for testing)
export const addLoginActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = (req.user as any)?._id || (req.session as any)?.passport?.user;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found' });
      return;
    }

    const { date, loginCount = 1 } = req.body;
    
    if (!date) {
      res.status(400).json({ message: 'Date is required' });
      return;
    }

    const loginDate = new Date(date);
    loginDate.setHours(0, 0, 0, 0);

    // Find existing activity for this date
    let activity = await LoginActivity.findOne({
      userId,
      loginDate
    });

    if (activity) {
      // Update existing activity
      activity.loginCount = loginCount;
      activity.updatedAt = new Date();
      await activity.save();
    } else {
      // Create new activity record
      activity = new LoginActivity({
        userId,
        loginDate,
        loginCount,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('User-Agent') || 'Manual Entry',
        sessionId: req.sessionID
      });
      await activity.save();
    }

    logger.info(`Manual login activity added for user ${userId} on ${loginDate.toISOString()}`);
    res.status(200).json({ 
      message: 'Login activity added successfully',
      activity: {
        date: loginDate.toISOString().split('T')[0],
        loginCount: activity.loginCount
      }
    });
  } catch (error) {
    logger.error(`Error adding login activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error adding login activity' });
  }
};

// Get user's login activity for current month calendar
export const getUserLoginActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = (req.user as any)?._id || (req.session as any)?.passport?.user;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found' });
      return;
    }

    // Get current month start and end dates
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const activities = await LoginActivity.find({
      userId,
      loginDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ loginDate: 1 });

    // Create a map of dates to login counts
    const activityMap = new Map();
    activities.forEach(activity => {
      const dateKey = activity.loginDate.toISOString().split('T')[0];
      activityMap.set(dateKey, activity.loginCount);
    });

    // Generate all dates in current month with login counts
    const result = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const loginCount = activityMap.get(dateKey) || 0;
      
      result.push({
        date: dateKey,
        loginCount,
        hasActivity: loginCount > 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      activities: result,
      totalLogins: activities.reduce((sum, activity) => sum + activity.loginCount, 0),
      activeDays: activities.length,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      currentMonth: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        monthName: now.toLocaleDateString('en-US', { month: 'long' })
      }
    });
  } catch (error) {
    logger.error(`Error getting user login activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error retrieving login activity' });
  }
};

// Get login activity for a specific user (admin only) - current month
export const getLoginActivityByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const adminUser = req.user as any;
    if (!adminUser?.isAdmin) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }

    // Get current month start and end dates
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const activities = await LoginActivity.find({
      userId,
      loginDate: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ loginDate: 1 });

    // Create a map of dates to login counts
    const activityMap = new Map();
    activities.forEach(activity => {
      const dateKey = activity.loginDate.toISOString().split('T')[0];
      activityMap.set(dateKey, activity.loginCount);
    });

    // Generate all dates in current month with login counts
    const result = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const loginCount = activityMap.get(dateKey) || 0;
      
      result.push({
        date: dateKey,
        loginCount,
        hasActivity: loginCount > 0
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      activities: result,
      totalLogins: activities.reduce((sum, activity) => sum + activity.loginCount, 0),
      activeDays: activities.length,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      currentMonth: {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        monthName: now.toLocaleDateString('en-US', { month: 'long' })
      }
    });
  } catch (error) {
    logger.error(`Error getting login activity by user ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error retrieving login activity' });
  }
}; 