import { challenges } from '../../src/data/challengesData.js';
import Problem from './models/Problem.js';
import Achievement from './models/Achievement.js';

/**
 * Seeds the catalog on first boot so a fresh database is immediately usable.
 *
 * The challenge catalog has a single source of truth: src/data/challengesData.js
 * (shared with the frontend), so nothing is duplicated here.
 */

const SEED_ACHIEVEMENTS = [
  { name: 'First Blood', description: 'Solve your first coding challenge.', xpReward: 100, icon: '🎯' },
  { name: 'Stack Master', description: 'Complete every stack challenge.', xpReward: 150, icon: '📚' },
  { name: 'Consistency King', description: 'Log coding activity 7 days in a row.', xpReward: 250, icon: '🔥' },
  { name: 'Complexity Master', description: 'Analyse 5 code complexities.', xpReward: 200, icon: '📊' },
  { name: 'Algorithm Architect', description: 'Complete a full roadmap track.', xpReward: 300, icon: '🌳' }
];

const toProblem = (challenge) => ({
  externalId: challenge.id,
  title: challenge.title,
  difficulty: String(challenge.difficulty || 'easy').toLowerCase(),
  tags: [challenge.category, ...(challenge.hints ? [] : [])].filter(Boolean),
  statement: challenge.description,
  examples: (challenge.examples || []).map((example) => ({
    input: String(example.input ?? ''),
    output: String(example.output ?? '')
  })),
  constraints: challenge.constraints || [],
  solution: challenge.solution || '',
  starterCode: challenge.starterCode || '',
  functionName: challenge.functionName || '',
  xpReward: Number(challenge.xp) || 100,
  hints: challenge.hints || [],
  discussion: (challenge.discussion || []).map((entry) =>
    typeof entry === 'string' ? { author: 'DevVerse', message: entry, time: '' } : entry
  ),
  testCases: challenge.testCases || [],
  isPublished: true
});

export const seedCatalog = async () => {
  const [problemCount, achievementCount] = await Promise.all([
    Problem.countDocuments(),
    Achievement.countDocuments()
  ]);

  if (problemCount === 0 && challenges.length > 0) {
    await Problem.insertMany(challenges.map(toProblem));
    console.log(`[seed] inserted ${challenges.length} challenges`);
  }

  if (achievementCount === 0) {
    await Achievement.insertMany(SEED_ACHIEVEMENTS);
    console.log(`[seed] inserted ${SEED_ACHIEVEMENTS.length} achievements`);
  }
};
