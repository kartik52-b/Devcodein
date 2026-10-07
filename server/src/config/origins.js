/**
 * Allowed browser origins.
 *
 * CLIENT_URL supports a comma separated list and is the only place origins are
 * configured (development and production). Example:
 *   CLIENT_URL=http://localhost:3000,https://devcodein.github.io
 *
 * Each entry may include a path when the frontend is served from a sub-path
 * (e.g. https://kartik52-b.github.io/Devcodein) — the path becomes the SPA
 * base prefix used when building OAuth redirects.
 */
export const resolveAllowedOrigins = () => {
  const configured = (process.env.CLIENT_URL || '')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const defaults = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];
  return [...new Set([...configured, ...defaults])];
};

/** First configured CLIENT_URL entry parsed into origin + base path (or null). */
export const firstAllowedClient = () => {
  const first = (process.env.CLIENT_URL || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)[0];
  if (!first) return null;
  try {
    const url = new URL(first);
    return { origin: url.origin, prefix: url.pathname.replace(/\/$/, '') };
  } catch {
    return null;
  }
};

/**
 * The SPA base path for a frontend pathname: everything before the first
 * recognizable router segment ("/auth", "/dashboard", "/modules", …).
 * Returns '' when the app is served from the domain root.
 */
const ROUTE_MARKERS = [
  '/auth',
  '/login',
  '/register',
  '/verify-otp',
  '/dashboard',
  '/modules',
  '/profile',
  '/leaderboard',
  '/settings',
  '/achievements',
  '/missions',
  '/challenges'
];

export const deriveSpaPrefix = (pathname = '') => {
  for (const marker of ROUTE_MARKERS) {
    // Markers include their own leading slash, so the match position is
    // exactly where the SPA base path ends: '/Devcodein/auth' → '/Devcodein'.
    const index = pathname.indexOf(marker);
    if (index >= 0) {
      return pathname.slice(0, index).replace(/\/$/, '');
    }
  }
  return '';
};
