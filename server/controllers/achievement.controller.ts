import { Request, Response } from 'express';
import Achievement from '../models/Achievement';
import User from '../models/User';
import { logger } from '../utils/logger';

export class AchievementController {
  
  // Get user achievements
  async getUserAchievements(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const achievements = await Achievement.find({ userId })
        .sort({ createdAt: -1 });

      res.json(achievements);
    } catch (error) {
      logger.error('Error fetching user achievements:', error);
      res.status(500).json({ error: 'Failed to fetch achievements' });
    }
  }

  // Check and award profile completion achievement
  async checkProfileCompletion(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if user has completed profile
      const hasCompletedProfile = user.hasCompletedProfile && 
        user.fullName && 
        user.bio && 
        user.interest;

      if (hasCompletedProfile) {
        // Check if achievement already exists
        let achievement = await Achievement.findOne({ 
          userId, 
          type: 'profile_completion' 
        });

        if (!achievement) {
          // Create new achievement
          achievement = new Achievement({
            userId,
            type: 'profile_completion',
            title: 'Profile Pioneer',
            description: 'Completed your profile with all required information',
            icon: 'user-check',
            points: 50,
            isUnlocked: true,
            unlockedAt: new Date()
          });

          await achievement.save();
          logger.info(`Profile completion achievement awarded to user ${userId}`);
        }

        res.json({ 
          success: true, 
          achievement,
          message: 'Profile completion achievement unlocked! 🎉'
        });
      } else {
        res.json({ 
          success: false, 
          message: 'Complete your profile to unlock this achievement' 
        });
      }
    } catch (error) {
      logger.error('Error checking profile completion:', error);
      res.status(500).json({ error: 'Failed to check profile completion' });
    }
  }

  // Award profile completion achievement (called from profile update)
  async awardProfileCompletion(userId: string) {
    try {
      // Check if achievement already exists
      let achievement = await Achievement.findOne({ 
        userId, 
        type: 'profile_completion' 
      });

      if (!achievement) {
        // Create new achievement
        achievement = new Achievement({
          userId,
          type: 'profile_completion',
          title: 'Profile Pioneer',
          description: 'Completed your profile with all required information',
          icon: 'user-check',
          points: 50,
          isUnlocked: true,
          unlockedAt: new Date()
        });

        await achievement.save();
        logger.info(`Profile completion achievement awarded to user ${userId}`);
        return achievement;
      }

      return achievement;
    } catch (error) {
      logger.error('Error awarding profile completion achievement:', error);
      throw error;
    }
  }

  // Get achievement statistics
  async getAchievementStats(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?._id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const achievements = await Achievement.find({ userId });
      const unlockedCount = achievements.filter(a => a.isUnlocked).length;
      const totalPoints = achievements.reduce((sum, a) => sum + (a.isUnlocked ? a.points : 0), 0);

      res.json({
        totalAchievements: achievements.length,
        unlockedCount,
        totalPoints,
        achievements
      });
    } catch (error) {
      logger.error('Error fetching achievement stats:', error);
      res.status(500).json({ error: 'Failed to fetch achievement stats' });
    }
  }
}

export default new AchievementController(); 