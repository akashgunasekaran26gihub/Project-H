import express from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

const toggleSchema = z.object({
  habitId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  status: z.enum(['completed', 'partial', 'missed', 'unmarked']).optional(),
  value: z.number().optional(),
  note: z.string().optional().nullable(),
});

// Toggle or update completion status for a habit on a specific date
router.post('/toggle', async (req, res) => {
  try {
    const { habitId, date, status: requestedStatus, value, note } = toggleSchema.parse(req.body);

    // Verify ownership of the habit
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: req.user.id },
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    // Find existing completion for this date
    const existing = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId,
          date,
        },
      },
    });

    let newStatus = requestedStatus;

    // If no explicit status was requested, cycle through states:
    // unmarked -> completed -> partial -> unmarked
    if (!newStatus) {
      if (!existing || existing.status === 'unmarked') {
        newStatus = 'completed';
      } else if (existing.status === 'completed') {
        newStatus = 'partial';
      } else if (existing.status === 'partial') {
        newStatus = 'missed';
      } else {
        newStatus = 'unmarked';
      }
    }

    if (newStatus === 'unmarked') {
      if (existing) {
        await prisma.habitCompletion.delete({
          where: { id: existing.id },
        });
      }
      return res.json({
        habitId,
        date,
        status: 'unmarked',
        value: 0,
        note: null,
        action: 'deleted',
      });
    }

    // Upsert completion record
    const result = await prisma.habitCompletion.upsert({
      where: {
        habitId_date: {
          habitId,
          date,
        },
      },
      update: {
        status: newStatus,
        value: value !== undefined ? value : (newStatus === 'completed' ? habit.target : habit.target * 0.5),
        ...(note !== undefined ? { note } : {}),
      },
      create: {
        habitId,
        date,
        status: newStatus,
        value: value !== undefined ? value : (newStatus === 'completed' ? habit.target : habit.target * 0.5),
        note: note || null,
      },
    });

    res.json({
      habitId: result.habitId,
      date: result.date,
      status: result.status,
      value: result.value,
      note: result.note,
      action: existing ? 'updated' : 'created',
    });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Toggle completion error:', error);
    res.status(500).json({ message: 'Failed to update completion status' });
  }
});

// Update notes for a completion
router.patch('/note', async (req, res) => {
  try {
    const { habitId, date, note } = req.body;
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: req.user.id },
    });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const completion = await prisma.habitCompletion.upsert({
      where: { habitId_date: { habitId, date } },
      update: { note },
      create: { habitId, date, note, status: 'completed' },
    });

    res.json({ completion });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Failed to save note' });
  }
});

export default router;
