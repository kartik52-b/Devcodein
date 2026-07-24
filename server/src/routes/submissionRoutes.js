import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const submission = await Submission.create({ ...req.body, user: req.user._id });
    await User.findByIdAndUpdate(req.user._id, { $inc: { xp: 50, solvedProblems: 1, streak: 1 } });
    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    const submissions = await Submission.find({ user: req.user._id }).populate('problem').sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
});

export default router;
