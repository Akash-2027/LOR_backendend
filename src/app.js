import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import env from './config/env.js';
import { connectDb } from './config/db.js';
import routes from './routes/index.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// Vercel/other reverse proxies forward client IP via X-Forwarded-For.
app.set('trust proxy', 1);

// HTTPS enforcement in production
if (env.isProd) {
  app.use((req, res, next) => {
    // Vercel sets x-forwarded-proto header
    if (req.header('x-forwarded-proto') !== 'https') {
      res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    next();
  });
}

// Security headers
app.use(helmet());

// CORS — only allow known origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://lor-frontend.vercel.app',
  env.clientBaseUrl // Dynamic origin from environment (production)
].filter(Boolean); // Remove empty values
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true
}));

// Gzip compression
app.use(compression());

// Request logging — pretty in dev, combined format in production
app.use(morgan(env.isProd ? 'combined' : 'dev'));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check — before DB middleware so it always responds
app.get('/health', (req, res) =>
  res.json({ status: 'ok', ...(env.isProd ? {} : { env: env.nodeEnv }) })
);

// In serverless deployments, ensure DB is connected before route handlers run.
app.use(async (req, res, next) => {
  try {
    await connectDb();
    return next();
  } catch (error) {
    return next(error);
  }
});

// Global rate limiter
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// Stricter limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/v1/auth/student/login', authLimiter);
app.use('/api/v1/auth/faculty/login', authLimiter);
app.use('/api/v1/auth/admin/login', authLimiter);
app.use('/api/v1/auth/password', authLimiter);

app.use('/api/v1', routes);

app.use(errorMiddleware);

export default app;
