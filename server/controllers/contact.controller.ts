import { Request, Response } from 'express';
import { storage } from '../storage';
import { insertContactSchema } from '@shared/schema';
import { z } from 'zod';
import { contactRateLimiter } from '../utils/rate-limiter';
import { logger } from '../utils/logger';

export const createContactSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const clientIp = Array.isArray(ipAddress) ? ipAddress[0] : ipAddress;
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Check rate limit for contact submissions
    const blockStatus = await contactRateLimiter.isIpBlocked(clientIp);
    if (blockStatus.blocked) {
      const remainingTime = contactRateLimiter.formatRemainingTime(blockStatus.remainingTime || 0);
      logger.warn(`Blocked contact submission attempt from IP ${clientIp} - ${remainingTime} remaining`);
      res.status(429).json({ 
        message: `Too many contact submissions. Please try again in ${remainingTime}.`,
        limited: true,
        remainingTime: blockStatus.remainingTime
      });
      return;
    }

    // Record the attempt
    const attemptResult = await contactRateLimiter.recordFailedAttempt(clientIp);
    if (attemptResult.blocked) {
      const remainingTime = contactRateLimiter.formatRemainingTime(attemptResult.remainingTime || 0);
      logger.warn(`IP ${clientIp} blocked after contact submission attempt`);
      res.status(429).json({ 
        message: `Too many contact submissions. Please try again in ${remainingTime}.`,
        limited: true,
        remainingTime: attemptResult.remainingTime
      });
      return;
    }

    // Validate request body
    const validData = insertContactSchema.parse({
      ...req.body,
      ipAddress: clientIp,
      userAgent
    });
    
    // Create the contact submission
    const submission = await storage.createContactSubmission(validData);
    
    // Reset rate limit on successful submission
    await contactRateLimiter.recordSuccessfulLogin(clientIp);
    
    res.status(201).json({
      ...submission,
      rateLimitInfo: {
        remainingAttempts: await contactRateLimiter.getRemainingAttempts(clientIp),
        limit: 3
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ errors: error.errors });
      return;
    }
    
    logger.error('Error creating contact submission:', error);
    res.status(500).json({ message: 'Failed to create contact submission' });
  }
};

export const getContactSubmissions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const submissions = await storage.getContactSubmissions();
    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error getting contact submissions:', error);
    res.status(500).json({ message: 'Failed to retrieve contact submissions' });
  }
};

export const getContactSubmissionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissionId = parseInt(req.params.id);
    
    if (isNaN(submissionId)) {
      res.status(400).json({ message: 'Invalid submission ID' });
      return;
    }
    
    const submission = await storage.getContactSubmissionById(submissionId.toString());
    
    if (!submission) {
      res.status(404).json({ message: 'Contact submission not found' });
      return;
    }
    
    res.status(200).json(submission);
  } catch (error) {
    console.error('Error getting contact submission:', error);
    res.status(500).json({ message: 'Failed to retrieve contact submission' });
  }
};

export const markContactSubmissionAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissionId = parseInt(req.params.id);
    
    if (isNaN(submissionId)) {
      res.status(400).json({ message: 'Invalid submission ID' });
      return;
    }
    
    const submission = await storage.getContactSubmissionById(submissionId.toString());
    
    if (!submission) {
      res.status(404).json({ message: 'Contact submission not found' });
      return;
    }
    
    await storage.markContactSubmissionAsRead(submissionId.toString());
    
    res.status(200).json({ message: 'Contact submission marked as read' });
  } catch (error) {
    console.error('Error marking contact submission as read:', error);
    res.status(500).json({ message: 'Failed to mark contact submission as read' });
  }
};

export const deleteContactSubmission = async (req: Request, res: Response): Promise<void> => {
  try {
    const submissionId = parseInt(req.params.id);
    
    if (isNaN(submissionId)) {
      res.status(400).json({ message: 'Invalid submission ID' });
      return;
    }
    
    const submission = await storage.getContactSubmissionById(submissionId.toString());
    
    if (!submission) {
      res.status(404).json({ message: 'Contact submission not found' });
      return;
    }
    
    await storage.deleteContactSubmission(submissionId.toString());
    
    res.status(200).json({ message: 'Contact submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    res.status(500).json({ message: 'Failed to delete contact submission' });
  }
};