import { Request, Response } from 'express';
import AccountDeletion from '../models/AccountDeletion';
import User from '../models/User';
import { logger } from '../utils/logger';
import Ticket from '../models/Ticket';

export class AdminController {
  
  // Get account deletion analytics
  async getAccountDeletionAnalytics(req: Request, res: Response) {
    try {
      // Get deletion reasons count
      const deletionReasons = await AccountDeletion.aggregate([
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Get monthly deletion trends
      const monthlyTrends = await AccountDeletion.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$deletedAt' },
              month: { $month: '$deletedAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 }
        },
        {
          $limit: 12
        }
      ]);

      // Get total deletions
      const totalDeletions = await AccountDeletion.countDocuments();

      // Get recent deletions
      const recentDeletions = await AccountDeletion.find()
        .sort({ deletedAt: -1 })
        .limit(10)
        .populate('userId', 'username email');

      res.json({
        deletionReasons,
        monthlyTrends,
        totalDeletions,
        recentDeletions
      });
    } catch (error) {
      logger.error('Error fetching account deletion analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }

  // Get all users with deletion status
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.find({ isDeleted: { $ne: true } })
        .select('-password')
        .sort({ createdAt: -1 });

      res.json(users);
    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  // Get deleted users
  async getDeletedUsers(req: Request, res: Response) {
    try {
      const deletedUsers = await User.find({ isDeleted: true })
        .select('-password')
        .sort({ deletedAt: -1 });

      res.json(deletedUsers);
    } catch (error) {
      logger.error('Error fetching deleted users:', error);
      res.status(500).json({ error: 'Failed to fetch deleted users' });
    }
  }

  // Get user placement statistics
  async getUserPlacementStats(req: Request, res: Response) {
    try {
      const placementStats = await User.aggregate([
        {
          $match: { isDeleted: { $ne: true } }
        },
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            placedUsers: { $sum: { $cond: ['$isPlaced', 1, 0] } },
            unplacedUsers: { $sum: { $cond: ['$isPlaced', 0, 1] } }
          }
        }
      ]);

      const collegeStats = await User.aggregate([
        {
          $match: { 
            isDeleted: { $ne: true },
            collegeName: { $exists: true, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$collegeName',
            count: { $sum: 1 },
            placedCount: { $sum: { $cond: ['$isPlaced', 1, 0] } }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]);

      res.json({
        placementStats: placementStats[0] || { totalUsers: 0, placedUsers: 0, unplacedUsers: 0 },
        collegeStats
      });
    } catch (error) {
      logger.error('Error fetching placement stats:', error);
      res.status(500).json({ error: 'Failed to fetch placement stats' });
    }
  }

  // Get all copyright tickets for admin
  async getAllCopyrightTickets(req: Request, res: Response) {
    try {
      const tickets = await Ticket.find()
        .sort({ createdAt: -1 })
        .select('-__v');

      res.json(tickets);
    } catch (error) {
      logger.error('Error fetching copyright tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch copyright tickets'
      });
    }
  }

  // Update copyright ticket status
  async updateCopyrightTicketStatus(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { status, adminNotes } = req.body;

      if (!status || !['pending', 'reviewing', 'resolved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const updateData: any = { status };
      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes;
      }

      const ticket = await Ticket.findByIdAndUpdate(
        ticketId,
        updateData,
        { new: true }
      );

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      logger.info(`Copyright ticket ${ticket.ticketId} status updated to ${status} by admin`);

      res.json({
        success: true,
        message: 'Ticket status updated successfully',
        data: ticket
      });

    } catch (error) {
      logger.error('Error updating copyright ticket status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update ticket status'
      });
    }
  }

  // Delete copyright ticket
  async deleteCopyrightTicket(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;

      const ticket = await Ticket.findByIdAndDelete(ticketId);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      logger.info(`Copyright ticket ${ticket.ticketId} deleted by admin`);

      res.json({
        success: true,
        message: 'Ticket deleted successfully'
      });

    } catch (error) {
      logger.error('Error deleting copyright ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete ticket'
      });
    }
  }
}

export default new AdminController(); 