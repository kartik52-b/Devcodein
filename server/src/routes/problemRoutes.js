import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Problem from '../models/Problem.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const problems = await Problem.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(problems);
  } catch (error) {
    next(error);
  }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const problem = await Problem.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(problem);
  } catch (error) {
    next(error);
  }
});

export default router;
