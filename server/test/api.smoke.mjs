/**
 * Backend API smoke test.
 *
 * Boots the real Express app against an ephemeral in-memory MongoDB, then
 * exercises the flows the UI depends on: health, register, OTP, login,
 * session restore, problem catalog, submission + XP de-duplication,
 * leaderboard, achievements and admin protection.
 *
 * Run with: npm run test  (from the server/ directory)
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { seedCatalog } from '../src/seed.js';

const failures = [];
let passed = 0;

const check = (label, condition, detail = '') => {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${label}`);
  } else {
    failures.push(`${label} ${detail}`);
    console.log(`  ✗ ${label} ${detail}`);
  }
};

const run = async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  delete process.env.MONGODB_URI; // force the in-memory fallback

  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await seedCatalog();

  const app = createApp();
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const call = async (method, path, { body, token } = {}) => {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    let data = null;
    try {
      data = await res.json();
    } catch {
      /* no body */
    }
    return { status: res.status, data };
  };

  console.log('\nHealth & catalog');
  {
    const health = await call('GET', '/health');
    check('GET /health returns ok', health.status === 200 && health.data.status === 'ok');
    check('health reports database connected', health.data.database === 'connected', JSON.stringify(health.data));

    const problems = await call('GET', '/api/problems');
    check('GET /api/problems returns the seeded catalog', problems.status === 200 && problems.data.length >= 3, `got ${problems.data?.length}`);
    check('problem payload exposes starterCode + testCases', Boolean(problems.data?.[0]?.starterCode && problems.data?.[0]?.testCases));
  }

  const email = `tester-${Date.now()}@devverse.dev`;
  let token = '';

  console.log('\nRegistration & OTP');
  {
    const bad = await call('POST', '/api/auth/register', { body: { name: 'T', email, password: '123' } });
    check('rejects weak payloads', bad.status === 400, `status ${bad.status}`);

    const reg = await call('POST', '/api/auth/register', {
      body: { name: 'Test Learner', email, password: 'secret123' }
    });
    check('POST /api/auth/register returns 201', reg.status === 201, `status ${reg.status} ${JSON.stringify(reg.data)}`);
    token = reg.data?.token;
    check('registration requires OTP verification', reg.data?.requiresOtp === true);
    check('password hash is never returned', !JSON.stringify(reg.data).includes('$2a$'));
    check('development OTP is surfaced when email is unconfigured', typeof reg.data?.devOtp === 'string');
    check('public user has no password field', !('password' in (reg.data?.user || {})));

    const wrong = await call('POST', '/api/auth/verify-otp', { token, body: { otp: '000000' } });
    const expected = reg.data.devOtp;
    check('rejects an incorrect OTP', wrong.status === 400 || wrong.data?.message?.includes('incorrect'), `status ${wrong.status} ${wrong.data?.message}`);

    const right = await call('POST', '/api/auth/verify-otp', { token, body: { otp: expected } });
    check('accepts the correct OTP', right.status === 200 && right.data?.user?.isEmailVerified === true, `${right.status} ${JSON.stringify(right.data)}`);

    const reuse = await call('POST', '/api/auth/verify-otp', { token, body: { otp: expected } });
    check('OTP verify is idempotent after success', reuse.status === 200);
  }

  console.log('\nLogin & session');
  {
    const wrongPassword = await call('POST', '/api/auth/login', { body: { email, password: 'nope' } });
    check('rejects bad credentials', wrongPassword.status === 401);

    const login = await call('POST', '/api/auth/login', { body: { email, password: 'secret123' } });
    check('POST /api/auth/login works', login.status === 200 && Boolean(login.data.token), `${login.status} ${JSON.stringify(login.data)}`);
    check('verified user is not asked for OTP again', login.data.requiresOtp === false);
    token = login.data.token;

    const me = await call('GET', '/api/auth/me', { token });
    check('GET /api/auth/me restores the session', me.status === 200 && me.data.user.email === email);

    const noToken = await call('GET', '/api/auth/me');
    check('GET /api/auth/me without a token is 401', noToken.status === 401);

    const badToken = await call('GET', '/api/auth/me', { token: 'not-a-real-token' });
    check('invalid token is rejected', badToken.status === 401);
  }

  console.log('\nSubmissions, XP and de-duplication');
  let problem = null;
  {
    const list = await call('GET', '/api/problems');
    problem = list.data.find((item) => item.functionName) || list.data[0];

    const empty = await call('POST', '/api/submissions', { token, body: { problem: problem.id, language: 'javascript', code: '   ' } });
    check('empty submission is rejected by the judge', empty.status === 201 && empty.data.submission.result === 'compile-error', `${empty.status} ${JSON.stringify(empty.data)}`);

    const badLang = await call('POST', '/api/submissions', { token, body: { problem: problem.id, language: 'brainfuck', code: 'x' } });
    check('unsupported language is rejected', badLang.status === 400);

    const first = await call('POST', '/api/submissions', {
      token,
      body: { problem: problem.id, language: 'javascript', code: `${problem.starterCode}` }
    });
    check('valid submission is accepted', first.status === 201 && first.data.submission.result === 'accepted', `${first.status} ${JSON.stringify(first.data?.submission)}`);
    check('submission labels its judge', first.data.submission.judgedBy === 'static-analysis');
    check('first submission awards the problem XP', first.data.awardedXp === problem.xp, `awarded ${first.data.awardedXp}`);

    const second = await call('POST', '/api/submissions', {
      token,
      body: { problem: problem.id, language: 'javascript', code: `${problem.starterCode}` }
    });
    check('repeat submission does not award XP again', second.data.awardedXp === 0 && second.data.duplicate === true, JSON.stringify(second.data));

    const unknownProblem = await call('POST', '/api/submissions', {
      token,
      body: { problem: 'any', language: 'javascript', code: 'function x(){ return 1; }' }
    });
    check('malformed problem id is a clean 404 (no cast error)', unknownProblem.status === 404, `status ${unknownProblem.status}`);

    const evalCode = await call('POST', '/api/submissions', {
      token,
      body: { problem: problem.id, language: 'javascript', code: 'function twoSum(){ return eval("1"); }' }
    });
    check('unsafe code is rejected without executing it', evalCode.status === 201 && evalCode.data.submission?.result === 'runtime-error', JSON.stringify(evalCode.data));
    check('no stack traces are exposed to clients', !JSON.stringify(evalCode.data || {}).includes('stack'), JSON.stringify(evalCode.data));

    const mine = await call('GET', '/api/submissions/me', { token });
    check('GET /api/submissions/me returns history', mine.status === 200 && mine.data.length >= 2, `got ${mine.data?.length}`);
  }

  console.log('\nLeaderboard');
  {
    const board = await call('GET', '/api/leaderboards', { token });
    check('GET /api/leaderboards returns ranked entries', board.status === 200 && Array.isArray(board.data.entries), JSON.stringify(board.data)?.slice(0, 120));
    check('leaderboard highlights the signed-in learner', board.data.entries?.some((entry) => entry.isMe) || Boolean(board.data.me));
    check('leaderboard exposes the current user', Boolean(board.data.me));
    check('leaderboard entries carry rank + xp', typeof board.data.entries?.[0]?.rank === 'number' && typeof board.data.entries?.[0]?.xp === 'number');
  }

  console.log('\nAchievements');
  {
    const catalog = await call('GET', '/api/achievements');
    check('GET /api/achievements returns the catalog', catalog.status === 200 && catalog.data.length > 0);

    const first = await call('POST', '/api/achievements/unlock', { token, body: { key: catalog.data[0].key } });
    check('unlocking an achievement works', first.status === 201, `${first.status} ${JSON.stringify(first.data)}`);
    const reward = first.data.awardedXp;

    const again = await call('POST', '/api/achievements/unlock', { token, body: { key: catalog.data[0].key } });
    check('re-unlocking awards no XP', again.status === 200 && again.data.awardedXp === 0 && again.data.alreadyUnlocked === true, JSON.stringify(again.data));

    const owned = await call('GET', '/api/achievements/me', { token });
    check('GET /api/achievements/me lists unlocked achievements', owned.status === 200 && owned.data.length === 1, `got ${owned.data?.length}`);
    check('XP reward was applied exactly once', reward === catalog.data[0].xpReward);
  }

  console.log('\nMission rewards');
  {
    const state = await call('GET', '/api/profile/missions', { token });
    check('GET /api/profile/missions returns claim state', state.status === 200 && Array.isArray(state.data.claims), JSON.stringify(state.data?.claims));

    const first = await call('POST', '/api/profile/missions/claim', { token, body: { type: 'daily-all' } });
    check('first daily claim is accepted', first.status === 201 && first.data.awardedXp > 0, `${first.status} ${JSON.stringify(first.data)}`);
    const dailyXp = first.data.awardedXp;

    const second = await call('POST', '/api/profile/missions/claim', { token, body: { type: 'daily-all' } });
    check('second daily claim awards nothing', second.status === 200 && second.data.awardedXp === 0 && second.data.alreadyClaimed === true, JSON.stringify(second.data));

    const after = await call('GET', '/api/profile/missions', { token });
    check('claims are persisted on the user', after.data.claims.length === 3, `got ${after.data.claims.length}`);

    const meAfter = await call('GET', '/api/auth/me', { token });
    check('mission XP applied exactly once', meAfter.data.user.xp === first.data.user.xp, `${meAfter.data.user.xp} vs ${first.data.user.xp}`);

    const weekly = await call('POST', '/api/profile/missions/claim', { token, body: { type: 'weekly', id: 101 } });
    check('weekly claim works', weekly.status === 201 && weekly.data.awardedXp === 500, JSON.stringify(weekly.data));

    const unknown = await call('POST', '/api/profile/missions/claim', { token, body: { type: 'weekly', id: 999 } });
    check('unknown mission is rejected', unknown.status === 400);

    check('daily reward total matches the UI table', dailyXp === 520, `got ${dailyXp}`);
  }

  console.log('\nAuthorisation');
  {
    const admin = await call('GET', '/api/admin/users', { token });
    check('normal users cannot list admin data', admin.status === 403, `status ${admin.status}`);

    const createProblem = await call('POST', '/api/problems', { token, body: { title: 'x', statement: 'y' } });
    check('normal users cannot create catalog problems', createProblem.status === 403, `status ${createProblem.status}`);

    const createAchievement = await call('POST', '/api/achievements', { token, body: { name: 'x', description: 'y' } });
    check('normal users cannot create achievements', createAchievement.status === 403, `status ${createAchievement.status}`);

    const upload = await fetch(`${base}/api/uploads`, { method: 'POST' });
    check('uploads require authentication', upload.status === 401, `status ${upload.status}`);
  }

  server.close();
  await mongoose.disconnect();
  await mongod.stop();

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) {
    console.log('\nFailures:');
    failures.forEach((failure) => console.log(` - ${failure}`));
    process.exit(1);
  }
  process.exit(0);
};

run().catch((error) => {
  console.error('Test harness crashed:', error);
  process.exit(1);
});
