import { api, setToken, getToken } from './api';

/** Authentication calls backed by the Express API. */
export const authApi = {
  async register({ name, email, password }) {
    const data = await api.post('/api/auth/register', { name, email, password });
    if (data?.token) setToken(data.token);
    return data;
  },

  async login({ email, password }) {
    const data = await api.post('/api/auth/login', { email, password });
    if (data?.token) setToken(data.token);
    return data;
  },

  async me() {
    return api.get('/api/auth/me');
  },

  async verifyOtp(otp) {
    return api.post('/api/auth/verify-otp', { otp });
  },

  async resendOtp() {
    return api.post('/api/auth/resend-otp', {});
  },

  async changeEmail(email) {
    return api.post('/api/auth/change-email', { email });
  },

  /**
   * Optional bridge for self-hosted installs: the Express API still serves
   * problems, submissions and leaderboards with its own JWT. It verifies the
   * Supabase access token server-side and answers with an app token.
   *
   * A static Vercel deployment has no Express API, so the call is skipped there
   * (and failures are non-fatal) — Supabase alone powers authentication.
   */
  async exchangeSupabaseToken(accessToken) {
    if (!accessToken) return null;
    const bridgeAvailable = Boolean(import.meta.env.VITE_API_URL) || Boolean(import.meta.env.DEV);
    if (!bridgeAvailable) return null;

    const data = await api.post('/api/auth/supabase', { accessToken }, { auth: false });
    if (data?.token) setToken(data.token);
    return data;
  },

  hasSession: () => Boolean(getToken())
};
