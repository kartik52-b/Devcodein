import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const otpStore = new Map();
const MAX_RESENDS = 3;
const MAX_ATTEMPTS = 5;
const OTP_TTL_MS = 5 * 60 * 1000;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

const sendOtpEmail = async (email, code) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'devverse@localhost',
      to: email,
      subject: 'DevVerse verification code',
      html: `<p>Your DevVerse verification code is <strong>${code}</strong>.</p><p>It expires in 5 minutes.</p>`
    });
  } catch (error) {
    console.warn('OTP email unavailable:', error.message);
  }
};

const createOtpPayload = (email) => {
  const code = crypto.randomInt(100000, 999999).toString();
  const now = Date.now();
  const record = { code, createdAt: now, attempts: 0, resendCount: 0 };
  otpStore.set(email.toLowerCase(), record);
  return record;
};

const issueOtp = async (user) => {
  const record = createOtpPayload(user.email);
  await sendOtpEmail(user.email, record.code);
  return record;
};

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devverse-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    await issueOtp(user);

    res.status(201).json({ token, requiresOtp: true, otpEmail: user.email, user: { id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp, solvedProblems: user.solvedProblems, streak: user.streak, avatar: user.avatar, isEmailVerified: user.isEmailVerified, achievements: user.achievements, completedMilestones: user.completedMilestones } });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devverse-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    await issueOtp(user);

    res.json({ token, requiresOtp: true, otpEmail: user.email, user: { id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp, solvedProblems: user.solvedProblems, streak: user.streak, avatar: user.avatar, isEmailVerified: user.isEmailVerified, achievements: user.achievements, completedMilestones: user.completedMilestones } });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-otp', protect, async (req, res, next) => {
  try {
    const { otp } = req.body;
    const email = req.user.email.toLowerCase();
    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ message: 'No verification code is active for this account' });
    }

    if (Date.now() - record.createdAt > OTP_TTL_MS) {
      otpStore.delete(email);
      return res.status(410).json({ message: 'Verification code expired. Request a new one.' });
    }

    record.attempts += 1;
    if (record.attempts > MAX_ATTEMPTS) {
      otpStore.delete(email);
      return res.status(429).json({ message: 'Too many attempts. Request a fresh code.' });
    }

    if (record.code !== String(otp)) {
      return res.status(401).json({ message: 'The verification code did not match' });
    }

    req.user.isEmailVerified = true;
    await req.user.save();
    otpStore.delete(email);

    const token = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET || 'devverse-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

    res.json({ token, user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, xp: req.user.xp, solvedProblems: req.user.solvedProblems, streak: req.user.streak, avatar: req.user.avatar, isEmailVerified: true, achievements: req.user.achievements, completedMilestones: req.user.completedMilestones } });
  } catch (error) {
    next(error);
  }
});

router.post('/resend-otp', protect, async (req, res) => {
  const email = req.user.email.toLowerCase();
  const existing = otpStore.get(email);
  if (existing && existing.resendCount >= MAX_RESENDS) {
    return res.status(429).json({ message: 'You have reached the resend limit for this code.' });
  }

  const record = createOtpPayload(req.user.email);
  record.resendCount = existing ? existing.resendCount + 1 : 1;
  otpStore.set(email, record);
  await sendOtpEmail(req.user.email, record.code);

  res.json({ message: 'A fresh verification code has been sent.', otpEmail: req.user.email });
});

router.post('/change-email', protect, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'An email address is required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(409).json({ message: 'That email already belongs to another account' });
    }

    req.user.email = email.toLowerCase();
    req.user.isEmailVerified = false;
    await req.user.save();
    await issueOtp(req.user);

    res.json({ message: 'Email updated. A new code has been sent.', otpEmail: req.user.email, requiresOtp: true });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Google sign-in requires an email address' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({ name: name || 'Google User', email: email.toLowerCase(), password: crypto.randomBytes(24).toString('hex') });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devverse-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    await issueOtp(user);

    res.json({ token, requiresOtp: true, otpEmail: user.email, user: { id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp, solvedProblems: user.solvedProblems, streak: user.streak, avatar: user.avatar, isEmailVerified: user.isEmailVerified, achievements: user.achievements, completedMilestones: user.completedMilestones } });
  } catch (error) {
    next(error);
  }
});

export default router;
