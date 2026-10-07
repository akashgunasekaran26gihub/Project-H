import express from 'express';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { computeLifetimeStats, toISODate } from '../services/analyticsService.js';

const router = express.Router();
router.use(authenticate);

// Lifetime Statistics
router.get('/lifetime', async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.user.id },
    });

    const habitIds = habits.map(h => h.id);
    const allCompletions = await prisma.habitCompletion.findMany({
      where: { habitId: { in: habitIds } },
    });

    const todayISO = toISODate(new Date());
    const lifetime = computeLifetimeStats(habits, allCompletions, todayISO);

    res.json({ lifetime });
  } catch (error) {
    console.error('Lifetime analytics error:', error);
    res.status(500).json({ message: 'Failed to compute lifetime statistics' });
  }
});

// Chart Trend Analytics (for Recharts)
router.get('/trends', async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = parseInt(year, 10) || new Date().getFullYear();
    const currentMonth = parseInt(month, 10) || (new Date().getMonth() + 1);

    const habits = await prisma.habit.findMany({
      where: { userId: req.user.id, active: true },
      orderBy: { order: 'asc' },
    });

    const monthStr = String(currentMonth).padStart(2, '0');
    const startDate = `${currentYear}-${monthStr}-01`;
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const endDate = `${currentYear}-${monthStr}-${String(lastDayOfMonth).padStart(2, '0')}`;

    const habitIds = habits.map(h => h.id);
    const completions = await prisma.habitCompletion.findMany({
      where: {
        habitId: { in: habitIds },
        date: { gte: startDate, lte: endDate },
      },
    });

    // 1. Day by day completion trend for current month
    const completionMap = new Map();
    completions.forEach(c => completionMap.set(`${c.habitId}_${c.date}`, c));

    const dailyTrend = [];
    const totalActive = habits.length || 1;

    for (let day = 1; day <= lastDayOfMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateISO = `${currentYear}-${monthStr}-${dayStr}`;
      let completedCount = 0;

      habits.forEach(h => {
        const c = completionMap.get(`${h.id}_${dateISO}`);
        if (c && c.status === 'completed') completedCount++;
      });

      const rate = Math.round((completedCount / totalActive) * 100);
      dailyTrend.push({
        day: `Day ${day}`,
        rate,
        completed: completedCount,
        total: totalActive,
      });
    }

    // 2. Habit comparison data (bar chart)
    const habitComparison = habits.map(h => {
      const habitCompletions = completions.filter(c => c.habitId === h.id && c.status === 'completed');
      const rate = Math.round((habitCompletions.length / lastDayOfMonth) * 100);
      return {
        name: h.name,
        category: h.category,
        color: h.color,
        completions: habitCompletions.length,
        completionRate: rate,
      };
    });

    // 3. Day of week consistency (radar or bar)
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdayStats = dayNames.map((name, index) => {
      let count = 0;
      let totalOpportunities = 0;

      for (let day = 1; day <= lastDayOfMonth; day++) {
        const d = new Date(currentYear, currentMonth - 1, day);
        if (d.getDay() === index) {
          totalOpportunities += totalActive;
          const dayStr = String(day).padStart(2, '0');
          const dateISO = `${currentYear}-${monthStr}-${dayStr}`;
          habits.forEach(h => {
            const c = completionMap.get(`${h.id}_${dateISO}`);
            if (c && c.status === 'completed') count++;
          });
        }
      }

      return {
        day: name,
        rate: totalOpportunities > 0 ? Math.round((count / totalOpportunities) * 100) : 0,
      };
    });

    res.json({
      dailyTrend,
      habitComparison,
      weekdayStats,
    });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ message: 'Failed to compute trend metrics' });
  }
});

export default router;
