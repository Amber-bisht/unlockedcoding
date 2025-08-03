import { Request, Response } from 'express';
import { storage } from '../storage';
import { logger } from '../utils/logger';
import achievementController from './achievement.controller';
import AccountDeletion from '../models/AccountDeletion';

// Create or update user profile
export const createOrUpdateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = (req.user as any)?._id;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found' });
      return;
    }

    const { 
      fullName, 
      bio, 
      interest, 
      email,
      githubLink,
      linkedinLink,
      xLink,
      codeforcesLink,
      leetcodeLink,
      collegeName,
      companyName,
      isPlaced
    } = req.body;

    // Update user profile directly
    const updatedUser = await storage.updateUser(userId, {
      fullName,
      bio,
      interest,
      email,
      githubLink,
      linkedinLink,
      xLink,
      codeforcesLink,
      leetcodeLink,
      collegeName,
      companyName,
      isPlaced,
      hasCompletedProfile: true
    });

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if profile is now complete and award achievement
    const hasCompletedProfile = updatedUser.hasCompletedProfile && 
      updatedUser.fullName && 
      updatedUser.bio && 
      updatedUser.interest &&
      updatedUser.email;

    if (hasCompletedProfile) {
      try {
        await achievementController.awardProfileCompletion(userId);
      } catch (error) {
        logger.error('Error awarding profile completion achievement:', error);
        // Don't fail the profile update if achievement fails
      }
    }

    // Return user without password
    const userResponse = updatedUser.toObject();
    const { password: _, ...userWithoutPassword } = userResponse;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    logger.error(`Profile creation/update error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error creating/updating profile' });
  }
};

// Get user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = (req.user as any)?._id;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found' });
      return;
    }

    // Get user with profile data
    const user = await storage.getUser(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Return profile data
    const profile = {
      fullName: user.fullName,
      bio: user.bio,
      interest: user.interest,
      email: user.email,
      githubLink: user.githubLink,
      linkedinLink: user.linkedinLink,
      xLink: user.xLink,
      codeforcesLink: user.codeforcesLink,
      leetcodeLink: user.leetcodeLink,
      collegeName: user.collegeName,
      companyName: user.companyName,
      isPlaced: user.isPlaced,
      profileImageUrl: user.profileImageUrl,
      avatar: user.avatar
    };

    res.status(200).json(profile);
  } catch (error) {
    logger.error(`Get profile error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error getting profile' });
  }
};

// Get user enrollments
export const getUserEnrollments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const userId = (req.user as any)?._id;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found' });
      return;
    }
    const enrollments = await storage.getUserEnrollments(userId);
    res.status(200).json(enrollments);
  } catch (error) {
    logger.error(`Get user enrollments error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error getting user enrollments' });
  }
};

// Delete user account
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const userId = (req.user as any)?._id;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found' });
      return;
    }

    const { reason, feedback } = req.body;

    if (!reason) {
      res.status(400).json({ message: 'Deletion reason is required' });
      return;
    }

    // Get user before deletion
    const user = await storage.getUser(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Create account deletion record
    const accountDeletion = new AccountDeletion({
      userId,
      username: user.username,
      email: user.email,
      reason,
      feedback
    });

    await accountDeletion.save();

    // Mark user as deleted
    await storage.updateUser(userId, {
      isDeleted: true,
      deletionReason: reason,
      deletedAt: new Date()
    });

    // Log out the user
    req.logout((err) => {
      if (err) {
        logger.error('Error logging out user after account deletion:', err);
      }
    });

    logger.info(`Account deleted for user ${userId} with reason: ${reason}`);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error(`Account deletion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error deleting account' });
  }
};