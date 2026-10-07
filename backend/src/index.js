import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './routes/auth.routes.js';
import habitRoutes from './routes/habits.routes.js';
import completionRoutes from './routes/completions.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';
import userRoutes from './routes/user.routes.js';
import billingRoutes from './routes/billing.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Production Security Headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));

// SaaS Rate Limiting for Auth and AI APIs (Protects against brute force and token exhaustion)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});

const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 mins
  max: 60,
  message: { message: 'AI rate limit reached. Please wait a moment before asking again.' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// Core Business API Routes
app.use('/api/habits', habitRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/billing', billingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Habit Tracker SaaS API',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
  });
});

// Serve built frontend assets if dist exists (Full-stack single deployment support)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  console.log(`📦 Serving production frontend build from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Habit Tracker SaaS Backend running at http://localhost:${PORT}`);
});
