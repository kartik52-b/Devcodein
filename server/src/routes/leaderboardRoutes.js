import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireDb } from '../config/db.js';

const router = express.Router();

const DEFAULT_LIMIT = 10;

/** Reads an optional bearer token so the response can highlight "you". */
const optionalUser = async (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  try {
    const decoded = jwt.verify(
      authHeader.slice(7),
      process.env.JWT_SECRET || 'devverse-secret'
    );
    return await User.findById(decoded.id);
  } catch {
    return null;
  }
};

const toEntry = (user, rank, currentUserId) => ({
  rank,
  id: user._id,
  name: user.name,
  avatar: user.avatar || '👤',
  xp: user.xp || 0,
  level: Math.floor((user.xp || 0) / 1000) + 1,
  solvedProblems: user.solvedProblems || 0,
  streak: user.streak || 0,
  badges: (user.badges || []).length,
  isMe: currentUserId ? String(user._id) === String(currentUserId) : false
});

router.get('/', requireDb, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, 100);
    const current = await optionalUser(req);

    const users = await User.find({ isActive: true })
      .sort({ xp: -1, solvedProblems: -1 })
      .limit(limit);

    let entries = users.map((user, index) => toEntry(user, index + 1, current?._id));

    // Make sure the signed-in learner is visible even outside the top N.
    if (current && !entries.some((entry) => entry.isMe)) {
      const position = await User.countDocuments({
        isActive: true,
        $or: [{ xp: { $gt: current.xp || 0 } }]
      });
      entries = [...entries, toEntry(current, position + 1, current._id)];
    }

    const totalPlayers = await User.countDocuments({ isActive: true });

    res.json({
      entries,
      totalPlayers,
      me: current
        ? {
            ...toEntry(
              current,
              entries.find((entry) => entry.isMe)?.rank || null,
              current._id
            )
          }
        : null
    });
  } catch (error) {
    next(error);
  }
});

export default router;
