import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api, syncOfflineActions, getOfflineQueue } from '../services/api';
import { playSound } from '../utils/soundEffects';

const HabitContext = createContext(null);

export const HabitProvider = ({ children }) => {
  // Restore active year & month from storage or real-time date
  const initialDate = api.getActiveDate();
  const now = new Date();
  const [year, setYearState] = useState(initialDate?.year || now.getFullYear());
  const [month, setMonthState] = useState(initialDate?.month || now.getMonth() + 1);

  const updateYearMonth = (newYear, newMonth) => {
    setYearState(newYear);
    setMonthState(newMonth);
    api.setActiveDate(newYear, newMonth);
  };

  const jumpToToday = () => {
    const today = new Date();
    updateYearMonth(today.getFullYear(), today.getMonth() + 1);
  };

  // Core Data States
  const [dashboardData, setDashboardData] = useState(() => {
    // Synchronous immediate bootstrap to prevent loading flashes
    try {
      const res = api.getDashboard(year, month);
      // If it's a promise (async), wait for loadData
      return null;
    } catch {
      return null;
    }
  });

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
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Track online/offline status
  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      await syncOfflineActions();
      setOfflineQueueCount(0);
      refreshDashboard();
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
    if (showLoading && !dashboardData) setLoading(true);
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
  }, [year, month]);

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const refreshDashboard = () => loadData(false);

  // Month navigation
  const nextMonth = () => {
    if (month === 12) {
      updateYearMonth(year + 1, 1);
    } else {
      updateYearMonth(year, month + 1);
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      updateYearMonth(year - 1, 12);
    } else {
      updateYearMonth(year, month - 1);
    }
  };

  const setMonthAndYear = (newYear, newMonth) => {
    updateYearMonth(newYear, newMonth);
  };

  // Cell Toggle: Completed (✓) -> Partial (◐) -> Missed (✕) -> Unmarked (○)
  const toggleCell = async (habitId, date, currentStatus) => {
    let nextStatus = 'completed';
    if (currentStatus === 'completed') nextStatus = 'partial';
    else if (currentStatus === 'partial') nextStatus = 'missed';
    else if (currentStatus === 'missed') nextStatus = 'unmarked';
    else nextStatus = 'completed';

    // 1. Immediately persist to localStorage
    await api.toggleCompletion({
      habitId,
      date,
      status: nextStatus,
    });

    // 2. Play Audio & Confetti celebration
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

    // 3. Immediately refresh metrics
    await refreshDashboard();
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

  const reorderHabits = async (orderedIds) => {
    await api.reorderHabits(orderedIds);
    await refreshDashboard();
  };

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
        {
          name: 'Deep Work Session',
          category: 'Productivity',
          target: 2,
          unit: 'hours',
          color: '#d97706',
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
    <HabitContext.Provider
      value={{
        year,
        month,
        setYear: (y) => updateYearMonth(y, month),
        setMonth: (m) => updateYearMonth(year, m),
        setMonthAndYear,
        nextMonth,
        prevMonth,
        jumpToToday,
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
      }}
    >
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

export default HabitContext;
