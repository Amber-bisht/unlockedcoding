import { Request, Response } from 'express';
import { Review, User } from '../models';
import { logger } from '../utils/logger';

// Define interfaces for populated documents
interface PopulatedReview {
  _id: any;
  userId: any;
  courseId: any;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    _id: any;
    username: string;
    avatar?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };
  course?: {
    _id: any;
    title: string;
    categoryId?: {
      _id: any;
      name: string;
    };
  };
}

// Get featured testimonials for home page
export const getFeaturedTestimonials = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Get top-rated reviews with user information
    const testimonials = await Review.find({ rating: { $gte: 4 } })
      .populate({
        path: 'user',
        select: 'username avatar profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName avatar'
        }
      })
      .populate({
        path: 'course',
        select: 'title categoryId',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      })
      .sort({ rating: -1, createdAt: -1 })
      .limit(6) as PopulatedReview[];

    // Transform the data to match the frontend expectations
    const transformedTestimonials = testimonials.map(review => ({
      id: review._id,
      name: review.user?.profile?.firstName && review.user?.profile?.lastName 
        ? `${review.user.profile.firstName} ${review.user.profile.lastName}`
        : review.user?.username || 'Anonymous',
      avatar: review.user?.profile?.avatar || review.user?.avatar || null,
      role: review.course?.categoryId?.name 
        ? `${review.course.categoryId.name} Graduate`
        : 'Student',
      content: review.comment,
      rating: review.rating,
      courseTitle: review.course?.title || 'Programming Course',
      createdAt: review.createdAt
    }));

    res.status(200).json(transformedTestimonials);
  } catch (error) {
    logger.error(`Get featured testimonials error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching testimonials' });
  }
};

// Get all testimonials (for admin or detailed view)
export const getAllTestimonials = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const testimonials = await Review.find()
      .populate({
        path: 'user',
        select: 'username avatar profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName avatar'
        }
      })
      .populate({
        path: 'course',
        select: 'title categoryId',
        populate: {
          path: 'categoryId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit) as PopulatedReview[];

    const total = await Review.countDocuments();

    const transformedTestimonials = testimonials.map(review => ({
      id: review._id,
      name: review.user?.profile?.firstName && review.user?.profile?.lastName 
        ? `${review.user.profile.firstName} ${review.user.profile.lastName}`
        : review.user?.username || 'Anonymous',
      avatar: review.user?.profile?.avatar || review.user?.avatar || null,
      role: review.course?.categoryId?.name 
        ? `${review.course.categoryId.name} Graduate`
        : 'Student',
      content: review.comment,
      rating: review.rating,
      courseTitle: review.course?.title || 'Programming Course',
      createdAt: review.createdAt
    }));

    res.status(200).json({
      testimonials: transformedTestimonials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Get all testimonials error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error fetching testimonials' });
  }
}; 