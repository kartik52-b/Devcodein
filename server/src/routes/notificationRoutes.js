import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Notification from '../models/Notification.js';
import { requireDb } from '../config/db.js';

const router = express.Router();

router.get('/', protect, requireDb, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, requireDb, async (req, res, next) => {
  try {
    const notification = await Notification.create({ ...req.body, user: req.user._id });
    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
});

export default router;
