import { api } from './api';

/** Leaderboard + signed-in learner highlight. */
export const leaderboardApi = {
  top: ({ limit = 10, signal } = {}) =>
    api.get(`/api/leaderboards?limit=${encodeURIComponent(limit)}`, { signal })
};
