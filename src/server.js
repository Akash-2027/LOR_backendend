import app from './app.js';
import env from './config/env.js';
import { connectDb } from './config/db.js';
import { ensureAdminAccount } from './services/auth/auth.admin.service.js';

const start = async () => {
  try {
    await connectDb();

    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      await ensureAdminAccount({
        name: process.env.ADMIN_NAME || 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
      console.log('[admin] ensured');
    }

    app.listen(env.port, () => {
      console.log(`[server] running on port ${env.port}`);
    });
  } catch (error) {
    console.error('[server] failed to start', error);
    process.exit(1);
  }
};

start();
