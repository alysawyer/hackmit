import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';

// Import routes
import questionsRouter from './routes/questions.js';
import evalRouter from './routes/eval.js';
import sttRouter from './routes/stt.js';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(limiter);
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use('/api/questions', questionsRouter);
app.use('/api/eval', evalRouter);
app.use('/api/stt', sttRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
  });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 CORS origin: ${env.CORS_ORIGIN}`);
});
