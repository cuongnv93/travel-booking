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

// Enable reverse proxy trust (for Render, Railway, Cloudflare, Vercel)
app.set('trust proxy', 1);

// Disable x-powered-by header for information disclosure protection
app.disable('x-powered-by');

// Security Headers & Gzip Compression
app.use(compression());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false, // Managed by Next.js frontend
  })
);

// Production JWT security guard
if (process.env.NODE_ENV === 'production') {
  if (constants.JWT_SECRET === 'secret' || constants.JWT_REFRESH_SECRET === 'refresh_secret') {
    console.warn('⚠️ CẢNH BÁO AN NINH: Đang sử dụng JWT secret mặc định trong môi trường production!');
  }
}

// CORS Configuration — support production domains, custom env & local dev
const envOrigins = [
  constants.FRONTEND_URL,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
]
  .filter(Boolean)
  .flatMap((url) => (url as string).split(',').map((u) => u.trim()));

const defaultAllowedOrigins = [
  'https://timesgreen.net',
  'https://www.timesgreen.net',
  'http://timesgreen.net',
  'http://www.timesgreen.net',
  'https://travel-booking-ruby.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envOrigins])).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or curl/mobile requests without origin header
      if (!origin) return callback(null, true);

      let originHostname = '';
      try {
        originHostname = new URL(origin).hostname.toLowerCase();
      } catch {
        originHostname = origin.toLowerCase();
      }

      const isAllowed =
        allowedOrigins.includes(origin) ||
        originHostname === 'timesgreen.net' ||
        originHostname.endsWith('.timesgreen.net') ||
        originHostname === 'travel-booking-ruby.vercel.app' ||
        originHostname.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        return callback(null, true);
      }

      // Do NOT throw Error — return callback(null, false) so browser rejects without 500 server crash
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-Requested-With'],
  })
);

// Body parser with DoS payload bounds
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Static uploads directory with caching headers
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../public/uploads'), {
    maxAge: '7d',
    etag: true,
  })
);

// Health check — responds instantly, no DB needed
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rate limiting on all API routes
app.use('/api', apiLimiter);
app.use('/api', routes);

// Centralized error handling
app.use(errorHandler);

const PORT = constants.PORT || 5000;

// Catch unhandled process-level exceptions to prevent silent crashes
process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Promise Rejection:', reason?.message || reason);
});
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message);
});

connectDB().then(() => {
  // Non-blocking auto-seed for master settings
  runMasterSettingsSeed(false).catch((err) => {
    console.warn('Initial master settings seed skipped:', err.message);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
