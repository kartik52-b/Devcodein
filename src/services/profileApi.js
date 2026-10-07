import { api } from './api';

/**
 * Mission state and rewards. The server owns the reward table and enforces
 * one claim per day / per week, so the browser only asks for a claim.
 */
export const profileApi = {
  missions: (signal) => api.get('/api/profile/missions', { signal }),
  claimMission: ({ type, id }) => api.post('/api/profile/missions/claim', { type, id }),
  claimDaily: () => api.post('/api/profile/missions/claim', { type: 'daily-all' })
};
