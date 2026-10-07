import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';
import { requireDb } from '../config/db.js';

const router = express.Router();

router.get('/summary', protect, requireDb, async (req, res, next) => {
  try {
    const [submissionsCount, usersCount] = await Promise.all([
      Submission.countDocuments({ user: req.user._id }),
      User.countDocuments()
    ]);

    res.json({ submissionsCount, usersCount, xp: req.user.xp });
  } catch (error) {
    next(error);
  }
});

export default router;
