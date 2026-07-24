import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/users', protect, adminOnly, async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
