import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { requireDb } from '../config/db.js';

const router = express.Router();

router.get('/users', protect, adminOnly, requireDb, async (req, res, next) => {
  try {
    // `password` is select:false, but drop it explicitly as a second guard.
    const users = await User.find().select('-password -otpHash -otpExpires').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
