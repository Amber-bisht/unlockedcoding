import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import session from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { logger } from "./utils/logger";
import config from "./config/config";
import { User, PopularCourse, Course } from "./models";
import { authController } from "./controllers";
import apiRoutes from "./routes/index";
import { storage } from "./storage";
import { trackUserActivity } from "./middleware/activity-tracker.middleware";

// Setup passport authentication
const setupPassport = (app: Express) => {
  // Configure session with MongoDB store
  app.use(session({
    secret: config.SESSION_SECRET,
    resave: true, // Save session even if not modified (needed for OAuth)
    saveUninitialized: true, // Save uninitialized sessions (needed for OAuth)
    store: storage.initializeSessionStore(),
    cookie: {
      secure: config.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: config.SESSION_EXPIRY * 1000
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Session debugging middleware for development
  if (config.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      logger.info(`Session debug - Session ID: ${req.sessionID}`);
      logger.info(`Session debug - User: ${req.user ? 'present' : 'not present'}`);
      logger.info(`Session debug - Authenticated: ${req.isAuthenticated ? req.isAuthenticated() : 'function not available'}`);
      logger.info(`Session debug - Passport in session: ${JSON.stringify((req.session as any)?.passport)}`);
      next();
    });
  }

  // Configure local strategy
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        logger.info(`Local strategy - attempting login for username: ${username}`);
        const user = await User.findOne({ username });
        if (!user) {
          logger.info(`Local strategy - user not found: ${username}`);
          return done(null, false, { message: 'Invalid credentials' });
        }

        // Check if user has password (OAuth users might not have one)
        if (!user.password) {
          logger.info(`Local strategy - user has no password: ${username}`);
          return done(null, false, { message: 'Please use OAuth to sign in' });
        }

        const isValid = await authController.comparePasswords(password, user.password);
        if (!isValid) {
          logger.info(`Local strategy - invalid password for user: ${username}`);
          return done(null, false, { message: 'Invalid credentials' });
        }

        logger.info(`Local strategy - authentication successful for user: ${username}`);
        return done(null, user);
      } catch (error) {
        logger.error(`Local strategy error: ${error}`);
        return done(error);
      }
    }
  ));

  // Configure Google OAuth strategy
  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          // Check if user exists with the same email
          if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              // Link existing account with Google ID
              user.googleId = profile.id;
              user.avatar = profile.photos?.[0]?.value;
              user.fullName = profile.displayName;
              await user.save();
            }
          }
          
          if (!user) {
            // Create new user
            const username = profile.emails?.[0]?.value?.split('@')[0] || `user_${profile.id}`;
            // Ensure username is unique
            let uniqueUsername = username;
            let counter = 1;
            while (await User.findOne({ username: uniqueUsername })) {
              uniqueUsername = `${username}_${counter}`;
              counter++;
            }
            
            user = await User.create({
              username: uniqueUsername,
              email: profile.emails?.[0]?.value,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              fullName: profile.displayName,
              isAdmin: false,
              hasCompletedProfile: false
            });
          }
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // Configure GitHub OAuth strategy
  if (config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
      callbackURL: config.GITHUB_CALLBACK_URL,
    }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ githubId: profile.id });
        
        if (!user) {
          // Check if user exists with the same email
          if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              // Link existing account with GitHub ID
              user.githubId = profile.id;
              user.avatar = profile.photos?.[0]?.value;
              user.fullName = profile.displayName;
              await user.save();
            }
          }
          
          if (!user) {
            // Create new user
            const username = profile.username || `user_${profile.id}`;
            // Ensure username is unique
            let uniqueUsername = username;
            let counter = 1;
            while (await User.findOne({ username: uniqueUsername })) {
              uniqueUsername = `${username}_${counter}`;
              counter++;
            }
            
            user = await User.create({
              username: uniqueUsername,
              email: profile.emails?.[0]?.value,
              githubId: profile.id,
              avatar: profile.photos?.[0]?.value,
              fullName: profile.displayName,
              isAdmin: false,
              hasCompletedProfile: false
            });
          }
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }));
  }

  // Serialize and deserialize user
  passport.serializeUser((user: any, done) => {
    logger.info(`Serializing user: ${user.id} (${user.username})`);
    logger.info(`Serializing user object: ${JSON.stringify({ id: user.id, username: user.username, email: user.email })}`);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      logger.info(`Deserializing user: ${id}`);
      const user = await User.findById(id).populate('profile');
      if (!user) {
        logger.error(`User not found during deserialization: ${id}`);
        return done(null, false);
      }
      logger.info(`User deserialized successfully: ${user.username}`);
      done(null, user);
    } catch (error) {
      logger.error(`Deserialization error: ${error}`);
      done(error);
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    // Setup passport
    setupPassport(app);
    logger.info('Passport initialized');

    // Add activity tracking middleware for all API routes
    app.use('/api', trackUserActivity);
    logger.info('Activity tracking middleware registered');

    // Register API routes
    app.use(apiRoutes);
    logger.info('API routes registered');

    // SSR route for SEO static pages for popular courses
    app.get('/:slug', async (req, res, next) => {
      try {
        const { slug } = req.params;
        // Find the popular course by slug
        const popular = await PopularCourse.findOne({ slug }).populate('courseId');
        if (!popular || !popular.courseId) return next(); // Not found, pass to next handler
        const course = popular.courseId as any;
        // Render React header and footer
        // const headerHtml = renderToString(React.createElement(SiteHeaderStatic));
        // const footerHtml = renderToString(React.createElement(SiteFooterStatic));
        // Render a simple HTML template with course info and SEO meta tags
        const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${course.title} | Unlocked Coding</title>
            <meta name="description" content="${course.description}">
            <meta property="og:title" content="${course.title} | Unlocked Coding">
            <meta property="og:description" content="${course.description}">
            <meta property="og:image" content="${course.imageUrl}">
            <meta property="og:type" content="website">
            <meta property="og:url" content="https://unlockedcoding.com/${slug}">
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="${course.title} | Unlocked Coding">
            <meta name="twitter:description" content="${course.description}">
            <meta name="twitter:image" content="${course.imageUrl}">
            <link rel="canonical" href="https://unlockedcoding.com/${slug}">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f9f9f9; }
              .container { max-width: 700px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px; }
              img { max-width: 100%; border-radius: 8px; }
              h1 { margin-top: 0; }
              .meta { color: #666; margin-bottom: 16px; }
              .price { color: #1a8917; font-weight: bold; font-size: 1.2em; }
              .rating { color: #f39c12; font-weight: bold; }
              .syllabus, .learn, .requirements { margin: 16px 0; }
              .explore-btn { display: inline-block; margin-top: 24px; padding: 12px 28px; background: #1a8917; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 1.1em; transition: background 0.2s; }
              .explore-btn:hover { background: #166d13; }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${course.imageUrl}" alt="${course.title}" />
              <h1>${course.title}</h1>
              <div class="meta">By <strong>${course.instructorName}</strong></div>
              <div class="price">Price: $${course.price}</div>
              <div class="rating">Rating: ${course.rating} / 5</div>
              <div class="syllabus"><h3>Syllabus</h3><p>${course.longDescription || course.description}</p></div>
              <div class="learn"><h3>What you'll learn</h3><ul>${(course.learningObjectives || []).map((obj: string) => `<li>${obj}</li>`).join('')}</ul></div>
              <div class="requirements"><h3>Requirements</h3><ul>${(course.requirements || []).map((req: string) => `<li>${req}</li>`).join('')}</ul></div>
              <a class="explore-btn" href="/r">Explore all courses for free</a>
            </div>
          </body>
          </html>
        `;
        res.set('Content-Type', 'text/html');
        res.send(html);
      } catch (err) {
        next(err);
      }
    });

    // Test endpoint for debugging sessions
    app.get('/api/test-session', (req, res) => {
      res.json({
        sessionID: req.sessionID,
        hasSession: !!req.session,
        hasUser: !!req.user,
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
        sessionData: req.session,
        passportData: (req.session as any)?.passport,
        headers: req.headers
      });
    });

    // Test endpoint to manually set session data
    app.post('/api/test-session-set', (req, res) => {
      const { userId } = req.body;
      if (userId) {
        (req.session as any).passport = { user: userId };
        req.session.save((err) => {
          if (err) {
            res.status(500).json({ error: 'Failed to save session' });
          } else {
            res.json({ message: 'Session updated', sessionData: req.session });
          }
        });
      } else {
        res.status(400).json({ error: 'userId required' });
      }
    });

    // Create HTTP server
    const httpServer = createServer(app);
    return httpServer;
  } catch (error) {
    logger.error(`Error setting up server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}
