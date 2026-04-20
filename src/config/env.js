import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Fail fast on startup if required env vars are missing or insecure
const envSchema = z.object({
  NODE_ENV:              z.enum(['development', 'production', 'test']).default('development'),
  PORT:                  z.coerce.number().default(4000),
  MONGO_URI:             z.string().min(10, 'MONGO_URI is required'),
  JWT_SECRET:            z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN:        z.string().default('7d'),
  CLIENT_BASE_URL:       z.string().url().default('http://localhost:5173'),
  RESET_TOKEN_TTL_MINUTES: z.coerce.number().default(15),
  SMTP_HOST:             z.string().default(''),
  SMTP_PORT:             z.coerce.number().default(587),
  SMTP_SECURE:           z.string().default('false'),
  SMTP_USER:             z.string().default(''),
  SMTP_PASS:             z.string().default(''),
  SMTP_FROM:             z.string().default('LOR Portal <no-reply@example.com>'),
  RESEND_API_KEY:        z.string().default(''),
  RESEND_FROM:           z.string().default('LOR Portal <no-reply@gecmodasa.ac.in>'),
  EMAIL_MONTHLY_CAP:     z.coerce.number().default(30)
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const messages = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
  throw new Error(`[env] Invalid environment configuration: ${messages}`);
}

const raw = parsed.data;

const env = {
  nodeEnv:              raw.NODE_ENV,
  port:                 raw.PORT,
  mongoUri:             raw.MONGO_URI,
  jwtSecret:            raw.JWT_SECRET,
  jwtExpiresIn:         raw.JWT_EXPIRES_IN,
  clientBaseUrl:        raw.CLIENT_BASE_URL,
  resetTokenTtlMinutes: raw.RESET_TOKEN_TTL_MINUTES,
  smtpHost:             raw.SMTP_HOST,
  smtpPort:             raw.SMTP_PORT,
  smtpSecure:           raw.SMTP_SECURE === 'true',
  smtpUser:             raw.SMTP_USER,
  smtpPass:             raw.SMTP_PASS,
  smtpFrom:             raw.SMTP_FROM,
  resendApiKey:         raw.RESEND_API_KEY,
  resendFrom:           raw.RESEND_FROM,
  emailMonthlyCap:      raw.EMAIL_MONTHLY_CAP,
  isProd:               raw.NODE_ENV === 'production'
};

export default env;
