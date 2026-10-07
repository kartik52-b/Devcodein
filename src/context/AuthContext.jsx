import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { clearToken, getToken, onUnauthorized, ApiUnavailableError, API_BASE, setToken } from '../services/api';
import { useProfile } from './ProfileContext';

const AuthContext = createContext(null);

/** Friendly copy for OAuth failures — never surface raw codes to learners. */
const GOOGLE_ERROR_MESSAGES = {
  not_configured: 'Google sign-in is not configured on this server yet. Use email and password to continue.',
  access_denied: 'Google sign-in was cancelled. Please try again or use email and password.',
  invalid_state: 'Your Google sign-in session expired. Please try again.',
  unverified_email: 'Your Google account does not have a verified email address.',
  deactivated: 'This account has been deactivated. Please contact support.',
  missing_code: 'Google sign-in could not be completed. Please try again.',
  failed: 'Google sign-in could not be completed. Please try again.'
};

const readStoredUser = () => {
  try {
    const raw = window.localStorage.getItem('devverse_auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const storeUser = (user) => {
  try {
    if (user) window.localStorage.setItem('devverse_auth_user', JSON.stringify(user));
    else window.localStorage.removeItem('devverse_auth_user');
  } catch {
    /* storage disabled */
  }
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { upsertProfile } = useProfile();

  const [user, setUser] = useState(readStoredUser);
  const [otpPending, setOtpPending] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpDelivery, setOtpDelivery] = useState('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(getToken()));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = getToken();
  const isAuthenticated = Boolean(token && user);
  const isEmailVerified = Boolean(user?.isEmailVerified);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  /** Push backend-authoritative progress into the local profile store. */
  const syncProfile = useCallback(
    (nextUser) => {
      if (!nextUser) return;
      upsertProfile({
        id: nextUser.id,
        name: nextUser.name,
        email: nextUser.email,
        photo: nextUser.avatar || '',
        avatar: nextUser.avatar || undefined,
        xp: nextUser.xp || 0,
        level: nextUser.level || Math.floor((nextUser.xp || 0) / 1000) + 1,
        streak: nextUser.streak || 0,
        longestStreak: nextUser.longestStreak || nextUser.streak || 0,
        solvedCount: nextUser.solvedProblems || 0,
        achievements: (nextUser.achievements || []).map((achievement, index) => ({
          id: achievement.key || index,
          title: achievement.title,
          desc: achievement.desc,
          icon: achievement.icon,
          earned: achievement.earned
        })),
        serverSolvedIds: nextUser.solvedProblemIds || []
      });
    },
    [upsertProfile]
  );

  /** Where the learner originally wanted to go (preserved by RequireAuth). */
  const pendingReturnTo = () => {
    const value = new URLSearchParams(window.location.search).get('returnTo');
    return value && value.startsWith('/') && !value.startsWith('//') ? value : null;
  };

  const applySession = useCallback(
    (payload, { redirectTo } = {}) => {
      if (payload?.user) {
        setUser(payload.user);
        storeUser(payload.user);
        syncProfile(payload.user);
      }
      setOtpPending(Boolean(payload?.requiresOtp));
      setOtpEmail(payload?.otpEmail || payload?.user?.email || '');
      setDevOtp(payload?.devOtp || '');
      setOtpDelivery(payload?.otpDelivery || 'email');

      if (redirectTo === false) return;

      const returnTo = pendingReturnTo();
      if (payload?.requiresOtp) {
        navigate(returnTo ? `/auth?returnTo=${encodeURIComponent(returnTo)}` : '/auth');
        return;
      }
      // The originally requested page (preserved by RequireAuth) wins over
      // the default landing spot; redirectTo: false skips navigation.
      navigate(returnTo || redirectTo || '/dashboard');
    },
    [navigate, syncProfile]
  );

  /**
   * Consumes the token fragment appended by GET /api/auth/google/callback and
   * surfaces any OAuth error flag as a friendly message. Runs once, before the
   * session restore below, so the token is in storage before `me()` is called.
   */
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const oauthToken = hash.get('token');
    const googleError = hash.get('google_error');
    const search = new URLSearchParams(window.location.search);
    const notConfigured = search.get('google') === 'not_configured';

    if (oauthToken) {
      setToken(oauthToken);
      setIsBootstrapping(true);
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
      return;
    }

    if (googleError || notConfigured) {
      setError(GOOGLE_ERROR_MESSAGES[googleError || 'not_configured'] || GOOGLE_ERROR_MESSAGES.failed);
      // Drop the flag so a refresh does not repeat the message, but keep any
      // returnTo the learner originally asked for.
      search.delete('google');
      const query = search.toString();
      window.history.replaceState(
        null,
        '',
        window.location.pathname + (query ? `?${query}` : '')
      );
    }
  }, []);

  // ---------------------------------------------------------- bootstrap
  // The profile callbacks are read through a ref so a parent re-render can
  // never restart the (one-shot) session restore.
  const syncProfileRef = useRef(syncProfile);
  useEffect(() => {
    syncProfileRef.current = syncProfile;
  }, [syncProfile]);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (!getToken()) {
        setIsBootstrapping(false);
        return;
      }
      try {
        const { user: fresh } = await authApi.me();
        if (cancelled) return;
        setUser(fresh);
        storeUser(fresh);
        syncProfileRef.current(fresh);
        setOtpPending(!fresh.isEmailVerified);
        setOtpEmail(fresh.email || '');
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiUnavailableError) {
          // Keep the cached session; the backend is simply unreachable.
          setError('The DevVerse API is unreachable — some account details may be out of date.');
        } else {
          // 401/expired token: the api client already cleared it.
          setUser(null);
          storeUser(null);
          setOtpPending(false);
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    };

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Someone else (the api client) dropped the session on a 401.
  useEffect(
    () =>
      onUnauthorized(() => {
        setUser(null);
        storeUser(null);
        setOtpPending(false);
        clearMessages();
      }),
    []
  );

  // ---------------------------------------------------------------- calls
  const run = useCallback(
    async (work, { redirectTo } = {}) => {
      clearMessages();
      setIsLoading(true);
      try {
        const payload = await work();
        applySession(payload, { redirectTo });
        return payload;
      } catch (err) {
        setError(err?.message || 'Something went wrong. Please try again.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applySession]
  );

  const login = (credentials) =>
    run(() => authApi.login(credentials), { redirectTo: '/dashboard' });

  const register = (values) =>
    run(() => authApi.register(values), { redirectTo: '/dashboard' });

  const verifyOtp = async (otp) => {
    clearMessages();
    setIsLoading(true);
    try {
      const payload = await authApi.verifyOtp(otp);
      applySession(payload, { redirectTo: '/dashboard' });
      setSuccess(payload.message || 'Email verified. Welcome to DevVerse!');
      return payload;
    } catch (err) {
      setError(err?.message || 'The OTP did not match');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const payload = await authApi.resendOtp();
      setOtpPending(payload.requiresOtp !== false);
      setOtpEmail(payload.otpEmail || otpEmail);
      setDevOtp(payload.devOtp || '');
      setOtpDelivery(payload.otpDelivery || 'email');
      setSuccess(payload.message || 'A fresh code has been sent');
      return payload;
    } catch (err) {
      setError(err?.message || 'Unable to resend the code right now');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changeEmail = async (newEmail) => {
    clearMessages();
    setIsLoading(true);
    try {
      const payload = await authApi.changeEmail(newEmail);
      applySession(payload, { redirectTo: false });
      setSuccess(payload.message || 'Verification code sent to the new email');
      return payload;
    } catch (err) {
      setError(err?.message || 'Could not update the email address');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Starts the real Google OAuth flow: the browser navigates to the backend's
   * /api/auth/google/start endpoint, which redirects to Google's consent
   * screen. The client secret never touches frontend code; on the way back the
   * API sets the JWT in the URL fragment and this provider picks it up during
   * bootstrap (see the OAuth effect above).
   */
  const googleSignIn = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const returnTo = pendingReturnTo() || '/dashboard';
      const url = `${API_BASE}/api/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`;
      window.location.assign(url);
    } catch {
      setIsLoading(false);
      setError('Google sign-in could not be started. Please try again.');
    }
  };

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    storeUser(null);
    setOtpPending(false);
    setOtpEmail('');
    setDevOtp('');
    clearMessages();
    navigate('/');
  }, [navigate]);

  const value = {
    user,
    token,
    otpPending,
    otpEmail,
    devOtp,
    otpDelivery,
    isLoading,
    isBootstrapping,
    error,
    success,
    isAuthenticated,
    isEmailVerified,
    login,
    register,
    verifyOtp,
    resendOtp,
    changeEmail,
    googleSignIn,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
