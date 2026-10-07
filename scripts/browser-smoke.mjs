/**
 * Browser smoke test for DevVerse.
 *
 * Drives the real preview in headless Chrome: landing → auth → OTP →
 * protected-route redirect → practice module → run/submit → leaderboard.
 *
 * Usage: node scripts/browser-smoke.mjs [baseUrl]
 */
import puppeteer from 'puppeteer';

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/+$/, '');
const APP = `${BASE}/Devcodein/`;

const results = [];
const consoleErrors = [];

const check = (label, ok, detail = '') => {
  results.push({ label, ok, detail });
  console.log(`${ok ? '  ✓' : '  ✗'} ${label}${ok ? '' : ` — ${detail}`}`);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 960 });

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

  const text = () => page.evaluate(() => document.body.innerText);
  const goto = async (path, options = {}) => {
    // networkidle2 is unreliable against the Vite dev server (HMR socket keeps
    // connections open), so wait for the SPA shell to render instead.
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', ...options });
    // Wait for React to render AND for the auth session check to settle
    // (header shows "Restoring…" while bootstrapping).
    await page.waitForFunction(
      () => {
        const root = document.getElementById('root');
        if (!root || !root.innerText.trim()) return false;
        const text = root.innerText;
        return !text.includes('Restoring your session…') && !text.includes('Restoring…');
      },
      { timeout: 30000 }
    );
  };

  try {
    // ---------------------------------------------------------- landing
    console.log('\nLanding page');
    await goto('/Devcodein/');
    const landing = await text();
    check('landing renders', landing.includes('Learn to build like the top 1%'), landing.slice(0, 80));
    check('landing has a sign-in entry point', await page.$('a[href="/Devcodein/auth"]') !== null);

    // ------------------------------------------- auth alias routes (logged out)
    console.log('\nAuth route aliases');
    for (const alias of ['/login', '/register', '/verify-otp']) {
      await goto(`/Devcodein${alias}`);
      const onAuth = page.url().includes('/auth');
      const hasForm = (await page.$('input[type="email"]')) !== null;
      check(`auth alias ${alias} loads the auth page (no 404)`, onAuth && hasForm, page.url());
    }

    // --------------------------------------------- protected redirect
    console.log('\nProtected route guard');
    await goto('/Devcodein/modules/practice');
    await page.waitForFunction(() => location.pathname.includes('/auth'), { timeout: 15000 });
    check(
      'unauthenticated /modules/practice redirects to /auth with returnTo',
      page.url().includes('returnTo='), page.url()
    );

    // ---------------------------------------------------- registration
    console.log('\nRegistration + OTP');
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    const email = `browser-${Date.now()}@devverse.dev`;

    await page.click('button:has-text("Register"), text/Sign up/i').catch(() => {});
    const modeButton = await page.$$eval('button', (nodes) =>
      nodes.findIndex((node) => /register|sign up/i.test(node.textContent || ''))
    );
    if (modeButton >= 0) {
      const buttons = await page.$$('button');
      await buttons[modeButton].click();
    }
    await sleep(300);

    const inputs = await page.$$('input');
    // order: [name (register only), email, password]
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');
    const nameInput = await page.$$('input[type="text"], input:not([type])').then((all) => all[0]);

    if (nameInput) await nameInput.type('Browser Learner');
    await emailInput.type(email);
    await passwordInput.type('secret123');

    await page.evaluate(() => {
      const submit = [...document.querySelectorAll('button')].find((b) =>
        /create account|continue with email/i.test(b.textContent || '')
      );
      submit?.click();
    });

    await page.waitForFunction(
      () =>
        document.body.innerText.includes('Verify your email') ||
        location.pathname.includes('modules') ||
        location.pathname.includes('dashboard'),
      { timeout: 20000 }
    );
    const afterRegister = await text();
    check('registration reaches the OTP step', afterRegister.includes('Verify your email'), afterRegister.slice(0, 120));
    check(
      'development OTP notice is shown (no email transport)',
      /development notice/i.test(afterRegister),
      afterRegister.slice(0, 200)
    );

    // click the code in the dev notice to autofill
    await page.evaluate(() => {
      const notice = [...document.querySelectorAll('button')].find((b) => /^\d{6}$/.test(b.textContent?.trim() || ''));
      notice?.click();
    });
    await sleep(200);
    await page.evaluate(() => {
      const verify = [...document.querySelectorAll('button')].find((b) => /verify code/i.test(b.textContent || ''));
      verify?.click();
    });

    await page.waitForFunction(
      () => location.pathname.includes('dashboard') || location.pathname.includes('modules'),
      { timeout: 20000 }
    );
    check(
      'OTP verification returns the learner to the originally requested page',
      page.url().includes('modules/practice'),
      page.url()
    );

    // ------------------------------------------------ session restore
    console.log('\nSession persistence');
    await goto('/Devcodein/modules/profile');
    await page.waitForSelector('h1', { timeout: 15000 });
    const profileText = await text();
    check('profile page renders after reload', profileText.includes('Browser Learner'), profileText.slice(0, 140));

    const hasToken = await page.evaluate(() => Boolean(localStorage.getItem('devverse_auth_token')));
    check('JWT is persisted across reloads', hasToken);

    // -------------------------------------------------- practice module
    console.log('\nPractice module');
    await goto('/Devcodein/modules/practice');
    await page.waitForFunction(
      () => /active challenges|Unable to reach the challenges API/i.test(document.body.innerText),
      { timeout: 20000 }
    );
    const practiceText = await text();
    check('challenges load', practiceText.includes('active challenges'), practiceText.slice(0, 200));
    check('no API error banner', !practiceText.includes('Unable to reach the challenges API'), practiceText.slice(0, 200));
    // Monaco loads lazily from the CDN — give it time to mount before checking.
    await page.waitForSelector('.monaco-editor', { timeout: 30000 }).catch(() => {});
    check('Monaco editor mounted', (await page.$('.monaco-editor')) !== null);

    // run the starter code against the local test cases
    await page.evaluate(() => {
      const run = [...document.querySelectorAll('button')].find((b) => /run code/i.test(b.textContent || ''));
      run?.click();
    });
    await page
      .waitForFunction(
        () => /Local test results|no local test cases/i.test(document.body.innerText),
        { timeout: 15000 }
      )
      .catch(() => {});
    const afterRun = await text();
    check(
      'Run Code produces local test results',
      afterRun.includes('Local test results') || afterRun.includes('no local test cases'),
      afterRun.slice(0, 300)
    );

    // submit
    const xpBefore = await text().then((t) => t.match(/(\d[\d,]*) XP/)?.[0] || '');
    await page.evaluate(() => {
      const submit = [...document.querySelectorAll('button')].find((b) => /submit code/i.test(b.textContent || ''));
      submit?.click();
    });
    await page.waitForFunction(
      () => /Submission accepted|Not accepted yet|Submission failed/.test(document.body.innerText),
      { timeout: 20000 }
    );
    const afterSubmit = await text();
    check(
      'Submit Code returns a server verdict',
      /Submission accepted|Not accepted yet|Submission failed/.test(afterSubmit),
      afterSubmit.slice(0, 300)
    );

    // --------------------------------------- challenge deep link (/practice/:id)
    console.log('\nChallenge deep link');
    const secondTitle = await page.evaluate(() => {
      const candidates = [...document.querySelectorAll('button')].filter(
        (b) => (b.innerText || '').trim().length > 20
      );
      const target = candidates[1] || null;
      if (!target) return null;
      const title = target.innerText.split('\n')[0].trim();
      target.click();
      return title;
    });
    await sleep(600);
    const deepPath = new URL(page.url()).pathname;
    check(
      'selecting a challenge puts its id in the URL',
      /\/modules\/practice\/[^/]+$/.test(deepPath),
      deepPath
    );
    await goto(deepPath); // full document load = direct URL / refresh
    // Wait for the challenge catalog to render before asserting its title.
    await page
      .waitForFunction(
        () => /active challenges|Unable to reach the challenges API/.test(document.body.innerText),
        { timeout: 20000 }
      )
      .catch(() => {});
    const deepBody = await text();
    check(
      'direct URL + refresh keep the challenge page open',
      page.url().includes('/modules/practice/') &&
        !deepBody.includes('This page does not exist.') &&
        (secondTitle ? deepBody.includes(secondTitle) : false),
      page.url()
    );

    // ------------------------------------------------------ leaderboard
    console.log('\nLeaderboard');
    await goto('/Devcodein/modules/leaderboard');
    await page.waitForFunction(
      () => document.body.innerText.includes('Live data'),
      { timeout: 20000 }
    );
    const boardText = await text();
    check('leaderboard renders live data badge', boardText.includes('Live data'), boardText.slice(0, 200));
    await page
      .waitForFunction(() => document.body.innerText.includes('(You)'), { timeout: 20000 })
      .catch(() => {});
    const boardWithMe = await text();
    check('signed-in learner appears on the board', boardWithMe.includes('(You)'), boardWithMe.slice(0, 300));

    // ---------------------------------------------------- route sweep
    console.log('\nRoute sweep (every documented route)');
    const sweepRoutes = [
      '/dashboard',
      '/modules/programming-explorer',
      '/modules/practice',
      '/modules/dsa-battle',
      '/modules/algorithm-visualizer',
      '/modules/complexity-analyzer',
      '/modules/ai-mentor',
      '/modules/roadmaps',
      '/modules/community',
      '/leaderboard',
      '/achievements',
      '/missions',
      '/profile',
      '/settings'
    ];
    for (const route of sweepRoutes) {
      await goto(`/Devcodein${route}`);
      const body = await text();
      const is404 = body.includes('This page does not exist.');
      check(
        `route renders: ${route}`,
        !is404 && body.trim().length > 0,
        is404 ? '404 page' : body.slice(0, 80)
      );
      if (route === '/dashboard') {
        check('dashboard greets the learner', body.includes('Welcome back'), body.slice(0, 120));
      }
    }

    // ------------------------------------------- roadmap deep link (:roadmapId)
    console.log('\nRoadmap deep link');
    await goto('/Devcodein/modules/roadmaps');
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll('button')].find((b) => /Backend/.test(b.innerText || ''));
      btn?.click();
    });
    await sleep(500);
    check('selecting a roadmap updates the URL', page.url().includes('roadmaps/backend'), page.url());
    await goto('/Devcodein/modules/roadmaps/backend');
    const roadmapBody = await text();
    check(
      'roadmap deep link opens directly (no 404)',
      page.url().includes('roadmaps/backend') && !roadmapBody.includes('This page does not exist.'),
      page.url()
    );

    // ------------------------------------------------------ logout flow
    console.log('\nLogout');
    await goto('/Devcodein/');
    await page.evaluate(() => {
      const signOut = [...document.querySelectorAll('button')].find((b) => /sign out/i.test(b.textContent || ''));
      signOut?.click();
    });
    await sleep(800);
    const tokenAfterLogout = await page.evaluate(() => localStorage.getItem('devverse_auth_token'));
    check('logout clears the stored token', !tokenAfterLogout);

    await goto('/Devcodein/modules/settings');
    await page.waitForFunction(() => location.pathname.includes('/auth'), { timeout: 15000 });
    check('protected route redirects again after logout', page.url().includes('/auth'), page.url());

    // ------------------------------------------------------- 404 route
    console.log('\nUnknown route');
    await goto('/Devcodein/auth');
    await sleep(500);
    await page.goto(`${BASE}/Devcodein/definitely-not-a-page`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => location.pathname.includes('/auth'), { timeout: 15000 });
    check('unknown route is guarded (redirects to auth)', page.url().includes('/auth'), page.url());
  } catch (error) {
    check('browser flow completed', false, error.message);
  } finally {
    await browser.close();
  }

  const realErrors = consoleErrors.filter(
    (line) => !/favicon|Monaco|cdn\.jsdelivr|net::ERR|Failed to load resource/i.test(line)
  );

  console.log('\nConsole errors:');
  if (realErrors.length === 0) console.log('  (none)');
  else realErrors.slice(0, 20).forEach((line) => console.log(`  ! ${line}`));

  const failed = results.filter((item) => !item.ok);
  console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
  process.exit(failed.length || realErrors.length ? 1 : 0);
};

run().catch((error) => {
  console.error('Harness crashed:', error);
  process.exit(1);
});
