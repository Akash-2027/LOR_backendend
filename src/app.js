import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import { connectDb } from './config/db.js';
import routes from './routes/index.routes.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// Vercel/other reverse proxies forward client IP via X-Forwarded-For.
// Enable trust proxy so express-rate-limit can identify users correctly.
app.set('trust proxy', 1);

app.use(cors({ origin: '*', credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// In serverless deployments, ensure DB is connected before route handlers run.
app.use(async (req, res, next) => {
  try {
    await connectDb();
    return next();
  } catch (error) {
    return next(error);
  }
});

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
);

app.get('/health', (req, res) => res.json({ status: 'ok', env: env.nodeEnv }));

app.use('/api', routes);

app.use(errorMiddleware);

export default app;
