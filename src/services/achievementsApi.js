import { api } from './api';

/** Achievement catalog + per-user unlocks (idempotent on the server). */
export const achievementsApi = {
  catalog: (signal) => api.get('/api/achievements', { signal }),
  mine: (signal) => api.get('/api/achievements/me', { signal }),
  unlock: (key) => api.post('/api/achievements/unlock', { key })
};
