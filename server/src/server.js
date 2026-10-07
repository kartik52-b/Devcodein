import './config/env.js';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { seedCatalog } from './seed.js';

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  const app = createApp();

  try {
    const { mode } = await connectDB();
    try {
      await seedCatalog();
    } catch (error) {
      console.warn(`[seed] skipped: ${error.message}`);
    }
    if (mode === 'in-memory') {
      console.warn('[server] data will not survive a restart (in-memory MongoDB).');
    }
  } catch (error) {
    // Graceful failure: the API still boots and reports 503 on DB routes.
    console.warn(`[server] starting without a database: ${error.message}`);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down…`);
    server.close(async () => {
      await disconnectDB().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer();
