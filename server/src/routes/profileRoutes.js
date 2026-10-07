import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireDb } from '../config/db.js';
import { dailyMissions, weeklyMissions } from '../../../src/data/missionsData.js';

const router = express.Router();

/**
 * Mission rewards are declared here, never on the client: the browser only
 * says *which* mission it wants to claim, and the server decides whether that
 * claim is valid and how much XP it is worth. `missionClaims` makes each
 * reward claimable exactly once per day / per week.
 */

const todayKey = () => new Date().toISOString().slice(0, 10);

const weekKey = () => {
  const date = new Date();
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const days = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return `${date.getUTCFullYear()}-W${Math.ceil((days + start.getUTCDay() + 1) / 7)}`;
};

const claimKey = (entry) => `${entry.type}:${entry.mission.id}:${entry.keyDate}`;

const entriesWithoutClaims = (entries, existing) => {
  const owned = new Set(existing.map((claim) => claim.key));
  return entries.filter((entry) => !owned.has(claimKey(entry)));
};

const publicUser = (user) => ({
  id: user._id,
  xp: user.xp,
  level: Math.floor((user.xp || 0) / 1000) + 1,
  solvedProblems: user.solvedProblems,
  streak: user.streak,
  longestStreak: user.longestStreak
});

router.get('/missions', protect, requireDb, async (req, res, next) => {
  try {
    const claims = (req.user.missionClaims || []).map((claim) => claim.key);
    res.json({
      today: todayKey(),
      week: weekKey(),
      claims,
      daily: dailyMissions,
      weekly: weeklyMissions
    });
  } catch (error) {
    next(error);
  }
});

router.post('/missions/claim', protect, requireDb, async (req, res, next) => {
  try {
    const { type, id } = req.body || {};
    const user = req.user;
    const before = user.xp || 0;

    // `daily-all` settles every daily mission for today in one call; each
    // individual mission is still recorded (and de-duplicated) on its own.
    const missions =
      type === 'daily-all'
        ? dailyMissions.map((mission) => ({ type: 'daily', mission, keyDate: todayKey() }))
        : type === 'daily'
          ? [{ type: 'daily', mission: dailyMissions.find((m) => m.id === Number(id)), keyDate: todayKey() }]
          : type === 'weekly'
            ? [{ type: 'weekly', mission: weeklyMissions.find((m) => m.id === Number(id)), keyDate: weekKey() }]
            : [];

    if (missions.length === 0 || missions.some((entry) => !entry.mission)) {
      return res.status(400).json({ message: 'Unknown mission' });
    }

    const existing = user.missionClaims || [];
    const fresh = entriesWithoutClaims(missions, existing);

    if (fresh.length === 0) {
      return res.json({
        alreadyClaimed: true,
        awardedXp: 0,
        claimedKeys: missions.map((entry) => claimKey(entry)),
        message: 'That mission reward has already been claimed.',
        user: publicUser(user)
      });
    }

    const awardedXp = fresh.reduce((sum, entry) => sum + (entry.mission.xp || 0), 0);
    user.xp = before + awardedXp;
    user.missionClaims = [
      ...existing.slice(-200),
      ...fresh.map((entry) => ({
        key: claimKey(entry),
        missionId: entry.mission.id,
        claimType: entry.type,
        xp: entry.mission.xp,
        claimedAt: new Date()
      }))
    ];
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      claimedKeys: fresh.map((entry) => claimKey(entry)),
      alreadyClaimed: false,
      awardedXp,
      leveledUp: Math.floor(user.xp / 1000) > Math.floor(before / 1000),
      message: `Reward claimed: +${awardedXp} XP`,
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
});

export default router;
