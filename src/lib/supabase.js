import { createClient } from '@supabase/supabase-js';

/**
 * Supabase browser client.
 *
 * Only the project URL and the *public* anon/publishable key belong here — both
 * are safe to ship in a bundle because every table is guarded by Row Level
 * Security. The service-role key must never appear in frontend code or in any
 * VITE_* variable (Vite would inline it into the bundle).
 *
 * When the two variables are missing the app keeps working through the legacy
 * Express API instead of crashing; `isSupabaseConfigured` lets the auth layer
 * choose a provider.
 */

const url = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const anonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(url && anonKey);

const REMEMBER_KEY = 'devverse_remember_session';
const SESSION_KEY = 'devverse-auth';

/**
 * "Keep me signed in" support.
 *
 * Supabase persists the session through the storage adapter below. Returning
 * visitors read the preference before the client is created, so a session
 * marked as temporary lives in sessionStorage and disappears when the tab
 * closes, while a remembered session survives browser restarts.
 */
export const setRememberSession = (remember) => {
  try {
    window.localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
  } catch {
    /* storage disabled — the session simply won't persist */
  }
};

export const getRememberSession = () => {
  try {
    return window.localStorage.getItem(REMEMBER_KEY) !== 'false';
  } catch {
    return true;
  }
};

const authStorage = {
  getItem: (key) => {
    try {
      return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      const target = getRememberSession() ? window.localStorage : window.sessionStorage;
      const other = target === window.localStorage ? window.sessionStorage : window.localStorage;
      other.removeItem(key);
      target.setItem(key, value);
    } catch {
      /* storage disabled */
    }
  },
  removeItem: (key) => {
    try {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    } catch {
      /* storage disabled */
    }
  }
};

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Handles the OAuth callback and the email-confirmation / password
        // recovery links. The implicit flow (supabase-js default) is used on
        // purpose: confirmation and recovery links are frequently opened on a
        // different device, where a PKCE verifier from the original browser
        // does not exist.
        detectSessionInUrl: true,
        storageKey: SESSION_KEY,
        storage: authStorage
      }
    })
  : null;

/** Absolute URL of an app route, honouring the configured Vite base path. */
export const appUrl = (path = '/') => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  return `${window.location.origin}${base}${path.startsWith('/') ? path : `/${path}`}`;
};
