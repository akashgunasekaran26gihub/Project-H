import express from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

const habitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(60),
  description: z.string().optional().nullable(),
  frequency: z.string().default('daily'),
  target: z.number().positive().default(1),
  unit: z.string().default('times'),
  preferredTime: z.string().optional().nullable(),
  color: z.string().default('#6366f1'),
  icon: z.string().default('activity'),
  category: z.string().default('General'),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

// List all user habits
router.get('/', async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const where = {
      userId: req.user.id,
      ...(includeArchived === 'true' ? {} : { active: true }),
    };

    const habits = await prisma.habit.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    res.json({ habits });
  } catch (error) {
    console.error('Fetch habits error:', error);
    res.status(500).json({ message: 'Failed to retrieve habits' });
  }
});

// Create new habit
router.post('/', async (req, res) => {
  try {
    const parsed = habitSchema.parse(req.body);
    
    // Determine highest order
    const maxOrderHabit = await prisma.habit.findFirst({
      where: { userId: req.user.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const nextOrder = (maxOrderHabit?.order ?? -1) + 1;

    const habit = await prisma.habit.create({
      data: {
        ...parsed,
        userId: req.user.id,
        order: nextOrder,
        startDate: parsed.startDate ? new Date(parsed.startDate) : new Date(),
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
      },
    });

    res.status(201).json({ habit, message: 'Habit created successfully' });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Create habit error:', error);
    res.status(500).json({ message: 'Failed to create habit' });
  }
});

// Update habit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = habitSchema.partial().parse(req.body);

    const habit = await prisma.habit.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        ...parsed,
        startDate: parsed.startDate ? new Date(parsed.startDate) : habit.startDate,
        endDate: parsed.endDate !== undefined ? (parsed.endDate ? new Date(parsed.endDate) : null) : habit.endDate,
      },
    });

    res.json({ habit: updated, message: 'Habit updated successfully' });
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error('Update habit error:', error);
    res.status(500).json({ message: 'Failed to update habit' });
  }
});

// Archive/Toggle Active status
router.patch('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await prisma.habit.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: { active: !habit.active },
    });

    res.json({ habit: updated, message: updated.active ? 'Habit restored' : 'Habit archived' });
  } catch (error) {
    console.error('Archive habit error:', error);
    res.status(500).json({ message: 'Failed to toggle archive status' });
  }
});

// Reorder habits
router.put('/reorder', async (req, res) => {
  try {
    const { habitIds } = req.body; // Array of habit ids in desired order
    if (!Array.isArray(habitIds)) {
      return res.status(400).json({ message: 'habitIds must be an array' });
    }

    // Update orders in transaction
    await prisma.$transaction(
      habitIds.map((id, index) =>
        prisma.habit.updateMany({
          where: { id, userId: req.user.id },
          data: { order: index },
        })
      )
    );

    res.json({ message: 'Habit order updated' });
  } catch (error) {
    console.error('Reorder habits error:', error);
    res.status(500).json({ message: 'Failed to reorder habits' });
  }
});

// Delete habit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const habit = await prisma.habit.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    await prisma.habit.delete({ where: { id } });
    res.json({ message: 'Habit deleted permanently' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ message: 'Failed to delete habit' });
  }
});

export default router;
