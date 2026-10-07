import express from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import {
  parseHabitNaturalLanguage,
  detectPatterns,
  generateDailySummary,
  generateWeeklySummary,
  answerHabitAssistantQuery
} from '../services/aiService.js';
import { computeMonthlyDashboard, toISODate } from '../services/analyticsService.js';

const router = express.Router();
router.use(authenticate);

// Helper to pull current dashboard context for AI evaluation
const getUserCurrentDashboard = async (userId) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const todayISO = toISODate(today);

  const habits = await prisma.habit.findMany({
    where: { userId },
    orderBy: { order: 'asc' },
  });

  const monthStr = String(month).padStart(2, '0');
  const startDate = `${year}-${monthStr}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`;

  const completions = await prisma.habitCompletion.findMany({
    where: {
      habitId: { in: habits.map(h => h.id) },
      date: { gte: startDate, lte: endDate },
    },
  });

  return {
    habits,
    completions,
    dashboardData: computeMonthlyDashboard(habits, completions, year, month, todayISO)
  };
};

// 1. Natural Language Habit Creation Parser
router.post('/habit-parser', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Prompt text is required' });
    }

    const parsedHabit = await parseHabitNaturalLanguage(prompt);
    res.json({
      parsedHabit,
      message: 'Habit parsed successfully. Please review and confirm to save.',
    });
  } catch (error) {
    console.error('AI habit parser error:', error);
    res.status(500).json({ message: error.message || 'Failed to parse habit' });
  }
});

// 2. Daily Summary
router.get('/daily-summary', async (req, res) => {
  try {
    const { dashboardData } = await getUserCurrentDashboard(req.user.id);
    const summary = generateDailySummary(dashboardData);
    res.json({ summary });
  } catch (error) {
    console.error('AI daily summary error:', error);
    res.status(500).json({ message: 'Failed to generate daily summary' });
  }
});

// 3. Weekly Summary
router.get('/weekly-summary', async (req, res) => {
  try {
    const { dashboardData } = await getUserCurrentDashboard(req.user.id);
    const summary = generateWeeklySummary(dashboardData);
    res.json({ summary });
  } catch (error) {
    console.error('AI weekly summary error:', error);
    res.status(500).json({ message: 'Failed to generate weekly summary' });
  }
});

// 4. Pattern Detection & Smart Insights
router.get('/insights', async (req, res) => {
  try {
    const { habits, completions, dashboardData } = await getUserCurrentDashboard(req.user.id);
    const insights = detectPatterns(habits, completions, dashboardData.dailyStats);
    res.json({ insights });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ message: 'Failed to detect habit patterns' });
  }
});

// 5. Interactive AI Habit Assistant Chat
router.post('/chat', async (req, res) => {
  try {
    const { query, conversationId } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Query message is required' });
    }

    const { dashboardData } = await getUserCurrentDashboard(req.user.id);
    const response = await answerHabitAssistantQuery(query, dashboardData);

    // Persist conversation optionally (non-blocking)
    let convId = conversationId;
    try {
      const convClient = prisma.aIConversation || prisma.aiConversation;
      const msgClient = prisma.aIMessage || prisma.aiMessage;

      if (convClient && msgClient) {
        let conversation = convId ? await convClient.findFirst({ where: { id: convId, userId: req.user.id } }) : null;
        if (!conversation) {
          conversation = await convClient.create({
            data: {
              userId: req.user.id,
              title: query.slice(0, 30) + '...',
            }
          });
        }
        convId = conversation.id;

        await msgClient.create({
          data: {
            conversationId: conversation.id,
            role: 'user',
            content: query,
          }
        });

        await msgClient.create({
          data: {
            conversationId: conversation.id,
            role: 'assistant',
            content: response.reply,
          }
        });
      }
    } catch (persistErr) {
      console.warn('Chat message persistence skipped:', persistErr.message);
    }

    res.json({
      reply: response.reply,
      source: response.source,
      conversationId: convId,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ message: 'Failed to process AI assistant query' });
  }
});

export default router;
