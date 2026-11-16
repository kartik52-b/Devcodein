import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appUrl, setRememberSession, supabase } from '../lib/supabase';
import { profileService } from '../services/profileService';
import { authApi } from '../services/authApi';
import { clearToken } from '../services/api';
import { useProfile } from './ProfileContext';
import { AuthContext } from './authContext';

/**
 * Supabase-backed authentication provider.
 *
 * Responsibilities:
 *  - owns the session (restore, refresh, sign-out, cross-tab sync),
 *  - loads the Postgres profile row through RLS-protected queries,
 *  - exposes the same value shape as the legacy provider so every page that
 *    calls `useAuth()` keeps working unchanged,
 *  - exchanges the Supabase access token for an app token when the optional
 *    Express API is reachable, so learning data keeps working too.
 */

const USER_CACHE_KEY = 'devverse_auth_user';

const readCachedUser = () => {
  try {
    const raw = window.localStorage.getItem(USER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const cacheUser = (nextUser) => {
  try {
    if (nextUser) window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(nextUser));
    else window.localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    /* storage disabled */
  }
};

const isVerified = (authUser) =>
  Boolean(authUser?.email_confirmed_at || authUser?.confirmed_at);

/** Turns a Supabase auth user + profile row into the app's user shape. */
const toUser = (authUser, profile) => {
  const metadata = authUser?.user_metadata || {};
  const email = profile?.email || authUser?.email || '';
  return {
    id: authUser?.id,
    name:
      profile?.full_name ||
      metadata.full_name ||
      metadata.name ||
      (email ? email.split('@')[0] : 'Learner'),
    email,
    avatar: profile?.avatar_url || metadata.avatar_url || metadata.picture || '',
    role: 'user',
    provider: authUser?.app_metadata?.provider || 'email',
    isEmailVerified: isVerified(authUser),
    createdAt: profile?.created_at || authUser?.created_at || null,
    xp: 0,
    level: 1,
    streak: 0,
    longestStreak: 0,
    solvedProblems: 0,
    solvedProblemIds: [],
    badges: [],
    achievements: []
  };
};

/** Human copy for the errors Supabase returns — never echo raw codes. */
const mapAuthError = (error) => {
  const raw = String(error?.message || error?.error_description || error || '').trim();

  if (/invalid login credentials/i.test(raw)) {
    return 'Email or password is incorrect. Check both fields and try again.';
  }
  if (/email not confirmed/i.test(raw)) {
    return 'Confirm your email address before signing in. We can send a fresh verification link.';
  }
  if (/user already registered|already been registered/i.test(raw)) {
    return 'An account with this email already exists. Sign in instead, or reset your password.';
  }
  if (/password should be at least|weak password|password is too short/i.test(raw)) {
    return 'Choose a stronger password with at least 8 characters.';
  }
  if (/rate limit|too many requests|for security purposes/i.test(raw)) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (/invalid api key|no api key|supabase url/i.test(raw)) {
    return 'Authentication is misconfigured. Check the Supabase URL and anon key setup.';
  }
  if (/token has expired|invalid token|jwt expired|session.*expired/i.test(raw)) {
    return 'Your session expired. Please sign in again.';
  }
  if (/failed to fetch|networkerror|load failed/i.test(raw)) {
    return 'We could not reach the authentication service. Check your connection and try again.';
  }
  return raw || 'Something went wrong. Please try again.';
};

const readReturnTo = () => {
  const value = new URLSearchParams(window.location.search).get('returnTo');
  return value && value.startsWith('/') && !value.startsWith('//') ? value : null;
};

export function SupabaseAuthProvider({ children }) {
  const navigate = useNavigate();
  const { upsertProfile } = useProfile();

  const [user, setUser] = useState(readCachedUser);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  // ProfileContext rebuilds these callbacks on every render; refs keep the
  // session listeners stable.
  const upsertRef = useRef(upsertProfile);
  useEffect(() => {
    upsertRef.current = upsertProfile;
  }, [upsertProfile]);

  const lastToken = useRef(null);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  const syncProfileStore = useCallback((nextUser) => {
    if (!nextUser) return;
    upsertRef.current?.({
      id: nextUser.id,
      name: nextUser.name,
      email: nextUser.email,
      photo: nextUser.avatar || '',
      avatar: nextUser.avatar || undefined,
      xp: nextUser.xp || 0,
      level: nextUser.level || 1,
      streak: nextUser.streak || 0,
      longestStreak: nextUser.longestStreak || nextUser.streak || 0,
      solvedCount: nextUser.solvedProblems || 0,
      serverSolvedIds: nextUser.solvedProblemIds || []
    });
  }, []);

  const resetLocalSession = useCallback(() => {
    lastToken.current = null;
    setUser(null);
    cacheUser(null);
    clearToken();
    setPendingVerification(false);
    setPendingEmail('');
  }, []);

  /**
   * Loads the profile row for a session. Deferred out of Supabase's auth
   * callback because the client holds an internal lock while it emits events.
   */
  const loadSession = useCallback(
    async (session, { refreshProfile = true } = {}) => {
      if (!session?.user) {
        resetLocalSession();
        setIsBootstrapping(false);
        return;
      }

      const authUser = session.user;
      const base = toUser(authUser, null);
      setUser(base);
      cacheUser(base);
      setPendingVerification(!isVerified(authUser));
      setPendingEmail(authUser.email || '');

      if (refreshProfile) {
        let row = null;
        try {
          row = await profileService.fetch(authUser.id);
          if (!row) row = await profileService.ensure(authUser);
        } catch (profileError) {
          // A missing/unreachable profiles table must not sign the user out:
          // the session is still valid, only the extra profile data is stale.
          console.warn('[auth] profile load failed:', profileError?.message || profileError);
        }

        const merged = toUser(authUser, row);
        setUser((previous) => ({ ...previous, ...merged }));
        cacheUser(merged);
        syncProfileStore(merged);
      }

      // Optional bridge: the Express API still serves problems, submissions
      // and leaderboards. It accepts the Supabase access token and answers
      // with its own short-lived app token.
      authApi
        .exchangeSupabaseToken(session.access_token)
        .then((payload) => {
          if (!payload?.user) return;
          setUser((previous) => {
            if (!previous) return previous;
            const enriched = {
              ...previous,
              xp: payload.user.xp ?? previous.xp,
              level: payload.user.level ?? previous.level,
              streak: payload.user.streak ?? previous.streak,
              longestStreak: payload.user.longestStreak ?? previous.longestStreak,
              solvedProblems: payload.user.solvedProblems ?? previous.solvedProblems,
              solvedProblemIds: payload.user.solvedProblemIds ?? previous.solvedProblemIds
            };
            cacheUser(enriched);
            return enriched;
          });
        })
        .catch(() => {
          /* No Express API in this deployment — profile data is enough. */
        });

      setIsBootstrapping(false);
    },
    [resetLocalSession, syncProfileStore]
  );

  // ------------------------------------------------------------- session
  useEffect(() => {
    if (!supabase) {
      setIsBootstrapping(false);
      return undefined;
    }

    let active = true;

    const apply = (session, options) => {
      if (!active) return;
      const token = session?.access_token || null;
      if (token && token === lastToken.current) return;
      lastToken.current = token;
      void loadSession(session, options);
    };

    supabase.auth
      .getSession()
      .then(({ data }) => apply(data.session))
      .catch(() => {
        if (active) setIsBootstrapping(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (event === 'SIGNED_OUT') {
        resetLocalSession();
        setIsBootstrapping(false);
        return;
      }
      // Defer so profile queries never run inside the auth lock.
      setTimeout(() => {
        if (!active) return;
        if (event === 'TOKEN_REFRESHED') {
          lastToken.current = session?.access_token || null;
          return;
        }
        apply(session);
      }, 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [loadSession, resetLocalSession]);

  // -------------------------------------- URL flags (OAuth + verification)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const errorCode = params.get('error') || hash.get('error') || '';
    const errorDescription = params.get('error_description') || hash.get('error_description') || '';
    const oauthError = errorDescription || errorCode;
    if (oauthError) {
      // Supabase reports a cancelled prompt as error=access_denied and/or a
      // description such as "User denied access", so check both fields.
      const denied = /access_denied|access denied|user denied|user cancelled/i.test(
        `${errorCode} ${errorDescription}`
      );
      setError(
        denied
          ? 'Google sign-in was cancelled. You can try again or use email and password.'
          : `Google sign-in could not be completed. ${oauthError}`
      );
    }

    if (params.get('verified') === '1') {
      setSuccess('Email confirmed. Sign in to open your dashboard.');
    }

    if (hash.get('type') === 'recovery' || params.get('type') === 'recovery') {
      setPasswordRecovery(true);
    }

    if (oauthError || params.has('verified') || params.has('mode') || params.has('error') || hash.has('error')) {
      params.delete('error');
      params.delete('error_description');
      params.delete('error_code');
      const query = params.toString();
      window.history.replaceState(
        null,
        '',
        window.location.pathname + (query ? `?${query}` : '')
      );
    }
    // Runs once: these flags come from the redirect that loaded the app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------- calls
  const run = useCallback(
    async (work) => {
      clearMessages();
      setIsLoading(true);
      try {
        return await work();
      } catch (thrown) {
        setError(mapAuthError(thrown));
        throw thrown;
      } finally {
        setIsLoading(false);
      }
    },
    [clearMessages]
  );

  const finishSignIn = useCallback(() => {
    const returnTo = readReturnTo();
    navigate(returnTo || '/dashboard', { replace: true });
  }, [navigate]);

  const login = ({ email, password, remember = true }) =>
    run(async () => {
      setRememberSession(remember);
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: String(email).trim().toLowerCase(),
        password: String(password)
      });
      if (authError) throw authError;
      setSuccess('Signed in.');
      finishSignIn();
      return data;
    });

  const register = ({ name, email, password }) =>
    run(async () => {
      const normalizedEmail = String(email).trim().toLowerCase();
      const { data, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: String(password),
        options: {
          data: { full_name: String(name).trim() },
          emailRedirectTo: appUrl('/auth?verified=1')
        }
      });
      if (authError) throw authError;

      // Supabase deliberately returns a user with no identities for an address
      // that already exists, so account enumeration stays impossible.
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('An account with this email already exists. Sign in instead, or reset your password.');
      }

      if (!data?.session) {
        setPendingVerification(true);
        setPendingEmail(normalizedEmail);
        setSuccess('Account created. Check your inbox to confirm your email address.');
        navigate(`/auth?mode=verify-email&email=${encodeURIComponent(normalizedEmail)}`, { replace: true });
        return data;
      }

      setSuccess('Account created. Welcome to DevVerse!');
      finishSignIn();
      return data;
    });

  const googleSignIn = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const returnTo = readReturnTo();
      const redirectTo = appUrl(
        returnTo ? `/auth?oauth=1&returnTo=${encodeURIComponent(returnTo)}` : '/auth?oauth=1'
      );
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (authError) throw authError;
      // The browser is navigating to Google; keep the loading state visible.
    } catch (thrown) {
      setIsLoading(false);
      setError(mapAuthError(thrown));
    }
  };

  const logout = useCallback(async () => {
    try {
      await supabase?.auth.signOut();
    } catch {
      /* even a failed network sign-out clears the local session below */
    }
    resetLocalSession();
    clearMessages();
    navigate('/', { replace: true });
  }, [clearMessages, navigate, resetLocalSession]);

  const resetPassword = (email) =>
    run(async () => {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        String(email).trim().toLowerCase(),
        { redirectTo: appUrl('/reset-password') }
      );
      if (authError) throw authError;
      // Neutral copy on purpose: the answer must not reveal whether an account
      // exists for this address.
      setSuccess('If an account exists for that address, a password reset link is on its way.');
      return true;
    });

  const updatePassword = (password) =>
    run(async () => {
      const { data, error: authError } = await supabase.auth.updateUser({ password: String(password) });
      if (authError) throw authError;
      setPasswordRecovery(false);
      setSuccess('Password updated. You are signed in with the new password.');
      return data;
    });

  const resendVerification = (email) =>
    run(async () => {
      const target = String(email || pendingEmail || user?.email || '').trim().toLowerCase();
      if (!target) throw new Error('Enter the email address you registered with.');
      const { error: authError } = await supabase.auth.resend({
        type: 'signup',
        email: target,
        options: { emailRedirectTo: appUrl('/auth?verified=1') }
      });
      if (authError) throw authError;
      setPendingEmail(target);
      setPendingVerification(true);
      setSuccess('Verification link sent. It can take a minute to arrive.');
      return true;
    });

  const changeEmail = (email) =>
    run(async () => {
      const { data, error: authError } = await supabase.auth.updateUser({
        email: String(email).trim().toLowerCase()
      });
      if (authError) throw authError;
      setSuccess('Check both inboxes: confirm the change from the link we just sent.');
      return data;
    });

  const updateProfile = async ({ fullName, avatarUrl }) => {
    if (!user?.id) throw new Error('You must be signed in to update your profile.');
    clearMessages();
    setIsLoading(true);
    try {
      const row = await profileService.update(user.id, { fullName, avatarUrl });
      const merged = {
        ...user,
        name: row?.full_name || user.name,
        avatar: row?.avatar_url || user.avatar
      };
      setUser(merged);
      cacheUser(merged);
      syncProfileStore(merged);
      setSuccess('Profile updated.');
      return row;
    } catch (thrown) {
      setError(mapAuthError(thrown));
      throw thrown;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session) await loadSession(data.session);
  }, [loadSession]);

  const value = {
    user,
    token: null,
    isAuthenticated: Boolean(user?.id && !isBootstrapping),
    isEmailVerified: Boolean(user?.isEmailVerified),
    isBootstrapping,
    isLoading,
    error,
    success,
    otpPending: pendingVerification,
    otpEmail: pendingEmail,
    devOtp: '',
    otpDelivery: 'email',
    pendingVerification,
    pendingEmail,
    passwordRecovery,
    authProvider: 'supabase',
    login,
    register,
    googleSignIn,
    logout,
    resetPassword,
    updatePassword,
    resendVerification,
    changeEmail,
    updateProfile,
    refreshProfile,
    clearMessages,
    clearPasswordRecovery: () => setPasswordRecovery(false),
    // Kept for API compatibility with the legacy provider; Supabase verifies
    // email addresses with a signed link instead of a typed code.
    verifyOtp: async () => {
      throw new Error('Open the verification link from your inbox to confirm this address.');
    },
    resendOtp: () => resendVerification(pendingEmail || user?.email)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default SupabaseAuthProvider;
