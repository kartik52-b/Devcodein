# DevVerse authentication — setup, deployment and verification

Complete guide for the Supabase-based authentication system (email + password and
Google OAuth) and its Postgres profile store.

- [How it works](#how-it-works)
- [1. Environment variables](#1-environment-variables)
- [2. Create the Supabase project](#2-create-the-supabase-project)
- [3. Run the database migration](#3-run-the-database-migration)
- [4. Configure authentication URLs](#4-configure-authentication-urls)
- [5. Enable Google sign-in](#5-enable-google-sign-in)
- [6. Configure production email delivery](#6-configure-production-email-delivery)
- [7. Local development](#7-local-development)
- [8. Deploy to Vercel](#8-deploy-to-vercel)
- [9. Verification checklist](#9-verification-checklist)
- [10. Security model](#10-security-model)
- [11. Troubleshooting](#11-troubleshooting)
- [Legacy Express/MongoDB mode](#legacy-expressmongodb-mode)

---

## How it works

```
Browser (Vite + React)
  │
  ├── supabase-js ──► Supabase Auth (GoTrue)  ──► auth.users  (passwords, OAuth identities)
  │        │                                  └─► public.profiles  (RLS: own row only)
  │        │
  │        └── access token ──► optional POST /api/auth/supabase ──► Express API (MongoDB)
  │                                                                  problems, submissions …
  └── React Router guards: RequireAuth / PublicOnly
```

- **Identity** lives in Supabase Auth. Passwords are hashed by the provider and are
  never stored in `public.profiles`.
- **Profile** (`full_name`, `email`, `avatar_url`, `created_at`) lives in Postgres
  with Row Level Security. A trigger creates the row the moment a user signs up,
  whether by email or Google.
- **Learning data** (problems, submissions, leaderboards) stays in MongoDB. When the
  Express API is deployed, the browser exchanges its Supabase token for an app token
  at `POST /api/auth/supabase`; the server verifies the Supabase token before
  issuing one. A static Vercel deployment simply skips that exchange.
- **Runtime selection:** if `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set,
  the Supabase provider is used. Otherwise the original Express + MongoDB + OTP
  provider takes over, so self-hosted installs keep working.

Files that make up the system:

| File | Purpose |
| --- | --- |
| `src/lib/supabase.js` | Browser client, "keep me signed in" storage, absolute URL helper |
| `src/context/AuthContext.jsx` | Chooses the provider and re-exports `useAuth` |
| `src/context/supabaseAuthProvider.jsx` | Sessions, profile loading, all auth actions |
| `src/context/legacyAuthProvider.jsx` | Previous Express/OTP implementation |
| `src/services/profileService.js` | RLS-scoped reads/writes of `profiles` |
| `src/components/RequireAuth.jsx` | Private-route guard + redirect-away-from-login |
| `src/pages/AuthPage.jsx` | Login, register, forgot password, verification screens |
| `src/pages/ResetPasswordPage.jsx` | New password after a recovery link |
| `supabase/migrations/…profiles.sql` | Table, trigger, guards, RLS policies, grants |
| `supabase/tests/profiles_rls.test.sql` | Local PostgreSQL test of the RLS rules |

---

## 1. Environment variables

### Frontend (Vercel + local)

| Variable | Required | Where to find it | Public? |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | yes | Supabase → Project Settings → API → Project URL | yes |
| `VITE_SUPABASE_ANON_KEY` | yes | Supabase → Project Settings → API → `anon` / publishable key | yes |
| `VITE_API_URL` | no | Only when the Express API runs on another origin | yes |

Both Supabase values are compiled into the browser bundle. That is safe **only
because RLS protects every table**. Never put `service_role` in any `VITE_*`
variable — Vite would inline it into public JavaScript.

Copy `.env.example` to `.env.local` for development. `.env*` is gitignored.

### Backend (only for self-hosting the Express API)

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI`, `JWT_SECRET` | Existing learning-data API |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Enables `POST /api/auth/supabase` token verification |
| `CLIENT_URL` | Allowed browser origins (CORS) |

---

## 2. Create the Supabase project

1. Sign in at <https://supabase.com/dashboard> → **New project**.
2. Choose a region close to your users and set a strong database password
   (it is only needed for direct SQL access, not by the app).
3. Wait for provisioning, then open **Project Settings → API** and copy the
   **Project URL** and **anon public** key into your environment variables.

No service-role key is needed by the application at any point.

---

## 3. Run the database migration

Open **SQL Editor → New query**, paste the contents of
`supabase/migrations/20261116000000_profiles.sql`, and run it. The script is
idempotent, so it is safe to re-run.

What it creates:

- `public.profiles` — one row per `auth.users.id` (PK + `on delete cascade`),
  `full_name`, `email`, `avatar_url`, `created_at`, `updated_at`.
- `handle_new_user()` — `SECURITY DEFINER` trigger that inserts the profile from
  the signup metadata (`full_name`, `avatar_url`/`picture` from Google).
- `guard_profile_columns()` — blocks clients from changing `id`, `created_at`, or
  `email` (the email copy follows `auth.users` only after the change is confirmed).
- `sync_profile_email()` — updates the profile copy when an address change is
  confirmed.
- RLS policies: `select`, `insert`, `update` only when `auth.uid() = id`; no
  `delete` policy for clients; anonymous role has no privileges at all.

Verify with:

```sql
select relname, relrowsecurity, relforcerowsecurity
  from pg_class where relname = 'profiles';
```

Both columns should be `true`.

Optionally run the local assertion suite against plain PostgreSQL:

```bash
createdb devverse_rls
psql -v ON_ERROR_STOP=1 -d devverse_rls -f supabase/tests/profiles_rls.test.sql
# → All profiles RLS checks passed.
```

### Pre-existing users

If you add this migration to a project that already has auth users, backfill once:

```sql
insert into public.profiles (id, full_name, email, created_at)
select u.id,
       coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
                nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
                split_part(u.email, '@', 1)),
       lower(u.email),
       u.created_at
  from auth.users u
 where not exists (select 1 from public.profiles p where p.id = u.id);
```

The client also calls `profileService.ensure()` after sign-in, so a missing row is
repaired automatically.

---

## 4. Configure authentication URLs

**Authentication → URL Configuration**

| Setting | Value |
| --- | --- |
| Site URL | `https://devverse-five.vercel.app` |
| Redirect URLs | `https://devverse-five.vercel.app/auth` |
| | `https://devverse-five.vercel.app/reset-password` |
| | `http://localhost:3000/auth` |
| | `http://localhost:3000/reset-password` |
| | `https://*-<your-vercel-team>.vercel.app/**` (preview deployments, optional) |

Rules:

- Every URL must match exactly, including the path. A mismatch produces
  `redirect_to` errors or silently returns users to the Site URL.
- If you deploy under a sub-path (the GitHub Pages build uses `/Devcodein/`),
  add that prefix: `https://<user>.github.io/Devcodein/auth`.
- Email confirmation redirects to `/auth?verified=1`; password recovery redirects
  to `/reset-password`. Both are generated from the current origin at runtime, so
  they always match the deployment you are on.

**Authentication → Providers → Email**

- Enable **Email**.
- Keep **Confirm email** on for production. When it is off, Supabase signs users
  in immediately and the verification screen is skipped.
- Minimum password length: 8 is recommended; the app enforces 8 client-side.

**Authentication → Sessions**

- JWT expiry: 3600 seconds (default) is fine; the client refreshes automatically.
- Enable refresh-token rotation (default) so a stolen refresh token is single-use.

---

## 5. Enable Google sign-in

### 5a. Google Cloud console

1. <https://console.cloud.google.com/> → create or select a project.
2. **APIs & Services → OAuth consent screen**: choose *External*, fill in the app
   name (`DevVerse`), support email and developer contact. Add scopes
   `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`. Publish the
   app (or add test users while in *Testing*).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   - Application type: **Web application**
   - Name: `DevVerse Supabase`
   - **Authorized JavaScript origins**
     - `https://devverse-five.vercel.app`
     - `http://localhost:3000`
   - **Authorized redirect URIs**
     - `https://<project-ref>.supabase.co/auth/v1/callback`
       (get the exact value from Supabase → Authentication → Providers → Google)
4. Copy the **Client ID** and **Client secret**.

### 5b. Supabase

1. **Authentication → Providers → Google** → enable.
2. Paste the Client ID and Client secret, then **Save**.
3. Copy the shown **Callback URL** and confirm it is the same URI registered in
   Google Cloud. This is the only redirect URI Google needs — the app itself is
   reached afterwards through Supabase's `redirect_to`.

The app requests `prompt=select_account`, so users can choose which Google account
to use. Name, email and picture arrive in `user_metadata` and are written to
`public.profiles` by the trigger. `access_denied` (user closed the popup or
cancelled the consent screen) is turned into a friendly message instead of an
error page.

No Google password is ever requested or stored by DevVerse.

---

## 6. Configure production email delivery

Supabase's built-in SMTP is rate-limited and intended for testing only (a handful
of messages per hour). For production:

1. Create an account with a transactional email provider and verify your domain.
2. Supabase → **Project Settings → Auth → SMTP Settings** → enable custom SMTP and
   enter host, port, username, password, sender address and sender name.
3. **Authentication → Email Templates** — the defaults are fine; the confirmation
   template must use `{{ .ConfirmationURL }}` and the recovery template
   `{{ .ConfirmationURL }}` too. Both point at `/auth` and `/reset-password`
   because the app supplies `emailRedirectTo` / `redirectTo`.
4. **Authentication → Rate Limits** — raise the email rate limit once custom SMTP
   is active (defaults are deliberately low).

---

## 7. Local development

```bash
cp .env.example .env.local     # then fill in the two Supabase values
npm install
npm run dev                    # http://localhost:3000
```

`http://localhost:3000/auth` and `http://localhost:3000/reset-password` must be in
the Supabase redirect allowlist (see step 4).

To try the legacy Express stack instead, leave both Supabase variables empty.
`npm run dev` then serves the Express API through Vite's middleware, exactly as
before (MongoDB required; the dev fallback uses an in-memory database).

---

## 8. Deploy to Vercel

1. Push the repository; the project already builds with `npm run build` and serves
   `dist/` (see `vercel.json` for the SPA rewrite).
2. **Vercel → Project → Settings → Environment Variables**, add for *Production*
   and *Preview*:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | the anon / publishable key |

   Optionally add `VITE_API_URL` if you host the Express API separately.
3. **Redeploy.** Vite inlines `VITE_*` variables at build time, so adding them
   without a new deployment has no effect.
4. Add the final domain (and any preview domain you use) to Supabase's redirect
   allowlist and Google's authorized origins.
5. Open `https://devverse-five.vercel.app/auth`, sign in with Google and with an
   email account, then complete the checklist below.

CLI alternative:

```bash
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel --prod
```

---

## 9. Verification checklist

Run these against the deployed URL after configuring everything. Each row states
the expected result; anything else is a defect.

| # | Test | Expected |
| --- | --- | --- |
| 1 | Register with a new email | "Check your inbox" screen; profile row appears in `profiles` |
| 2 | Open the confirmation link | Signed in, or "Email confirmed" then sign in |
| 3 | Log in with email + password | Redirect to `/dashboard` (or the page you came from) |
| 4 | Continue with Google | Google account chooser → `/dashboard`; name + picture in `profiles` |
| 5 | Inspect the database | One `profiles` row, `full_name`, `email`, `avatar_url`, `created_at` |
| 6 | Refresh the page | Still signed in; no flash of the login screen |
| 7 | Sign out | Header shows "Sign in"; `/dashboard` redirects to `/auth` |
| 8 | Visit `/dashboard` signed out | Redirect to `/auth?returnTo=%2Fdashboard` |
| 9 | Wrong password / duplicate email | Friendly error, no account created, no enumeration of existing emails |
| 10 | Forgot password on production | Email arrives, link opens `/reset-password`, new password works |
| 11 | Cancel the Google consent screen | Returns to `/auth` with "sign-in was cancelled" |
| 12 | Second browser/profile | Separate session; cannot read the other user's profile |

What has already been exercised in this repository (no live Supabase project
needed), so you only need to re-check the provider-specific rows:

- `supabase/tests/profiles_rls.test.sql` runs the migration and every RLS
  assertion inside a real PostgreSQL 17 engine (PGlite/WASM) and passes; the
  suite fails as expected when an assertion is deliberately broken.
- The React frontend was driven in a browser against a local Supabase-compatible
  test double: register → verify screen, unconfirmed login, duplicate email,
  wrong password, login → dashboard, refresh persistence, `/auth` redirect for
  signed-in users, guarded `/dashboard`, sign-out, remember-me on/off storage,
  expired-session sign-out, unverified-user guard, forgot-password request,
  reset-password with a session (old password stops working), cancelled OAuth
  message, Google authorize request (`provider=google`, `prompt=select_account`,
  `redirect_to=<origin>/auth?oauth=1`), and the 390 px layout.
- Rows 2, 4, 5, 10 and the production half of 12 still require your real
  project: confirmation email delivery, the Google account chooser, and the
  live `profiles` table.

Database-level checks (SQL editor, as `postgres`):

```sql
-- every auth user has exactly one profile
select count(*) from auth.users u
  join public.profiles p on p.id = u.id;         -- equals total profiles

-- RLS cannot be bypassed by the API role
set role authenticated;
select count(*) from public.profiles;            -- only your own row
reset role;
```

---

## 10. Security model

- **Passwords** are hashed and stored by Supabase Auth only. `public.profiles`
  contains no credential, token or secret.
- **RLS is enforced in the database.** `select`, `insert` and `update` require
  `auth.uid() = id`; `delete` is unavailable to clients; `anon` has no grants.
  Hiding UI is never the only protection.
- **Identity columns are immutable** through triggers: `id`, `created_at`, and
  `email` (which only changes after Supabase confirms the new address).
- **Service-role key** is never used by the frontend and never needed by the app.
- **Sessions** are JWT pairs refreshed automatically; "keep me signed in" decides
  between `localStorage` (persistent) and `sessionStorage` (this tab only).
- **Email enumeration** is avoided: duplicate signups and password resets return
  neutral messages.
- **Input validation** runs in the browser (required fields, email shape, password
  length, matching confirmation) and again in Postgres (length checks on
  `full_name`) and Supabase Auth (email format, password policy, rate limits).
- **Self-hosted API bridge**: `POST /api/auth/supabase` verifies the presented
  token directly with Supabase before issuing an app token; it never trusts a
  client-supplied email or user id. Auth endpoints are rate-limited.

---

## 11. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `redirect_to` mismatch or login returns to the Site URL | Add the exact URL (origin **and** path) to Supabase redirect URLs |
| Google: `redirect_uri_mismatch` | Authorized redirect URI must be `https://<ref>.supabase.co/auth/v1/callback` |
| Google button returns "cancelled" immediately | Provider disabled or client ID/secret wrong in Supabase |
| `Database error saving new user` | Migration not run, or trigger missing → re-run the migration |
| Profile row empty but login works | `profiles` trigger skipped for pre-existing users → run the backfill query |
| No emails arrive | Default SMTP is rate-limited; configure custom SMTP and check spam |
| `Invalid login credentials` for a Google-only account | Expected: that account has no password. Use "Continue with Google" |
| New env vars have no effect on Vercel | `VITE_*` is baked at build time → redeploy |
| Dashboard accessible but data empty | RLS blocks reads without a session; sign in again |
| `Auth session missing!` after reset link | Link expired or already used → request a new one |

---

## Legacy Express/MongoDB mode

With `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` unset, `AuthContext` mounts the
original provider: bcrypt + JWT + OTP email through the Express API. Google OAuth
in that mode uses the server-side `/api/auth/google/start` flow and needs
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `CLIENT_URL` in `server/.env`.
Nothing in the legacy path changed, so existing self-hosted deployments keep
working; the Supabase path is independent and recommended for Vercel.
