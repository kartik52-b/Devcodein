import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { requireDb } from '../config/db.js';
import Problem from '../models/Problem.js';

const router = express.Router();

const publicProblem = (problem) => ({
  id: problem._id,
  externalId: problem.externalId,
  title: problem.title,
  difficulty: problem.difficulty,
  category: problem.tags?.[0] || 'General',
  tags: problem.tags,
  description: problem.statement,
  statement: problem.statement,
  examples: problem.examples,
  constraints: problem.constraints,
  solution: problem.solution,
  starterCode: problem.starterCode,
  functionName: problem.functionName,
  hints: problem.hints,
  discussion: problem.discussion,
  testCases: problem.testCases,
  xp: problem.xpReward
});

const SORT = { easy: 1, medium: 2, hard: 3 };

router.get('/', requireDb, async (req, res, next) => {
  try {
    const problems = await Problem.find({ isPublished: true }).sort({ createdAt: -1 });
    res.json(problems.map(publicProblem));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requireDb, async (req, res, next) => {
  try {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: req.params.id }, { externalId: req.params.id }] }
      : { externalId: req.params.id };

    const problem = await Problem.findOne(query);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(publicProblem(problem));
  } catch (error) {
    next(error);
  }
});

// Creating shared catalog content is an admin operation.
router.post('/', protect, adminOnly, requireDb, async (req, res, next) => {
  try {
    const { title, statement, difficulty } = req.body || {};
    if (!title || !statement) {
      return res.status(400).json({ message: 'title and statement are required' });
    }
    const problem = await Problem.create({
      ...req.body,
      difficulty: SORT[difficulty] ? difficulty : 'easy',
      createdBy: req.user._id
    });
    res.status(201).json(publicProblem(problem));
  } catch (error) {
    next(error);
  }
});

export default router;
