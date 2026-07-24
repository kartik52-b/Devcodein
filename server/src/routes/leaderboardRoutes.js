import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().select('name xp solvedProblems streak').sort({ xp: -1 }).limit(10);
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
