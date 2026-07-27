import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async(req, res, next) => {
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

        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp, solvedProblems: user.solvedProblems, streak: user.streak } });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async(req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devverse-secret', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, xp: user.xp, solvedProblems: user.solvedProblems, streak: user.streak } });
    } catch (error) {
        next(error);
    }
});

export default router;