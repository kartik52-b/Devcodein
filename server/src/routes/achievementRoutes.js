import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { requireDb } from '../config/db.js';
import Achievement from '../models/Achievement.js';

const router = express.Router();

const publicAchievement = (achievement) => ({
  id: achievement._id,
  key: achievement.key || String(achievement._id),
  name: achievement.name,
  title: achievement.name,
  description: achievement.description,
  desc: achievement.description,
  xpReward: achievement.xpReward,
  icon: achievement.icon
});

// -------------------------------------------------------------- catalog
router.get('/', requireDb, async (req, res, next) => {
  try {
    const achievements = await Achievement.find().sort({ xpReward: 1 });
    res.json(achievements.map(publicAchievement));
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------- the signed-in learner
router.get('/me', protect, requireDb, async (req, res, next) => {
  try {
    res.json(req.user.achievements || []);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/achievements/unlock
 *
 * Idempotent: unlocking something the learner already owns returns the existing
 * entry and awards no XP, so repeated calls can never double-grant rewards.
 */
router.post('/unlock', protect, requireDb, async (req, res, next) => {
  try {
    const key = String(req.body?.key || req.body?.name || '').trim();
    if (!key) return res.status(400).json({ message: 'An achievement key is required' });

    const catalog = await Achievement.findOne({
      $or: [{ key }, { name: key }]
    });

    const user = req.user;
    const existing = (user.achievements || []).find((item) => item.key === key);
    if (existing) {
      return res.json({ achievement: existing, awardedXp: 0, alreadyUnlocked: true, user: { xp: user.xp } });
    }

    const entry = {
      key,
      title: catalog?.name || key,
      desc: catalog?.description || req.body?.desc || '',
      icon: catalog?.icon || '🏅',
      earned: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };

    const awardedXp = catalog?.xpReward || 0;
    user.achievements = [...(user.achievements || []), entry];
    if (awardedXp > 0) user.xp = (user.xp || 0) + awardedXp;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      achievement: entry,
      awardedXp,
      alreadyUnlocked: false,
      leveledUp: Math.floor(user.xp / 1000) > Math.floor((user.xp - awardedXp) / 1000),
      user: { id: user._id, xp: user.xp, level: Math.floor(user.xp / 1000) + 1 }
    });
  } catch (error) {
    next(error);
  }
});

// Creating shared achievement definitions is an admin operation.
router.post('/', protect, adminOnly, requireDb, async (req, res, next) => {
  try {
    const { name, description } = req.body || {};
    if (!name || !description) {
      return res.status(400).json({ message: 'name and description are required' });
    }
    const achievement = await Achievement.create(req.body);
    res.status(201).json(publicAchievement(achievement));
  } catch (error) {
    next(error);
  }
});

export default router;
