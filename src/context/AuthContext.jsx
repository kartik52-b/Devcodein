import { isSupabaseConfigured } from '../lib/supabase';
import { LegacyAuthProvider } from './legacyAuthProvider';
import { SupabaseAuthProvider } from './supabaseAuthProvider';

/**
 * Chooses the authentication backend at runtime.
 *
 * - Supabase (email/password, Google OAuth, email verification and password
 *   reset) whenever VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set. This is
 *   the production path and the only one that works on a static Vercel deploy,
 *   because it talks to Postgres directly from the browser through RLS.
 * - The legacy Express + MongoDB + OTP stack otherwise, so existing self-hosted
 *   installations keep working without any configuration change.
 *
 * Both providers publish the same context shape; pages import `useAuth` from
 * this module and never need to know which one is active.
 */
export function AuthProvider({ children }) {
  if (isSupabaseConfigured) return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
  return <LegacyAuthProvider>{children}</LegacyAuthProvider>;
}

export { useAuth } from './authContext';

export default AuthProvider;
