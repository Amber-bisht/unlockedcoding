import { Request, Response } from 'express';
import { Comment, Enrollment } from '../models';
import { filterBadWords, containsURL } from '../utils/commentUtils';
import { commentRateLimiter } from '../utils/rate-limiter';
import { logger } from '../utils/logger';

// Get comments for a course with pagination
export const getComments = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    const comments = await Comment.find({ course: courseId })
      .populate('user', 'username email avatar fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    // Map to only send username and avatar
    const mappedComments = comments.map((c: any) => ({
      _id: c._id,
      user: {
        username: c.user?.username || (c.user?.email ? c.user.email.split('@')[0] : 'User'),
        avatar: c.user?.avatar || null,
        fullName: c.user?.fullName || null,
        _id: c.user?._id,
      },
      course: c.course,
      content: c.content,
      createdAt: c.createdAt,
      __v: c.__v,
    }));
    res.json(mappedComments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Add a comment to a course
export const addComment = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.id;
    const userId = (req.user as any)?._id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check rate limit for comment submissions
    const rateLimitStatus = await commentRateLimiter.isUserRateLimited(userId.toString());
    if (rateLimitStatus.limited) {
      const remainingTime = commentRateLimiter.formatRemainingTime(rateLimitStatus.remainingTime || 0);
      logger.warn(`User ${userId} rate limited for comment submission - ${remainingTime} remaining`);
      return res.status(429).json({ 
        error: `Rate limit exceeded. You can submit ${rateLimitStatus.remainingAttempts} more comments today. Please try again in ${remainingTime}.`,
        limited: true,
        remainingTime: rateLimitStatus.remainingTime,
        remainingAttempts: rateLimitStatus.remainingAttempts
      });
    }

    // Record the attempt
    const attemptResult = await commentRateLimiter.recordAttempt(userId.toString());
    if (attemptResult.limited) {
      const remainingTime = commentRateLimiter.formatRemainingTime(attemptResult.remainingTime || 0);
      logger.warn(`User ${userId} blocked after comment submission attempt - ${remainingTime} remaining`);
      return res.status(429).json({ 
        error: `Rate limit exceeded. Please try again in ${remainingTime}.`,
        limited: true,
        remainingTime: attemptResult.remainingTime
      });
    }

    let { content } = req.body;

    // Enrollment check removed
    // const isEnrolled = await Enrollment.findOne({ user: userId, course: courseId });
    // if (!isEnrolled) {
    //   return res.status(403).json({ error: 'You must be enrolled to comment.' });
    // }

    // Check max 5 comments per user per course
    const userCommentsCount = await Comment.countDocuments({ user: userId, course: courseId });
    if (userCommentsCount >= 5) {
      return res.status(400).json({ error: 'You can only add up to 5 comments per course.' });
    }

    // Check for URLs
    if (containsURL(content)) {
      return res.status(400).json({ error: 'Comments cannot contain URLs.' });
    }

    // Filter bad words
    content = filterBadWords(content);

    const comment = new Comment({ user: userId, course: courseId, content });
    await comment.save();

    // Reset rate limit on successful comment
    await commentRateLimiter.resetAttempts(userId.toString());

    res.status(201).json({
      ...comment.toObject(),
      rateLimitInfo: {
        remainingAttempts: attemptResult.remainingAttempts,
        limit: 10
      }
    });
  } catch (err) {
    logger.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Get all comments (admin only)
export const getAllComments = async (req: Request, res: Response) => {
  try {
    if (!(req.user as any)?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    const comments = await Comment.find()
      .populate('user', 'email username')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    
    const mappedComments = comments.map((c: any) => ({
      _id: c._id,
      user: {
        username: c.user?.username || (c.user?.email ? c.user.email.split('@')[0] : 'User'),
        email: c.user?.email,
      },
      course: c.course?.title || 'Unknown Course',
      content: c.content,
      createdAt: c.createdAt,
    }));
    
    res.json(mappedComments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Delete a comment (admin only)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    if (!(req.user as any)?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
}; 