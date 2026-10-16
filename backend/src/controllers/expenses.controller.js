import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    const where = { userId: req.user.id };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    if (category) {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const expense = await prisma.expense.create({
      data: {
        userId: req.user.id,
        amount: parseFloat(amount),
        category: category || 'General',
        description,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Failed to create expense', error: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, description, date } = req.body;

    const expense = await prisma.expense.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        category,
        description,
        date: date ? new Date(date) : undefined,
      },
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Failed to update expense', error: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await prisma.expense.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await prisma.expense.delete({
      where: { id },
    });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const now = dayjs();
    const userId = req.user.id;

    // Daily Total
    const todayStart = now.startOf('day').toDate();
    const todayEnd = now.endOf('day').toDate();
    
    // Weekly Total
    const weekStart = now.startOf('week').toDate();
    const weekEnd = now.endOf('week').toDate();
    
    // Monthly Total (Current)
    const monthStart = now.startOf('month').toDate();
    const monthEnd = now.endOf('month').toDate();

    // Last Month Total
    const lastMonthStart = now.subtract(1, 'month').startOf('month').toDate();
    const lastMonthEnd = now.subtract(1, 'month').endOf('month').toDate();

    const [dailyExp, weeklyExp, monthlyExp, lastMonthExp] = await Promise.all([
      prisma.expense.aggregate({
        where: { userId, date: { gte: todayStart, lte: todayEnd } },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: weekStart, lte: weekEnd } },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { userId, date: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { amount: true }
      })
    ]);

    const dailyTotal = dailyExp._sum.amount || 0;
    const weeklyTotal = weeklyExp._sum.amount || 0;
    const monthlyTotal = monthlyExp._sum.amount || 0;
    const lastMonthTotal = lastMonthExp._sum.amount || 0;

    // Monthly Average calculation (based on all-time data or past X months)
    const allTimeStats = await prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
      _min: { date: true },
      _max: { date: true }
    });

    let monthlyAverage = 0;
    if (allTimeStats._sum.amount && allTimeStats._min.date) {
       const minDate = dayjs(allTimeStats._min.date);
       const monthsDiff = (now.year() - minDate.year()) * 12 + now.month() - minDate.month() + 1;
       monthlyAverage = allTimeStats._sum.amount / (monthsDiff > 0 ? monthsDiff : 1);
    }

    // Breakdown by month for comparison graph
    // Let's get the last 6 months
    const sixMonthsAgo = now.subtract(5, 'month').startOf('month').toDate();
    const recentExpenses = await prisma.expense.findMany({
      where: { userId, date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true }
    });

    const monthlyBreakdownMap = {};
    for (let i = 0; i <= 5; i++) {
       const m = now.subtract(i, 'month');
       const key = m.format('MMM YYYY');
       monthlyBreakdownMap[key] = 0;
    }

    recentExpenses.forEach(exp => {
      const key = dayjs(exp.date).format('MMM YYYY');
      if (monthlyBreakdownMap[key] !== undefined) {
        monthlyBreakdownMap[key] += exp.amount;
      }
    });

    const monthlyComparison = Object.keys(monthlyBreakdownMap)
       .map(key => ({ month: key, total: monthlyBreakdownMap[key] }))
       .reverse();

    res.json({
      dailyTotal,
      weeklyTotal,
      monthlyTotal,
      lastMonthTotal,
      monthlyAverage,
      monthlyComparison
    });
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    res.status(500).json({ message: 'Failed to fetch expense summary', error: error.message });
  }
};
