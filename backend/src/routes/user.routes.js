import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Get User Profile & Subscription Info
router.get('/profile', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        createdAt: true,
        preferences: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      user: {
        ...user,
        plan: 'pro', // Default SaaS Pro trial
        planStatus: 'active',
        trialDaysRemaining: 14,
      },
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// Update Profile
router.put('/profile', async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      timezone: z.string().optional(),
    });
    const parsed = schema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: parsed,
      select: { id: true, name: true, email: true, timezone: true },
    });

    res.json({ user: updated, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Invalid input' });
  }
});

// Change Password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newHash },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Delete Account (GDPR Compliance)
router.delete('/account', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ message: 'Account and all associated tracking data permanently deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

export default router;
