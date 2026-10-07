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

  hasSession: () => Boolean(getToken())
};
