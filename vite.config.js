import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Serves the Express API from inside the Vite dev server so the app runs as a
 * single same-origin process in development (no CORS, no second port).
 *
 * Nothing here affects `vite build`: production ships a static `dist/` and the
 * backend runs separately from server/.
 */
function devverseApi() {
  let backend = null;

  const isApiRequest = (url = '') =>
    /^\/(api|uploads|health)(\/|\?|$)/.test(url);

  return {
    name: 'devverse-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!isApiRequest(req.url)) return next();

        try {
          if (!backend) {
            const entry = path.resolve(process.cwd(), 'server/src/dev.js');
            const module = await import(entry);
            backend = await module.getBackend();
          }
          backend(req, res, next);
        } catch (error) {
          console.error('[devverse-api] backend failed to start:', error?.message || error);
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              message: 'The DevVerse API could not start. Check the terminal for details.'
            })
          );
        }
      });
    }
  };
}

// GitHub Pages serves this project under /Devcodein/ — the base must match,
// otherwise hashed asset URLs 404 and the page renders blank.
// Vercel serves at the domain root instead (vercel.json adds the SPA rewrite),
// so the base is only /Devcodein/ outside Vercel builds.
// https://vite.dev/guide/build#public-base-path
export default defineConfig({
    plugins: [react(), devverseApi()],
    base: process.env.VERCEL ? '/' : '/Devcodein/',
    build: {
        outDir: 'dist'
    },
    server: {
        host: '0.0.0.0',
        port: Number(process.env.PORT) || 3000
    }
});
