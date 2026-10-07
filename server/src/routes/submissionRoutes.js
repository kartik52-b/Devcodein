import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireDb } from '../config/db.js';
import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import { judgeSubmission, isSupportedLanguage } from '../services/judge.js';

const router = express.Router();

const publicSubmission = (submission) => ({
  id: submission._id,
  problem: submission.problem?._id || submission.problem,
  externalId: submission.externalId,
  language: submission.language,
  result: submission.result,
  judgedBy: submission.judgedBy,
  messages: submission.messages || [],
  runtime: submission.runtime,
  createdAt: submission.createdAt
});

/**
 * POST /api/submissions
 *
 * The server never trusts client-provided XP / level / result values:
 *  - the code is re-validated by the (isolated) judge service,
 *  - XP, streak and solved counters are computed here, once per problem,
 *  - repeated submissions for an already-solved problem award nothing.
 */
router.post('/', protect, requireDb, async (req, res, next) => {
  try {
    const { code, language, problem: problemId, externalId } = req.body || {};

    if (!problemId) {
      return res.status(400).json({ message: 'A problem id is required' });
    }
    if (!isSupportedLanguage(language)) {
      return res.status(400).json({ message: `Unsupported language "${language}"` });
    }

    // Accept either a Mongo id or the shared catalog id, and never let a
    // malformed id reach mongoose' ObjectId caster.
    const query = /^[0-9a-fA-F]{24}$/.test(String(problemId))
      ? { $or: [{ _id: problemId }, { externalId: problemId }] }
      : { externalId: problemId };

    const problem = await Problem.findOne(query);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const verdict = judgeSubmission({
      code,
      language,
      functionName: problem.functionName
    });

    const alreadySolved = (req.user.solvedProblemIds || []).includes(
      problem.externalId || String(problem._id)
    );

    const submission = await Submission.create({
      user: req.user._id,
      problem: problem._id,
      externalId: problem.externalId || String(problem._id),
      language,
      code,
      result: verdict.result,
      judgedBy: verdict.judgedBy,
      messages: verdict.messages
    });

    const user = req.user;
    let awardedXp = 0;
    let leveledUp = false;

    if (verdict.result === 'accepted' && !alreadySolved) {
      awardedXp = problem.xpReward || 100;
      user.xp = (user.xp || 0) + awardedXp;
      user.solvedProblems = (user.solvedProblems || 0) + 1;
      user.solvedProblemIds = [...(user.solvedProblemIds || []), problem.externalId || String(problem._id)];
      user.streak = (user.streak || 0) + 1;
      user.longestStreak = Math.max(user.longestStreak || 0, user.streak);
      leveledUp = Math.floor(user.xp / 1000) > Math.floor((user.xp - awardedXp) / 1000);
      await user.save({ validateBeforeSave: false });
    }

    res.status(201).json({
      submission: publicSubmission(submission),
      duplicate: Boolean(alreadySolved),
      awardedXp,
      leveledUp,
      level: Math.floor(user.xp / 1000) + 1,
      user: {
        id: user._id,
        xp: user.xp,
        level: Math.floor(user.xp / 1000) + 1,
        solvedProblems: user.solvedProblems,
        solvedProblemIds: user.solvedProblemIds,
        streak: user.streak,
        longestStreak: user.longestStreak
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', protect, requireDb, async (req, res, next) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title difficulty externalId')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(submissions.map(publicSubmission));
  } catch (error) {
    next(error);
  }
});

export default router;
