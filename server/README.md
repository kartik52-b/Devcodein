# DevVerse Backend

A production-style Node.js + Express + MongoDB backend for the DevVerse platform.

## Features
- JWT authentication with email OTP verification
- Role-based access control
- Secure password hashing
- Rate limiting and security headers
- File upload support (authenticated, type/size allow-list)
- Isolated static-analysis judge for submissions (no server-side code execution)
- Core API modules for users, problems, submissions, leaderboards, achievements, missions, analytics, and notifications

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and adjust values (see the table below)
3. Start the server: `npm start` (or `npm run dev` for auto-reload)
4. Run the API test suite: `npm test`

## Environment variables

All keys are optional in development — sensible defaults are applied. `.env` is
loaded from `server/.env` regardless of the working directory, and values already
present in the process environment are never overridden.

| Key | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | HTTP port for the API server |
| `NODE_ENV` | `development` | Enables production-only behaviour (strict errors, no dev OTP) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/devverse` | Primary database. Unset/unreachable in development falls back to an ephemeral in-memory MongoDB |
| `MONGO_CONNECT_TIMEOUT_MS` | `5000` | Connection timeout before the fallback or failure |
| `MONGO_MEMORY_FALLBACK` | enabled in dev | Set to `false` to disallow the in-memory fallback (always disabled when `NODE_ENV=production`) |
| `JWT_SECRET` | dev fallback (warns) | Token signing secret — **required in production** |
| `JWT_EXPIRES_IN` | `7d` | Access token lifetime |
| `CLIENT_URL` | localhost origins | Comma-separated allowed CORS origins, e.g. `https://devcodein.github.io` |
| `RATE_LIMIT_MAX` | `2000` | General API budget per 15-minute window |
| `AUTH_RATE_LIMIT_MAX` | `100` | Auth endpoint budget per 15-minute window |
| `EMAIL_HOST` | unset | SMTP host. Unset in development → OTP shown in the UI's "Development notice"; production without it returns 503 on OTP endpoints |
| `EMAIL_PORT` | `587` | SMTP port |
| `EMAIL_SECURE` | `false` | Set `true` for implicit TLS (port 465) |
| `EMAIL_USER` / `EMAIL_PASSWORD` | unset | SMTP credentials |
| `EMAIL_FROM` | `DevVerse <no-reply@devverse.local>` | From header for OTP emails |
| `MAX_UPLOAD_BYTES` | `2097152` (2 MB) | Upload size limit |
| `GOOGLE_CLIENT_ID` | unset | OAuth client id (Google Cloud Console → Credentials → OAuth 2.0). Unset → the sign-in page explains Google is not configured |
| `GOOGLE_CLIENT_SECRET` | unset | OAuth client secret — **server-side only, never sent to the browser** |
| `GOOGLE_CALLBACK_URL` | derived | Exact authorized redirect URI, e.g. `https://api.example.com/api/auth/google/callback`. Derived from the request/`CLIENT_URL` when unset |
| `APP_URL` | derived | Canonical frontend URL used for post-OAuth redirects, e.g. `https://kartik52-b.github.io/Devcodein` or `https://devverse.vercel.app`. Falls back to the request origin when it is an allowed `CLIENT_URL` origin |

### Welcome email

A welcome email is sent **once, at account creation only** (email/password
registration and first-time Google sign-in) — never on later logins. The
`welcomeEmailSent` flag on the user document is the server-authoritative
deduplication. Delivery failures are logged server-side and never block
sign-in.

> `.env.example` contains a commented template of this table. It is managed as a
> sensitive file by the Freebuff editor, so this README is the authoritative list.

## Health check

`GET /health` reports
`{ status, service, database, dbMode, frontendBuild }` where `database` is
`connected` or `unavailable` and `dbMode` is `configured`, `in-memory`, or
`unavailable`.

## Google OAuth setup

1. In Google Cloud Console create an **OAuth 2.0 Client ID** (Web application).
2. Authorized JavaScript origins: your frontend URL(s) — include the
   `CLIENT_URL` entries.
3. Authorized redirect URIs: `<api-origin>/api/auth/google/callback`
   (set it exactly via `GOOGLE_CALLBACK_URL`).
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` on the server.
5. Recommended: set `APP_URL` to the frontend URL (with sub-path if any) so
   OAuth always returns to the right place.

Until those keys exist, the **Continue with Google** button redirects back to
the sign-in page with a friendly "not configured" notice — no fake sessions.

## Deployment notes

- **GitHub Pages** (`.github/workflows/deploy.yml`): static `dist/` only, served
  under `/Devcodein/`; the workflow copies `index.html` to `404.html` so deep
  links (`/Devcodein/login`, refresh) render the SPA instead of the repo 404.
  The Express API must run as a separate process; point the client at it with
  `VITE_API_URL` and allow its origin via `CLIENT_URL`.
- **Vercel**: `vercel.json` rewrites all non-API paths to `index.html` (SPA
  fallback), and the build sets `base: '/'` automatically when `VERCEL=1`.
  Set `VITE_API_URL` in the Vercel environment to your hosted API origin and
  add the Vercel domain to the backend `CLIENT_URL`.
