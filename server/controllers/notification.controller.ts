import { Request, Response } from 'express';
import { Notification, User } from '../models';
import { logger } from '../utils/logger';

export const getAllNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    // Fetch notifications for this user or for all users
    const notifications = await Notification.find({
      $or: [
        { recipients: 'all' },
        { recipients: userId }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    logger.error(`Error fetching notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

export const getUnreadNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    // Fetch notifications for this user or for all users, where userId is not in read array
    const notifications = await Notification.find({
      $or: [
        { recipients: 'all' },
        { recipients: userId }
      ],
      read: { $ne: userId }
    }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    logger.error(`Error fetching unread notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching unread notifications' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    // Add userId to read array if not already present
    if (!notification.read.includes(userId)) {
      notification.read.push(userId);
      await notification.save();
    }
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error(`Error marking notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    // Update all notifications for this user or for all users
    await Notification.updateMany(
      {
        $or: [
          { recipients: 'all' },
          { recipients: userId }
        ],
        read: { $ne: userId }
      },
      { $push: { read: userId } }
    );
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error(`Error marking all notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, type, recipients, expiresAt } = req.body;
    if (!title || !message) {
      res.status(400).json({ message: 'Title and message are required' });
      return;
    }
    const notification = await Notification.create({
      title,
      message,
      type: type || 'info',
      recipients: recipients || 'all',
      expiresAt: expiresAt || undefined
    });
    res.status(201).json(notification);
  } catch (error) {
    logger.error(`Error creating notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error creating notification' });
  }
};

export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};