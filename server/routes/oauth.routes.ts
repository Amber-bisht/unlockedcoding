import express from 'express';
import passport from 'passport';
import { oauthController } from '../controllers';

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/auth/error',
    session: true 
  }), 
  oauthController.googleCallback
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'] 
}));

router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: '/auth/error',
    session: true 
  }), 
  oauthController.githubCallback
);

// OAuth success and error endpoints
router.get('/success', oauthController.oauthSuccess);
router.get('/error', oauthController.oauthError);

export default router; 