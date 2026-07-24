import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from './ProfileContext';

const AuthContext = createContext(null);

const readStoredAuth = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  try {
    const user = window.localStorage.getItem('devverse_auth_user');
    const token = window.localStorage.getItem('devverse_auth_token');
    return {
      user: user ? JSON.parse(user) : null,
      token
    };
  } catch (error) {
    console.error('Failed to read auth storage', error);
    return { user: null, token: null };
  }
};

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const { upsertProfile } = useProfile();
  const [user, setUser] = useState(() => readStoredAuth().user);
  const [token, setToken] = useState(() => readStoredAuth().token);
  const [otpPending, setOtpPending] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isAuthenticated = Boolean(token && user);
  const isEmailVerified = Boolean(user?.isEmailVerified);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (token) {
      window.localStorage.setItem('devverse_auth_token', token);
    } else {
      window.localStorage.removeItem('devverse_auth_token');
    }
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user) {
      window.localStorage.setItem('devverse_auth_user', JSON.stringify(user));
    } else {
      window.localStorage.removeItem('devverse_auth_user');
    }
  }, [user]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const persistSession = (payload, { shouldNavigate = false } = {}) => {
    if (payload?.token) {
      setToken(payload.token);
    }
    if (payload?.user) {
      setUser(payload.user);
    }
    if (payload?.otpEmail) {
      setOtpEmail(payload.otpEmail);
    }
    setOtpPending(Boolean(payload?.requiresOtp));
    if (shouldNavigate) {
      navigate(payload?.requiresOtp ? '/auth' : '/modules/profile');
    }
  };

  const authRequest = async (path, body, { requireAuth = false } = {}) => {
    const headers = { 'Content-Type': 'application/json' };
    if (requireAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api/auth${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Authentication request failed');
    }
    return data;
  };

  const login = async ({ email, password }) => {
    clearMessages();
    setIsLoading(true);
    try {
      const data = await authRequest('/login', { email, password });
      persistSession(data, { shouldNavigate: true });
      if (data.user) {
        upsertProfile({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          photo: data.user.avatar || '',
          xp: data.user.xp || 0,
          streak: data.user.streak || 0,
          achievements: data.user.achievements || [],
          completedMilestones: data.user.completedMilestones || []
        });
      }
      return data;
    } catch (err) {
      setError(err.message || 'Unable to sign in right now');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ name, email, password }) => {
    clearMessages();
    setIsLoading(true);
    try {
      const data = await authRequest('/register', { name, email, password });
      persistSession(data, { shouldNavigate: true });
      if (data.user) {
        upsertProfile({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          photo: data.user.avatar || '',
          xp: data.user.xp || 0,
          streak: data.user.streak || 0,
          achievements: data.user.achievements || [],
          completedMilestones: data.user.completedMilestones || []
        });
      }
      return data;
    } catch (err) {
      setError(err.message || 'Unable to create your account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp) => {
    clearMessages();
    setIsLoading(true);
    try {
      const data = await authRequest('/verify-otp', { otp }, { requireAuth: true });
      persistSession(data, { shouldNavigate: true });
      if (data.user) {
        upsertProfile({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          photo: data.user.avatar || '',
          xp: data.user.xp || 0,
          streak: data.user.streak || 0,
          achievements: data.user.achievements || [],
          completedMilestones: data.user.completedMilestones || []
        });
      }
      return data;
    } catch (err) {
      setError(err.message || 'The OTP did not match');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const data = await authRequest('/resend-otp', {}, { requireAuth: true });
      setOtpPending(true);
      setOtpEmail(data.otpEmail || otpEmail);
      setSuccess(data.message || 'A fresh code has been sent');
      return data;
    } catch (err) {
      setError(err.message || 'Unable to resend the code right now');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changeEmail = async (newEmail) => {
    clearMessages();
    setIsLoading(true);
    try {
      const data = await authRequest('/change-email', { email: newEmail }, { requireAuth: true });
      persistSession(data, { shouldNavigate: true });
      setSuccess(data.message || 'Verification code sent to the new email');
      return data;
    } catch (err) {
      setError(err.message || 'Could not update your email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async (payload) => {
    clearMessages();
    setIsLoading(true);
    try {
      const data = await authRequest('/google', payload);
      persistSession(data, { shouldNavigate: true });
      if (data.user) {
        upsertProfile({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          photo: data.user.avatar || '',
          xp: data.user.xp || 0,
          streak: data.user.streak || 0,
          achievements: data.user.achievements || [],
          completedMilestones: data.user.completedMilestones || []
        });
      }
      return data;
    } catch (err) {
      setError(err.message || 'Google sign-in is unavailable until the provider is configured');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOtpPending(false);
    setOtpEmail('');
    clearMessages();
    navigate('/');
  };

  const value = useMemo(() => ({
    user,
    token,
    otpPending,
    otpEmail,
    isLoading,
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
  }), [user, token, otpPending, otpEmail, isLoading, error, success, isAuthenticated, isEmailVerified]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
