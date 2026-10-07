import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendOtpEmail, sendWelcomeEmail } from '../services/mailer.js';
import { requireDb } from '../config/db.js';
import { resolveAllowedOrigins, firstAllowedClient, deriveSpaPrefix } from '../config/origins.js';

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devverse-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

/** Safe, password-free representation of a user for the frontend. */
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  xp: user.xp,
  level: Math.floor((user.xp || 0) / 1000) + 1,
  solvedProblems: user.solvedProblems,
  solvedProblemIds: user.solvedProblemIds || [],
  streak: user.streak,
  longestStreak: user.longestStreak || user.streak,
  avatar: user.avatar || '',
  badges: user.badges || [],
  achievements: user.achievements || [],
  isEmailVerified: Boolean(user.isEmailVerified),
  createdAt: user.createdAt
});

const issueOtp = async (user) => {
  const code = user.generateOtp();
  await user.save({ validateBeforeSave: false });
  const delivery = await sendOtpEmail({
    to: user.email,
    name: user.name,
    code,
    expiresInMinutes: User.OTP_TTL_MINUTES
  });
  return delivery;
};

/**
 * Sends the welcome email at most once per account, right after the account
 * is created. The flag lives on the user document so the backend — never the
 * frontend — decides whether a welcome email may be sent. Failures are logged
 * and swallowed: they must not block registration or sign-in.
 */
const sendWelcomeOnce = async (user) => {
  if (user.welcomeEmailSent) return;
  try {
    const result = await sendWelcomeEmail({ to: user.email, name: user.name });
    if (result.delivered) {
      user.welcomeEmailSent = true;
      await user.save({ validateBeforeSave: false });
    }
  } catch (error) {
    console.warn(`[auth] welcome email failed for ${user.email}: ${error.message}`);
  }
};

const otpResponse = (user, token, delivery = {}) => ({
  token,
  user: publicUser(user),
  requiresOtp: !user.isEmailVerified,
  otpEmail: user.email,
  // Only ever present in development with no mail transport configured.
  devOtp: delivery.devOtp,
  otpDelivery: delivery.delivered ? 'email' : 'development',
  message: delivery.delivered
    ? 'A verification code has been sent to your email.'
    : user.isEmailVerified
      ? 'Signed in.'
      : 'Email delivery is not configured on this server, so the code is shown in the development notice.'
});

// ---------------------------------------------------------------- register
router.post('/register', requireDb, async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (String(name).trim().length < 2) {
      return res.status(400).json({ message: 'Please provide your full name' });
    }
    if (!EMAIL_PATTERN.test(String(email))) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password)
    });

    const token = signToken(user);
    const delivery = await issueOtp(user).catch((error) => {
      console.warn(`[auth] OTP delivery failed: ${error.message}`);
      return { delivered: false, reason: error.message };
    });

    // First-time account creation only — never on later logins.
    await sendWelcomeOnce(user);

    res.status(201).json(otpResponse(user, token, delivery));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    next(error);
  }
});

