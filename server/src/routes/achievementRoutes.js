import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Achievement from '../models/Achievement.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const achievements = await Achievement.find();
    res.json(achievements);
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.status(201).json(achievement);
  } catch (error) {
    next(error);
  }
});

export default router;
