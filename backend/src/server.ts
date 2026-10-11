import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { constants } from './config/constants';
import { runMasterSettingsSeed } from './utils/seedMasterSettings';

dotenv.config();

const app = express();

// Security Headers & Gzip Compression
app.use(compression());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
const allowedOrigins = [
  constants.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://travel-booking-ruby.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Body parser with size bounds (DoS mitigation)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(morgan('dev'));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health check — responds instantly, no DB needed — used by keep-alive cron
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate limiting on API routes
app.use('/api', apiLimiter);
app.use('/api', routes);

app.use(errorHandler);

const PORT = constants.PORT || 5000;

connectDB().then(() => {
  // Non-blocking auto-seed for any missing master settings
  runMasterSettingsSeed(false).catch((err) => {
    console.warn('Initial master settings seed skipped:', err.message);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
