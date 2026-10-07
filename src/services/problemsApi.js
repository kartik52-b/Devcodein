import { api } from './api';

/** Coding challenge catalog. */
export const problemsApi = {
  list: (signal) => api.get('/api/problems', { signal }),
  get: (id, signal) => api.get(`/api/problems/${encodeURIComponent(id)}`, { signal })
};

/** Submissions + the XP they award (computed on the server). */
export const submissionsApi = {
  create: ({ problem, code, language }) => api.post('/api/submissions', { problem, code, language }),
  mine: (signal) => api.get('/api/submissions/me', { signal })
};

/** Server-authoritative analytics for the signed-in learner. */
export const analyticsApi = {
  summary: (signal) => api.get('/api/analytics/summary', { signal })
};
