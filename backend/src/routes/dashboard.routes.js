import express from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { computeMonthlyDashboard, toISODate } from '../services/analyticsService.js';

const router = express.Router();
router.use(authenticate);

// Get complete monthly dashboard state
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const year = parseInt(req.query.year, 10) || currentYear;
    const month = parseInt(req.query.month, 10) || currentMonth;
    const todayISO = toISODate(today);

    // Get user active habits
    const habits = await prisma.habit.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: { order: 'asc' },
    });

    // Query completions for this month
    const monthStr = String(month).padStart(2, '0');
    const startDate = `${year}-${monthStr}-01`;
    const lastDayOfMonth = new Date(year, month, 0).getDate();
    const endDate = `${year}-${monthStr}-${String(lastDayOfMonth).padStart(2, '0')}`;

    const habitIds = habits.map(h => h.id);
    const completions = await prisma.habitCompletion.findMany({
      where: {
        habitId: { in: habitIds },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const dashboard = computeMonthlyDashboard(habits, completions, year, month, todayISO);

    res.json({
      dashboard,
      serverDate: todayISO,
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({ message: 'Failed to compute dashboard metrics' });
  }
});

export default router;
