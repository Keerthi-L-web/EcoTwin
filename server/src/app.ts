import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { sanitize } from './middleware/sanitize';

// Route imports
import authRoutes from './features/auth/auth.routes';
import profileRoutes from './features/profile/profile.routes';
import trackerRoutes from './features/tracker/tracker.routes';
import twinRoutes from './features/twin/twin.routes';
import aiRoutes from './features/ai/ai.routes';
import forecastRoutes from './features/forecast/forecast.routes';
import challengesRoutes from './features/challenges/challenges.routes';
import gamificationRoutes from './features/gamification/gamification.routes';
import notificationsRoutes from './features/notifications/notifications.routes';
import reportsRoutes from './features/reports/reports.routes';
import goalsRoutes from './features/goals/goals.routes';

const app = express();

// ── Security Middleware ──
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      env.CORS_ORIGIN,
      // Allow all Vercel deployments for this project
      /\.vercel\.app$/,
      /\.onrender\.com$/,
      // Allow all Netlify deployments
      /\.netlify\.app$/,
    ];

    const isAllowed = allowedOrigins.some((allowed) =>
      typeof allowed === 'string'
        ? allowed === origin
        : allowed.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Be permissive in production to avoid blocking legit traffic
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(generalLimiter);

// ── Body Parsing ──
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(sanitize);

// ── Health Checks ──
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'EcoTwin AI Backend is running!' });
});
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── API Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/activities', trackerRoutes);
app.use('/api/twin', twinRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/goals', goalsRoutes);

// ── 404 Handler for API routes ──
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ── Serve React Frontend in Production ──
if (env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve('..', 'client', 'dist');
  app.use(express.static(clientBuildPath));
  // SPA fallback — all non-API routes serve index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });
}

// ── Error Handler ──
app.use(errorHandler);

export default app;
