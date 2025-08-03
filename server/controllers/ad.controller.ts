import { Request, Response } from 'express';
import { Ad } from '../models';
import { logger } from '../utils/logger';

// Get ads for a specific position (categories or courses)
export const getAds = async (req: Request, res: Response): Promise<void> => {
  try {
    const { position } = req.params;
    
    if (!['categories', 'courses'].includes(position)) {
      res.status(400).json({ error: 'Invalid position. Must be "categories" or "courses"' });
      return;
    }

    const ads = await Ad.find({ 
      position, 
      isActive: true 
    }).sort({ order: 1 });

    // Filter out sensitive fields for non-admin users
    const isAdmin = (req.user as any)?.isAdmin;
    const filteredAds = ads.map(ad => {
      const adObj = ad.toObject();
      if (!isAdmin) {
        // Remove click tracking fields for non-admin users
        const { clickCount, loggedInClickCount, ...publicAd } = adObj;
        return publicAd;
      }
      return adObj;
    });

    res.status(200).json(filteredAds);
  } catch (error) {
    logger.error(`Get ads error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
};

// Create a new ad (admin only)
export const createAd = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!(req.user as any)?.isAdmin) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    const { name, description, imageUrl, linkUrl, position, order } = req.body;

    // Validate required fields
    if (!name || !imageUrl || !linkUrl || !position) {
      res.status(400).json({ error: 'Name, imageUrl, linkUrl, and position are required' });
      return;
    }

    if (!['categories', 'courses'].includes(position)) {
      res.status(400).json({ error: 'Position must be "categories" or "courses"' });
      return;
    }

    const ad = new Ad({
      name,
      description,
      imageUrl,
      linkUrl,
      position,
      order: order || 1
    });

    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    logger.error(`Create ad error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ error: 'Failed to create ad' });
  }
};

// Update an ad (admin only)
export const updateAd = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!(req.user as any)?.isAdmin) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;

    // Validate position if provided
    if (updateData.position && !['categories', 'courses'].includes(updateData.position)) {
      res.status(400).json({ error: 'Position must be "categories" or "courses"' });
      return;
    }

    const ad = await Ad.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!ad) {
      res.status(404).json({ error: 'Ad not found' });
      return;
    }

    res.status(200).json(ad);
  } catch (error) {
    logger.error(`Update ad error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ error: 'Failed to update ad' });
  }
};

// Delete an ad (admin only)
export const deleteAd = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!(req.user as any)?.isAdmin) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    const { id } = req.params;
    const ad = await Ad.findByIdAndDelete(id);

    if (!ad) {
      res.status(404).json({ error: 'Ad not found' });
      return;
    }

    res.status(200).json({ message: 'Ad deleted successfully' });
  } catch (error) {
    logger.error(`Delete ad error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ error: 'Failed to delete ad' });
  }
};

// Get all ads (admin only)
export const getAllAds = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!(req.user as any)?.isAdmin) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    const ads = await Ad.find().sort({ position: 1, order: 1 });
    res.status(200).json(ads);
  } catch (error) {
    logger.error(`Get all ads error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
};

// Track ad click
export const trackAdClick = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isLoggedIn = !!(req.user as any)?._id;

    const ad = await Ad.findById(id);
    if (!ad) {
      res.status(404).json({ error: 'Ad not found' });
      return;
    }

    // Update click counts
    ad.clickCount += 1;
    if (isLoggedIn) {
      ad.loggedInClickCount += 1;
    }

    await ad.save();

    // Return the ad's link URL for redirect
    res.status(200).json({ 
      redirectUrl: ad.linkUrl,
      message: 'Click tracked successfully'
    });
  } catch (error) {
    logger.error(`Track ad click error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ error: 'Failed to track click' });
  }
};

// Get ad statistics (admin only)
export const getAdStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!(req.user as any)?.isAdmin) {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    const stats = await Ad.aggregate([
      {
        $group: {
          _id: null,
          totalAds: { $sum: 1 },
          activeAds: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalClicks: { $sum: '$clickCount' },
          totalLoggedInClicks: { $sum: '$loggedInClickCount' },
          avgClicksPerAd: { $avg: '$clickCount' }
        }
      }
    ]);

    const positionStats = await Ad.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 },
          totalClicks: { $sum: '$clickCount' },
          loggedInClicks: { $sum: '$loggedInClickCount' }
        }
      }
    ]);

    res.status(200).json({
      overall: stats[0] || {
        totalAds: 0,
        activeAds: 0,
        totalClicks: 0,
        totalLoggedInClicks: 0,
        avgClicksPerAd: 0
      },
      byPosition: positionStats
    });
  } catch (error) {
    logger.error(`Get ad stats error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ error: 'Failed to fetch ad statistics' });
  }
}; 