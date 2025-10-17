import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import stablecoinRoutes from './routes/stablecoin.js';
import vaultsRoutes from './routes/vaults.js';
import governanceRoutes from './routes/governance.js';
import adminRoutes from './routes/admin.js';
import landingRoutes from './routes/landing.js';
import soldefiAppRoutes from './routes/soldefi-app.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'LATAM DeFi API',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/stablecoin', stablecoinRoutes);
app.use('/api/vaults', vaultsRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/app', soldefiAppRoutes);

app.use(errorHandler);

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
  });
});

const startServer = async () => {
  try {
    const requiredEnvVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET',
    ];

    const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

    if (missingEnvVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
      );
    }

    app.listen(PORT, () => {
      logger.info(`LATAM DeFi API server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
