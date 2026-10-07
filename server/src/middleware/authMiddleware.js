import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDbReady } from '../config/db.js';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}
if (!process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET is not set — using the development fallback secret.');
}

export const protect = async (req, res, next) => {
  if (!isDbReady()) {
    return res.status(503).json({ message: 'Database is unavailable right now. Please try again shortly.' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devverse-secret');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    const expired = error?.name === 'TokenExpiredError';
    return res
      .status(401)
      .json({ message: expired ? 'Your session has expired. Please sign in again.' : 'Invalid token' });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
