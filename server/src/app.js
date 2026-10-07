import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { getDbMode, isDbReady } from './config/db.js';
import { resolveAllowedOrigins } from './config/origins.js';

// Re-exported for backwards compatibility (tests/tools may import it from here).
export { resolveAllowedOrigins };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

  const allowedOrigins = resolveAllowedOrigins();
  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin / non-browser callers send no Origin header.
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true
    })
  );

  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Broad, generous API budget…
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.RATE_LIMIT_MAX) || 2000,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Too many requests, please slow down.' }
    })
  );

  // …and a much stricter budget for authentication endpoints.
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { message: 'Too many authentication attempts, please try again later.' }
    })
  );

  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));

  // Serve the frontend production build when it exists (self-hosted mode).
  const publicPath = path.join(__dirname, '../public');
  const hasPublicBuild = fs.existsSync(path.join(publicPath, 'index.html'));

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'devverse-backend',
      database: isDbReady() ? 'connected' : 'unavailable',
      dbMode: getDbMode(),
      frontendBuild: hasPublicBuild
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/problems', problemRoutes);
  app.use('/api/submissions', submissionRoutes);
  app.use('/api/leaderboards', leaderboardRoutes);
  app.use('/api/achievements', achievementRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/profile', profileRoutes);

  if (hasPublicBuild) {
    app.use(express.static(publicPath));
    // SPA fallback for non-API routes (client-side routing).
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