// ------------------------------------------------------------------ login
router.post('/login', requireDb, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select(
      '+password +otpHash +otpExpires +otpAttempts'
    );

    if (!user || !(await user.matchPassword(String(password)))) {
      return res
        .status(401)
        .json({ message: 'Unable to sign in. Please check your email and password.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    const token = signToken(user);

    if (!user.isEmailVerified) {
      const delivery = await issueOtp(user).catch((error) => {
        console.warn(`[auth] OTP delivery failed: ${error.message}`);
        return { delivered: false, reason: error.message };
      });
      return res.json(otpResponse(user, token, delivery));
    }

    res.json({ token, user: publicUser(user), requiresOtp: false, otpEmail: user.email });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------- session restore
router.get('/me', protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// ------------------------------------------------------------ verify OTP
router.post('/verify-otp', protect, requireDb, async (req, res, next) => {
  try {
    const code = String(req.body?.otp || '').trim();
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Enter the 6-digit code' });
    }

    const user = await User.findById(req.user._id).select('+otpHash +otpExpires +otpAttempts');
    if (!user) return res.status(401).json({ message: 'User not found' });

    if (user.isEmailVerified) {
      return res.json({ user: publicUser(user), requiresOtp: false, message: 'Email already verified.' });
    }

    if (!user.otpExpires || user.otpExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: 'That code has expired. Request a new one.' });
    }
    if (user.otpAttempts >= 5) {
      return res.status(429).json({ message: 'Too many incorrect attempts. Request a new code.' });
    }

    if (!user.verifyOtp(code)) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'The code is incorrect' });
    }

    user.isEmailVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    await user.save({ validateBeforeSave: false });

    res.json({
      user: publicUser(user),
      requiresOtp: false,
      message: 'Email verified. Welcome to DevVerse!'
    });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------ resend OTP
router.post('/resend-otp', protect, requireDb, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.isEmailVerified) {
      return res.json({ message: 'Your email is already verified.', requiresOtp: false });
    }

    const delivery = await issueOtp(user);
    res.json({
      otpEmail: user.email,
      requiresOtp: true,
      devOtp: delivery.devOtp,
      otpDelivery: delivery.delivered ? 'email' : 'development',
      message: delivery.delivered
        ? 'A fresh code has been sent.'
        : 'Email delivery is not configured — check the development notice for your code.'
    });
  } catch (error) {
    next(error);
  }
});

// ----------------------------------------------------------- change email
router.post('/change-email', protect, requireDb, async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const clash = await User.findOne({ email });
    if (clash && String(clash._id) !== String(req.user._id)) {
      return res.status(409).json({ message: 'That email is already in use' });
    }

    const user = await User.findById(req.user._id);
    user.email = email;
    user.isEmailVerified = false;

    const delivery = await issueOtp(user);
    res.json({
      otpEmail: user.email,
      requiresOtp: true,
      devOtp: delivery.devOtp,
      otpDelivery: delivery.delivered ? 'email' : 'development',
      user: publicUser(user),
      message: 'Verification code sent to the new email address.'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That email is already in use' });
    }
    next(error);
  }
});

// ------------------------------------------------------- Google OAuth
//
// Authorization-code flow, entirely server-side: the browser is redirected to
// Google, the code is exchanged on the server (client secret never reaches
// the frontend), and the API issues its own JWT on success. Without
// GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET the start endpoint bounces back to
// the sign-in page with a friendly `google=not_configured` flag.

const googleConfigured = () =>
  Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const safeReturnTo = (value) =>
  typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')
    ? value
    : '/dashboard';

/**
 * Where the SPA lives. Only origins listed in CLIENT_URL (or APP_URL, which
 * wins) are ever used for post-OAuth redirects, so a forged Referer can never
 * leak a token to another site.
 */
const resolveClient = (req) => {
  if (process.env.APP_URL) {
    try {
      const url = new URL(process.env.APP_URL);
      return { origin: url.origin, prefix: url.pathname.replace(/\/$/, '') };
    } catch (error) {
      console.warn(`[auth] APP_URL is not a valid URL: ${error.message}`);
    }
  }

  const raw = req.get('referer') || req.get('origin') || '';
  if (raw) {
    try {
      const url = new URL(raw);
      // Trust the Referer when it is a configured origin OR when the frontend
      // is served from this very host (same-origin dev / preview). Anything
      // else (a forged Referer) never becomes a redirect target.
      if (
        resolveAllowedOrigins().includes(url.origin) ||
        (req.get('host') && url.host === req.get('host'))
      ) {
        return { origin: url.origin, prefix: deriveSpaPrefix(url.pathname) };
      }
    } catch {
      /* fall through to configuration */
    }
  }

  const configured = firstAllowedClient();
  if (configured) return configured;

  // Development default matches the Vite base path (see vite.config.js).
  return { origin: 'http://localhost:3000', prefix: '/Devcodein' };
};

