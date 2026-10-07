import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api, syncOfflineActions, getOfflineQueue } from '../services/api';
import { playSound } from '../utils/soundEffects';
import { useAuth } from './AuthContext';

const HabitContext = createContext(null);

export const HabitProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Default to real-time current date
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const jumpToToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  const jumpToDemoMonth = () => {
    setYear(2026);
    setMonth(10);
  };

  // Core Data States
  const [dashboardData, setDashboardData] = useState(null);
  const [lifetimeData, setLifetimeData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [insightsData, setInsightsData] = useState([]);
  const [dailySummary, setDailySummary] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);

  // UI / Status States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'archived', 'category'
  const [searchQuery, setSearchQuery] = useState('');

  // Track online/offline status & auto-sync
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      const res = await syncOfflineActions();
      setOfflineQueueCount(0);
      if (res.synced > 0) {
        refreshDashboard();
      }
    };
    const handleOffline = () => {
      setIsOffline(true);
      setOfflineQueueCount(getOfflineQueue().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setOfflineQueueCount(getOfflineQueue().length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Dashboard and Analytics
  const loadData = useCallback(async (showLoading = true) => {
    if (!isAuthenticated) return;
    if (showLoading) setLoading(true);
    else setRefreshing(true);

    try {
      const [dashRes, lifeRes, trendsRes, insightsRes, dailyRes, weeklyRes] = await Promise.allSettled([
        api.getDashboard(year, month),
        api.getLifetime(),
        api.getTrends(year, month),
        api.getAIInsights(),
        api.getDailySummary(),
        api.getWeeklySummary(),
      ]);

      if (dashRes.status === 'fulfilled') setDashboardData(dashRes.value.dashboard);
      if (lifeRes.status === 'fulfilled') setLifetimeData(lifeRes.value.lifetime);
      if (trendsRes.status === 'fulfilled') setTrendsData(trendsRes.value);
      if (insightsRes.status === 'fulfilled') setInsightsData(insightsRes.value.insights);
      if (dailyRes.status === 'fulfilled') setDailySummary(dailyRes.value.summary);
      if (weeklyRes.status === 'fulfilled') setWeeklySummary(weeklyRes.value.summary);
    } catch (err) {
      console.error('Failed to load habit tracker data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, year, month]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const refreshDashboard = () => loadData(false);

  // Month navigation
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(prev => prev + 1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(prev => prev - 1);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const setMonthAndYear = (newYear, newMonth) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  // Optimistic Cell Toggle
  const toggleCell = async (habitId, date, currentStatus) => {
    // Next state cycle: unmarked -> completed -> partial -> missed -> unmarked
    let nextStatus = 'completed';
    if (currentStatus === 'completed') nextStatus = 'partial';
    else if (currentStatus === 'partial') nextStatus = 'missed';
    else if (currentStatus === 'missed') nextStatus = 'unmarked';
    else nextStatus = 'completed';

    const dayNum = parseInt(date.split('-')[2], 10);

    // Apply Optimistic Update locally
    setDashboardData((prev) => {
      if (!prev) return prev;
      const updatedHabits = prev.habits.map((h) => {
        if (h.id !== habitId) return h;
        const oldCell = h.days[dayNum] || { status: 'unmarked' };
        const newDays = {
          ...h.days,
          [dayNum]: { ...oldCell, date, status: nextStatus },
        };

        // Recalculate completedCount for this habit
        let completedCount = 0;
        let partialCount = 0;
        Object.values(newDays).forEach((c) => {
          if (c.status === 'completed') completedCount++;
          if (c.status === 'partial') partialCount++;
        });

        const monthlyRate = Math.min(100, Math.round(((completedCount + (partialCount * 0.5)) / prev.daysInMonth) * 100));

        return {
          ...h,
          days: newDays,
          completedCount,
          partialCount,
          monthlyRate,
        };
      });

      // Recalculate overall progress
      const totalCompleted = updatedHabits.reduce((acc, h) => acc + h.completedCount, 0);
      const totalPotential = (updatedHabits.filter(h => h.active).length || 1) * prev.daysInMonth;
      const overallProgress = Math.min(100, Math.round((totalCompleted / totalPotential) * 100));

      return {
        ...prev,
        habits: updatedHabits,
        overallProgress,
      };
    });

    // Confetti celebration & audio chime if completing a habit
    if (nextStatus === 'completed') {
      playSound('check', true);
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#10b981', '#6366f1', '#3b82f6', '#ec4899'],
        disableForReducedMotion: true,
      });
    } else {
      playSound('click', true);
    }

    try {
      await api.toggleCompletion({
        habitId,
        date,
        status: nextStatus,
      });
      if (isOffline) {
        setOfflineQueueCount(getOfflineQueue().length);
      }
    } catch (err) {
      console.error('Error toggling completion:', err);
      // Revert if error
      refreshDashboard();
    }
  };

  // Habit CRUD Actions
  const createHabit = async (habitData) => {
    const res = await api.createHabit(habitData);
    await refreshDashboard();
    return res.habit;
  };

  const updateHabit = async (id, habitData) => {
    const res = await api.updateHabit(id, habitData);
    await refreshDashboard();
    return res.habit;
  };

  const deleteHabit = async (id) => {
    await api.deleteHabit(id);
    await refreshDashboard();
  };

  const toggleArchiveHabit = async (id) => {
    await api.toggleArchive(id);
    await refreshDashboard();
  };

  // Reorder
  const reorderHabits = async (orderedIds) => {
    await api.reorderHabits(orderedIds);
    await refreshDashboard();
  };

  // Seed 3 Starter Habits for fresh new users
  const seedStarterHabits = async () => {
    setLoading(true);
    try {
      const starters = [
        {
          name: 'Drink 2.5L Water',
          category: 'Health',
          target: 8,
          unit: 'glasses',
          color: '#0284c7',
          frequency: 'daily',
          preferredTime: 'anytime',
        },
        {
          name: 'Read 20 Pages',
          category: 'Learning',
          target: 20,
          unit: 'pages',
          color: '#4f46e5',
          frequency: 'daily',
          preferredTime: 'evening',
        },
        {
          name: 'Morning Walk / Exercise',
          category: 'Mindfulness',
          target: 30,
          unit: 'mins',
          color: '#059669',
          frequency: 'daily',
          preferredTime: 'morning',
        },
      ];

      for (const h of starters) {
        await api.createHabit(h);
      }
      await loadData(false);
    } catch (err) {
      console.error('Failed to seed starter habits:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HabitContext.Provider value={{
      year,
      month,
      setYear,
      setMonth,
      setMonthAndYear,
      nextMonth,
      prevMonth,
      jumpToToday,
      jumpToDemoMonth,
      seedStarterHabits,
      dashboardData,
      lifetimeData,
      trendsData,
      insightsData,
      dailySummary,
      weeklySummary,
      loading,
      refreshing,
      refreshDashboard,
      toggleCell,
      createHabit,
      updateHabit,
      deleteHabit,
      toggleArchiveHabit,
      reorderHabits,
      isOffline,
      offlineQueueCount,
      activeFilter,
      setActiveFilter,
      searchQuery,
      setSearchQuery,
    }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
