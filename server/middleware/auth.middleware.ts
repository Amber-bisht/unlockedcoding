import { Request, Response, NextFunction } from 'express';
import { UserRole, TeacherApprovalStatus } from '../models/User';

// Middleware to check if the user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Please log in' });
  }
};

// Middleware to check if the user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

// Middleware to check if the user is a teacher (approved)
export const isTeacher = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as any;
    if (user?.role === UserRole.TEACHER && user?.teacherApprovalStatus === TeacherApprovalStatus.APPROVED) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Teacher access required' });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized: Please log in' });
  }
};

// Middleware to check if the user is an admin or approved teacher
export const isAdminOrTeacher = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user as any;
    if (user?.isAdmin || (user?.role === UserRole.TEACHER && user?.teacherApprovalStatus === TeacherApprovalStatus.APPROVED)) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Admin or Teacher access required' });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized: Please log in' });
  }
};

// Middleware to check if user has completed profile
export const hasCompletedProfile = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.hasCompletedProfile) {
    next();
  } else {
    res.status(403).json({ 
      message: 'Profile completion required',
      redirect: '/profile-completion'
    });
  }
};