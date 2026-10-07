import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'habit-tracker-super-secret-jwt-key-2026';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Register
router.post('/register', async (req, res) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: parse.error.errors[0].message });
    }

    const { name, email, password } = parse.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        preferences: {
          create: {
            theme: 'light',
            compactGrid: false,
          }
        }
      },
      select: { id: true, name: true, email: true, timezone: true }
    });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: parse.error.errors[0].message });
    }

    const { email, password } = parse.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      user: { id: user.id, name: user.name, email: user.email, timezone: user.timezone },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Demo/Guest Quick Login (Convenient 1-click test button)
router.post('/demo', async (req, res) => {
  try {
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@habittracker.app' },
      select: { id: true, name: true, email: true, timezone: true }
    });

    if (!demoUser) {
      const passwordHash = await bcrypt.hash('DemoPassword123!', 10);
      demoUser = await prisma.user.create({
        data: {
          name: 'Alex Mercer',
          email: 'demo@habittracker.app',
          passwordHash,
          timezone: 'UTC',
          preferences: { create: { theme: 'light' } }
        },
        select: { id: true, name: true, email: true, timezone: true }
      });
    }

    const token = jwt.sign({ id: demoUser.id, email: demoUser.email, name: demoUser.name }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ user: demoUser, token });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Could not log in as demo user' });
  }
});

// Current User Profile
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