const callbackUri = (client) =>
  process.env.GOOGLE_CALLBACK_URL || `${client.origin}/api/auth/google/callback`;

const oauthFail = (client, code) =>
  `${client.origin}${client.prefix}/auth#google_error=${encodeURIComponent(code)}`;

// Step 1 — send the browser to Google's consent screen.
router.get('/google/start', (req, res) => {
  const client = resolveClient(req);

  if (!googleConfigured()) {
    return res.redirect(`${client.origin}${client.prefix}/auth?google=not_configured`);
  }

  const state = jwt.sign(
    { returnTo: safeReturnTo(req.query.returnTo), origin: client.origin, prefix: client.prefix },
    process.env.JWT_SECRET || 'devverse-secret',
    { expiresIn: '10m' }
  );

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: callbackUri(client),
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

// Step 2 — Google redirects back; we exchange the code server-side, find or
// create the account by verified email, then hand the SPA its JWT.
router.get('/google/callback', async (req, res) => {
  let client = resolveClient(req);

  try {
    if (!googleConfigured()) {
      return res.redirect(oauthFail(client, 'not_configured'));
    }

    const { code, state, error: googleError } = req.query || {};
    if (googleError) return res.redirect(oauthFail(client, 'access_denied'));
    if (!code) return res.redirect(oauthFail(client, 'missing_code'));

    let payload;
    try {
      payload = jwt.verify(String(state), process.env.JWT_SECRET || 'devverse-secret');
    } catch {
      return res.redirect(oauthFail(client, 'invalid_state'));
    }
    client = { origin: payload.origin, prefix: payload.prefix };

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: String(code),
        redirect_uri: callbackUri(client),
        grant_type: 'authorization_code'
      })
    });
    if (!tokenResponse.ok) {
      const detail = await tokenResponse.text().catch(() => '');
      throw new Error(`code exchange failed (${tokenResponse.status}): ${detail.slice(0, 200)}`);
    }
    const tokens = await tokenResponse.json();

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    if (!profileResponse.ok) {
      throw new Error(`userinfo request failed (${profileResponse.status})`);
    }
    const profile = await profileResponse.json();

    if (!profile.email || !profile.email_verified) {
      return res.redirect(oauthFail(client, 'unverified_email'));
    }

    const email = String(profile.email).toLowerCase().trim();
    let user = await User.findOne({ email }).select('+providerId');
    let isNewAccount = false;

    if (!user) {
      user = await User.create({
        name: String(profile.name || email.split('@')[0]).trim().slice(0, 80),
        email,
        provider: 'google',
        providerId: profile.sub,
        avatar: profile.picture || '',
        isEmailVerified: true
      });
      isNewAccount = true;
    } else if (!user.isActive) {
      return res.redirect(oauthFail(client, 'deactivated'));
    } else {
      // Account linking: the same verified email joins the existing account
      // instead of creating a duplicate. The local password keeps working.
      if (!user.providerId) {
        user.providerId = profile.sub;
        if (!user.avatar && profile.picture) user.avatar = profile.picture;
        user.isEmailVerified = true;
        user.otpHash = undefined;
        user.otpExpires = undefined;
        user.otpAttempts = 0;
        await user.save({ validateBeforeSave: false });
      }
    }

    if (isNewAccount) {
      await sendWelcomeOnce(user); // first-time Google registration only
    }

    const token = signToken(user);
    const params = new URLSearchParams({ returnTo: safeReturnTo(payload.returnTo) });
    return res.redirect(
      `${client.origin}${client.prefix}/auth?${params.toString()}#token=${encodeURIComponent(token)}`
    );
  } catch (error) {
    console.warn(`[auth] google oauth failed: ${error.message}`);
    return res.redirect(oauthFail(client, 'failed'));
  }
});

export default router;
