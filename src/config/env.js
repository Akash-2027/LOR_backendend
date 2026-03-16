import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lor_nexus',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientBaseUrl: process.env.CLIENT_BASE_URL || 'http://localhost:5173',
  resetTokenTtlMinutes: Number(process.env.RESET_TOKEN_TTL_MINUTES || 15),
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'LOR Portal <no-reply@example.com>'
};

export default env;
