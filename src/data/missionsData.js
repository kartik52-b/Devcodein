/**
 * Mission definitions shared by the frontend UI and the backend reward table
 * (server/src/routes/profileRoutes.js). Rewards are enforced server-side so
 * the client can never choose how much XP a claim is worth.
 */

export const dailyMissions = [
  { id: 1, title: 'Solve 2 coding challenges', xp: 180, category: 'Algorithm' },
  { id: 2, title: 'Review one data structure', xp: 120, category: 'Conceptual' },
  { id: 3, title: 'Debug the AI Mentor code suggestion', xp: 220, category: 'AI Lab' }
];

export const weeklyMissions = [
  { id: 101, title: 'Maintain a 5-day coding streak', xp: 500, target: 5, initial: 4 },
  { id: 102, title: 'Spend 5 hours in the Algorithm Visualizer', xp: 350, target: 5, initial: 3.5 },
  { id: 103, title: 'Complete 3 database roadmaps milestones', xp: 400, target: 3, initial: 3 }
];

export const monthlyGoals = [
  { id: 201, title: 'Solve 30 challenges in practice room', xp: 1500, current: 24, target: 30 },
  { id: 202, title: 'Earn 5 new badges', xp: 1000, current: 4, target: 5 },
  { id: 203, title: 'Unlock the "Binary Beast" Achievement', xp: 2000, current: 0, target: 1 }
];

export const dailyMissionTotalXp = dailyMissions.reduce((sum, mission) => sum + mission.xp, 0);
