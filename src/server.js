import app from './app.js';
import env from './config/env.js';
import logger from './utils/logger.js';
import { connectDb } from './config/db.js';
import { ensureAdminAccount } from './services/auth/auth.admin.service.js';

// Catch uncaught errors before they silently crash the process
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, '[server] Unhandled promise rejection');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, '[server] Uncaught exception');
  process.exit(1);
});

const start = async () => {
  try {
    await connectDb();
    logger.info('[db] connected');

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      await ensureAdminAccount({
        name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
      logger.info('[admin] account ensured');
    }

    const server = app.listen(env.port, () => {
      logger.info(`[server] running on port ${env.port} (${env.nodeEnv})`);
    });

    // Graceful shutdown — finish in-flight requests, close DB connection cleanly
    const shutdown = (signal) => {
      logger.info(`[server] ${signal} received — shutting down gracefully`);
      server.close(async () => {
        try {
          const mongoose = (await import('mongoose')).default;
          await mongoose.connection.close();
          logger.info('[server] DB connection closed — process exiting');
        } catch (err) {
          logger.error({ err }, '[server] Error during shutdown');
        } finally {
          process.exit(0);
        }
      });

      // Force exit after 10s if shutdown hangs
      setTimeout(() => {
        logger.warn('[server] Graceful shutdown timeout — forcing exit');
        process.exit(1);
      }, 10_000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (error) {
    logger.error({ error }, '[server] failed to start');
    process.exit(1);
  }
};

start();
