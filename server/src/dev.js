import './config/env.js';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { seedCatalog } from './seed.js';

/**
 * The Vite dev server mounts this handler for /api, /uploads and /health so
 * the preview runs frontend + backend in a single process (same origin, no
 * CORS, no second port). Production keeps them separate: `npm start` in
 * server/ runs the very same Express app on its own.
 */
let backendPromise = null;

export const getBackend = () => {
  if (!backendPromise) {
    backendPromise = (async () => {
      const app = createApp();
      try {
        const { mode } = await connectDB();
        try {
          await seedCatalog();
        } catch (error) {
          console.warn(`[seed] skipped: ${error.message}`);
        }
        if (mode === 'in-memory') {
          console.warn('[dev] using an ephemeral in-memory MongoDB — data resets on restart.');
        }
      } catch (error) {
        console.warn(`[dev] API running without a database: ${error.message}`);
      }
      return app;
    })().catch((error) => {
      backendPromise = null;
      throw error;
    });
  }
  return backendPromise;
};

export default getBackend;
