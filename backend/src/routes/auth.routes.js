import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const GUEST_USER = {
  id: 'default-user',
  name: 'Habit Champion',
  email: 'champion@project-h.app',
  timezone: 'UTC',
};

// Register (No-op bypass - login removed)
router.post('/register', async (req, res) => {
  res.status(200).json({
    user: GUEST_USER,
    token: 'local-token-active',
  });
});

// Login (No-op bypass - login removed)
router.post('/login', async (req, res) => {
  res.status(200).json({
    user: GUEST_USER,
    token: 'local-token-active',
  });
});

// Current User Profile
router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user || GUEST_USER });
});

export default router;
