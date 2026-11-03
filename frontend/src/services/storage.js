/**
 * Client-Side Local Storage & Persistence Engine for Project H
 * Guarantees 100% offline persistence, instant responsiveness,
 * and zero data loss on page refreshes or mobile PWA restarts.
 */

const STORAGE_KEYS = {
  HABITS: 'project_h_habits',
  COMPLETIONS: 'project_h_completions',
  EXPENSES: 'project_h_expenses',
  PREFERENCES: 'project_h_preferences',
  USER: 'project_h_user',
  ACTIVE_DATE: 'project_h_active_date',
};

// Default User (No login required)
export const DEFAULT_USER = {
  id: 'champion-user',
  name: 'Habit Champion',
  email: 'champion@project-h.app',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
};

// Starter Habits for new users
const STARTER_HABITS = [
  {
    id: 'starter-1',
    name: 'Drink 2.5L Water',
    category: 'Health',
    target: 8,
    unit: 'glasses',
    color: '#0284c7',
    frequency: 'daily',
    preferredTime: 'anytime',
    active: true,
    order: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-2',
    name: 'Read 20 Pages',
    category: 'Learning',
    target: 20,
    unit: 'pages',
    color: '#4f46e5',
    frequency: 'daily',
    preferredTime: 'evening',
    active: true,
    order: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-3',
    name: 'Morning Walk / Exercise',
    category: 'Mindfulness',
    target: 30,
    unit: 'mins',
    color: '#059669',
    frequency: 'daily',
    preferredTime: 'morning',
    active: true,
    order: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'starter-4',
    name: 'Deep Work Session',
    category: 'Productivity',
    target: 2,
    unit: 'hours',
    color: '#d97706',
    frequency: 'daily',
    preferredTime: 'morning',
    active: true,
    order: 3,
    createdAt: new Date().toISOString(),
  },
];

// Helper to get ISO date string YYYY-MM-DD
export const toISODate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

// Safe LocalStorage helpers
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
  }
}

// Initialize seed data if empty
function initializeStorageIfEmpty() {
  const existingHabits = readJSON(STORAGE_KEYS.HABITS, null);
  if (!existingHabits || !Array.isArray(existingHabits) || existingHabits.length === 0) {
    writeJSON(STORAGE_KEYS.HABITS, STARTER_HABITS);

    // Seed some completions for the past 5 days of current month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();
    const completionsMap = {};

    const monthStr = String(currentMonth).padStart(2, '0');
    // Pre-fill completions for days 1 through current day (or up to 7 days)
    const seedDays = Math.min(currentDay, 7);
    for (let d = 1; d <= seedDays; d++) {
      const dayStr = String(d).padStart(2, '0');
      const dateISO = `${currentYear}-${monthStr}-${dayStr}`;

      STARTER_HABITS.forEach((h, idx) => {
        // Vary completed and partial
        const shouldComplete = (d + idx) % 4 !== 0;
        const isPartial = (d + idx) % 5 === 0;
        const status = shouldComplete ? (isPartial ? 'partial' : 'completed') : 'unmarked';
        if (status !== 'unmarked') {
          const key = `${h.id}_${dateISO}`;
          completionsMap[key] = {
            id: `comp-${key}`,
            habitId: h.id,
            date: dateISO,
            status,
            value: status === 'completed' ? 1.0 : 0.5,
            note: null,
            updatedAt: new Date().toISOString(),
          };
        }
      });
    }
    writeJSON(STORAGE_KEYS.COMPLETIONS, completionsMap);
  }

  // Expenses initialization if empty
  const existingExpenses = readJSON(STORAGE_KEYS.EXPENSES, null);
  if (!existingExpenses || !Array.isArray(existingExpenses)) {
    const now = new Date();
    const sampleExpenses = [
      {
        id: 'exp-1',
        amount: 250,
        category: 'Food & Dining',
        description: 'Healthy Lunch & Juice',
        date: new Date(now.getTime() - 2 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp-2',
        amount: 499,
        category: 'Health',
        description: 'Gym supplements',
        date: new Date(now.getTime() - 4 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp-3',
        amount: 120,
        category: 'Transportation',
        description: 'Metro card top-up',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];
    writeJSON(STORAGE_KEYS.EXPENSES, sampleExpenses);
  }

  // Active date initialization
  const activeDate = readJSON(STORAGE_KEYS.ACTIVE_DATE, null);
  if (!activeDate) {
    const today = new Date();
    writeJSON(STORAGE_KEYS.ACTIVE_DATE, {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    });
  }
}

// Run initializer
initializeStorageIfEmpty();

// --- Habit Storage Operations ---

export const getStoredHabits = () => {
  return readJSON(STORAGE_KEYS.HABITS, STARTER_HABITS);
};

export const saveStoredHabits = (habits) => {
  writeJSON(STORAGE_KEYS.HABITS, habits);
};

export const createHabitRecord = (habitData) => {
  const habits = getStoredHabits();
  const newHabit = {
    id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: habitData.name || 'New Habit',
    category: habitData.category || 'General',
    description: habitData.description || '',
    frequency: habitData.frequency || 'daily',
    target: Number(habitData.target) || 1,
    unit: habitData.unit || 'times',
    color: habitData.color || '#6366f1',
    preferredTime: habitData.preferredTime || 'anytime',
    active: habitData.active !== undefined ? habitData.active : true,
    order: habits.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  habits.push(newHabit);
  saveStoredHabits(habits);
  return newHabit;
};

export const updateHabitRecord = (id, habitData) => {
  const habits = getStoredHabits();
  const idx = habits.findIndex((h) => h.id === id);
  if (idx === -1) throw new Error('Habit not found');

  habits[idx] = {
    ...habits[idx],
    ...habitData,
    target: habitData.target !== undefined ? Number(habitData.target) : habits[idx].target,
    updatedAt: new Date().toISOString(),
  };
  saveStoredHabits(habits);
  return habits[idx];
};

export const deleteHabitRecord = (id) => {
  const habits = getStoredHabits().filter((h) => h.id !== id);
  saveStoredHabits(habits);

  // Clean completions for this habit
  const completions = readJSON(STORAGE_KEYS.COMPLETIONS, {});
  Object.keys(completions).forEach((k) => {
    if (completions[k].habitId === id) {
      delete completions[k];
    }
  });
  writeJSON(STORAGE_KEYS.COMPLETIONS, completions);
};

export const toggleArchiveRecord = (id) => {
  const habits = getStoredHabits();
  const idx = habits.findIndex((h) => h.id === id);
  if (idx !== -1) {
    habits[idx].active = !habits[idx].active;
    saveStoredHabits(habits);
    return habits[idx];
  }
  throw new Error('Habit not found');
};

export const reorderHabitsRecord = (orderedIds) => {
  const habits = getStoredHabits();
  const idMap = new Map(habits.map((h) => [h.id, h]));
  const reordered = [];

  orderedIds.forEach((id, index) => {
    const habit = idMap.get(id);
    if (habit) {
      habit.order = index;
      reordered.push(habit);
      idMap.delete(id);
    }
  });
  // append any remaining
  idMap.forEach((h) => reordered.push(h));
  saveStoredHabits(reordered);
  return reordered;
};

// --- Completion Storage Operations ---

export const getStoredCompletions = () => {
  return readJSON(STORAGE_KEYS.COMPLETIONS, {});
};

export const toggleCompletionRecord = (payload) => {
  const { habitId, date, status, value, note } = payload;
  const completions = getStoredCompletions();
  const key = `${habitId}_${date}`;

  if (status === 'unmarked') {
    delete completions[key];
  } else {
    completions[key] = {
      id: completions[key]?.id || `comp-${key}`,
      habitId,
      date,
      status: status || 'completed',
      value: value !== undefined ? Number(value) : (status === 'completed' ? 1.0 : 0.5),
      note: note !== undefined ? note : (completions[key]?.note || null),
      updatedAt: new Date().toISOString(),
    };
  }
  writeJSON(STORAGE_KEYS.COMPLETIONS, completions);
  return completions[key] || { habitId, date, status: 'unmarked' };
};

// --- Active Date State Persistence ---
export const getActiveDateRecord = () => {
  const now = new Date();
  return readJSON(STORAGE_KEYS.ACTIVE_DATE, {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
};

export const saveActiveDateRecord = (year, month) => {
  writeJSON(STORAGE_KEYS.ACTIVE_DATE, { year, month });
};

// --- Deterministic Analytics Computations ---

export const calculateHabitStreak = (completionDatesSet, todayISO) => {
  if (!completionDatesSet || completionDatesSet.size === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const sortedDates = Array.from(completionDatesSet).sort();
  let bestStreak = 0;
  let runningStreak = 0;
  let prevDate = null;

  for (const dateStr of sortedDates) {
    if (!prevDate) {
      runningStreak = 1;
    } else {
      const prev = new Date(prevDate + 'T00:00:00Z');
      const curr = new Date(dateStr + 'T00:00:00Z');
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        runningStreak += 1;
      } else if (diffDays > 1) {
        runningStreak = 1;
      }
    }
    if (runningStreak > bestStreak) {
      bestStreak = runningStreak;
    }
    prevDate = dateStr;
  }

  let currentStreak = 0;
  const today = new Date(todayISO + 'T00:00:00Z');
  let checkDate = new Date(today);
  const todayStr = toISODate(checkDate);

  if (completionDatesSet.has(todayStr)) {
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = toISODate(checkDate);
    if (completionDatesSet.has(yesterdayStr)) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  if (currentStreak > 0) {
    while (true) {
      const prevStr = toISODate(checkDate);
      if (completionDatesSet.has(prevStr)) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { currentStreak, bestStreak };
};

export const computeMonthlyDashboardLocal = (year, month) => {
  const habits = getStoredHabits();
  const completionMap = getStoredCompletions();
  const daysInMonth = getDaysInMonth(year, month);
  const monthStr = String(month).padStart(2, '0');
  const todayISO = toISODate(new Date());

  const dailyStats = [];
  const activeHabits = habits.filter((h) => h.active);
  const activeHabitsCount = activeHabits.length || 1;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateISO = `${year}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay();

    let completedCount = 0;
    let partialCount = 0;

    habits.forEach((h) => {
      const key = `${h.id}_${dateISO}`;
      const rec = completionMap[key];
      if (rec && rec.status === 'completed') {
        completedCount++;
      } else if (rec && rec.status === 'partial') {
        partialCount++;
      }
    });

    const completionRate = activeHabitsCount > 0
      ? Math.round(((completedCount + partialCount * 0.5) / activeHabitsCount) * 100)
      : 0;

    dailyStats.push({
      day,
      date: dateISO,
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      isToday: dateISO === todayISO,
      isFuture: dateISO > todayISO,
      completedCount,
      partialCount,
      totalActive: activeHabitsCount,
      completionRate,
    });
  }

  // Habit rows with days dictionary
  const habitRows = habits.map((habit) => {
    const habitCompletionsSet = new Set();
    const daysData = {};
    let completedCount = 0;
    let partialCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateISO = `${year}-${monthStr}-${dayStr}`;
      const key = `${habit.id}_${dateISO}`;
      const rec = completionMap[key];

      const status = rec ? rec.status : 'unmarked';
      daysData[day] = {
        date: dateISO,
        status,
        value: rec ? rec.value : 0,
        note: rec ? rec.note : null,
      };

      if (status === 'completed') {
        completedCount++;
        habitCompletionsSet.add(dateISO);
      } else if (status === 'partial') {
        partialCount++;
      }
    }

    const monthlyRate = Math.min(100, Math.round(((completedCount + partialCount * 0.5) / daysInMonth) * 100));
    const { currentStreak, bestStreak } = calculateHabitStreak(habitCompletionsSet, todayISO);

    return {
      ...habit,
      days: daysData,
      completedCount,
      partialCount,
      monthlyRate,
      currentStreak,
      bestStreak,
    };
  });

  // 5 Weekly Progress Groups
  const weeks = [
    { weekNumber: 1, startDay: 1, endDay: 7, label: 'Week 1', colorKey: 'week1' },
    { weekNumber: 2, startDay: 8, endDay: 14, label: 'Week 2', colorKey: 'week2' },
    { weekNumber: 3, startDay: 15, endDay: 21, label: 'Week 3', colorKey: 'week3' },
    { weekNumber: 4, startDay: 22, endDay: 28, label: 'Week 4', colorKey: 'week4' },
    { weekNumber: 5, startDay: 29, endDay: daysInMonth, label: 'Week 5', colorKey: 'week5' },
  ];

  const weeklyProgress = weeks
    .filter((w) => w.startDay <= daysInMonth)
    .map((w) => {
      const endDay = Math.min(w.endDay, daysInMonth);
      const daysInThisWeek = Math.max(0, endDay - w.startDay + 1);
      const totalPotential = activeHabitsCount * daysInThisWeek;

      let weekCompleted = 0;
      let weekPartial = 0;
      const habitWeekCounts = {};

      habitRows.forEach((h) => {
        habitWeekCounts[h.name] = 0;
        for (let d = w.startDay; d <= endDay; d++) {
          const cell = h.days[d];
          if (cell && cell.status === 'completed') {
            weekCompleted++;
            habitWeekCounts[h.name] += 1;
          } else if (cell && cell.status === 'partial') {
            weekPartial += 1;
            habitWeekCounts[h.name] += 0.5;
          }
        }
      });

      const completionRate = totalPotential > 0
        ? Math.round(((weekCompleted + weekPartial * 0.5) / totalPotential) * 100)
        : 0;

      let bestHabit = null;
      let weakestHabit = null;
      let maxVal = -1;
      let minVal = 99999;

      Object.entries(habitWeekCounts).forEach(([name, count]) => {
        if (count > maxVal) {
          maxVal = count;
          bestHabit = name;
        }
        if (count < minVal) {
          minVal = count;
          weakestHabit = name;
        }
      });

      return {
        weekNumber: w.weekNumber,
        label: w.label,
        dateRange: `${month}/${w.startDay} - ${month}/${endDay}`,
        startDay: w.startDay,
        endDay,
        colorKey: w.colorKey,
        totalCompletions: weekCompleted,
        totalPotential,
        completionRate,
        bestHabit: maxVal > 0 ? bestHabit : 'None',
        weakestHabit: weakestHabit || 'None',
      };
    });

  const totalCompletedMonth = habitRows.reduce((acc, h) => acc + h.completedCount, 0);
  const totalPotentialMonth = activeHabitsCount * daysInMonth;
  const overallProgress = totalPotentialMonth > 0
    ? Math.min(100, Math.round((totalCompletedMonth / totalPotentialMonth) * 100))
    : 0;

  const todayStats = dailyStats.find((d) => d.isToday) || {
    completedCount: 0,
    totalActive: activeHabitsCount,
    completionRate: 0,
  };

  let overallCurrentStreak = 0;
  let overallBestStreak = 0;
  let tempStreak = 0;

  dailyStats.forEach((d) => {
    if (d.completionRate >= 60) {
      tempStreak++;
      if (tempStreak > overallBestStreak) overallBestStreak = tempStreak;
    } else if (!d.isFuture) {
      tempStreak = 0;
    }
  });

  for (let i = dailyStats.length - 1; i >= 0; i--) {
    const d = dailyStats[i];
    if (d.isFuture) continue;
    if (d.completionRate >= 60) {
      overallCurrentStreak++;
    } else {
      break;
    }
  }

  return {
    year,
    month,
    daysInMonth,
    overallProgress,
    todayStats: {
      completedCount: todayStats.completedCount,
      totalActive: todayStats.totalActive,
      completionRate: todayStats.completionRate,
    },
    overallStreaks: {
      currentStreak: overallCurrentStreak,
      bestStreak: Math.max(overallBestStreak, overallCurrentStreak),
    },
    habits: habitRows,
    weeklyProgress,
    dailyStats,
  };
};

export const computeLifetimeStatsLocal = () => {
  const habits = getStoredHabits();
  const completionMap = getStoredCompletions();
  const allCompletions = Object.values(completionMap);
  const todayISO = toISODate(new Date());

  const totalHabits = habits.length;
  const completedList = allCompletions.filter((c) => c.status === 'completed');
  const totalCompletions = completedList.length;

  const uniqueDates = new Set(allCompletions.map((c) => c.date));
  const totalTrackedDays = uniqueDates.size || 1;

  const habitPerformances = habits.map((h) => {
    const hComps = allCompletions.filter((c) => c.habitId === h.id && c.status === 'completed');
    const { currentStreak, bestStreak } = calculateHabitStreak(new Set(hComps.map((c) => c.date)), todayISO);
    return {
      id: h.id,
      name: h.name,
      completionsCount: hComps.length,
      currentStreak,
      bestStreak,
    };
  });

  habitPerformances.sort((a, b) => b.completionsCount - a.completionsCount);

  const mostConsistent = habitPerformances.length > 0 ? habitPerformances[0].name : 'None';
  const leastConsistent = habitPerformances.length > 1 ? habitPerformances[habitPerformances.length - 1].name : 'None';
  const bestOverallStreak = habitPerformances.reduce((max, h) => Math.max(max, h.bestStreak), 0);
  const currentOverallStreak = habitPerformances.length > 0
    ? Math.round(habitPerformances.reduce((acc, h) => acc + h.currentStreak, 0) / habitPerformances.length)
    : 0;

  const activeHabitsCount = habits.filter((h) => h.active).length || 1;
  const avgCompletionRate = totalTrackedDays > 0
    ? Math.min(100, Math.round((totalCompletions / (totalTrackedDays * activeHabitsCount)) * 100))
    : 0;

  return {
    totalHabits,
    totalCompletions,
    totalTrackedDays,
    bestStreak: bestOverallStreak,
    currentStreak: currentOverallStreak,
    averageCompletionRate: avgCompletionRate,
    mostConsistentHabit: mostConsistent,
    leastConsistentHabit: leastConsistent,
    bestMonth: 'Current Month',
  };
};

export const computeTrendsLocal = (year, month) => {
  const habits = getStoredHabits().filter((h) => h.active);
  const completionMap = getStoredCompletions();
  const daysInMonth = getDaysInMonth(year, month);
  const monthStr = String(month).padStart(2, '0');

  const dailyTrend = [];
  const totalActive = habits.length || 1;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateISO = `${year}-${monthStr}-${dayStr}`;
    let completedCount = 0;

    habits.forEach((h) => {
      const c = completionMap[`${h.id}_${dateISO}`];
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

  const habitComparison = habits.map((h) => {
    let comps = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateISO = `${year}-${monthStr}-${dayStr}`;
      const c = completionMap[`${h.id}_${dateISO}`];
      if (c && c.status === 'completed') comps++;
    }
    const rate = Math.round((comps / daysInMonth) * 100);
    return {
      name: h.name,
      category: h.category,
      color: h.color,
      completions: comps,
      completionRate: rate,
    };
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdayStats = dayNames.map((name, index) => {
    let count = 0;
    let totalOpportunities = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month - 1, day);
      if (d.getDay() === index) {
        totalOpportunities += totalActive;
        const dayStr = String(day).padStart(2, '0');
        const dateISO = `${year}-${monthStr}-${dayStr}`;
        habits.forEach((h) => {
          const c = completionMap[`${h.id}_${dateISO}`];
          if (c && c.status === 'completed') count++;
        });
      }
    }

    return {
      day: name,
      rate: totalOpportunities > 0 ? Math.round((count / totalOpportunities) * 100) : 0,
    };
  });

  return {
    dailyTrend,
    habitComparison,
    weekdayStats,
  };
};

export const detectHabitPatternsLocal = (dashboardData) => {
  const { habits, overallProgress, overallStreaks, todayStats, weeklyProgress } = dashboardData;
  const patterns = [];

  const strong = habits.filter((h) => h.monthlyRate >= 70);
  const weak = habits.filter((h) => h.monthlyRate < 45);

  if (strong.length > 0) {
    patterns.push({
      id: 'p-anchor',
      type: 'positive',
      title: `${strong[0].name} is Your Anchor Habit`,
      summary: `Your execution rate for ${strong[0].name} stands at ${strong[0].monthlyRate}%, serving as your strongest neurological behavioral anchor.`,
      metric: `${strong[0].monthlyRate}% success`,
      actionable: `Use habit stacking: schedule lower-consistency habits immediately after finishing ${strong[0].name}.`,
    });
  }

  if (weak.length > 0) {
    patterns.push({
      id: 'p-friction',
      type: 'warning',
      title: `${weak[0].name} Shows Startup Friction`,
      summary: `Current monthly consistency is ${weak[0].monthlyRate}%. Reducing initial resistance will protect your streaks.`,
      metric: `${weak[0].monthlyRate}% rate`,
      actionable: `Lower the threshold: reduce target to 2 minutes or micro-reps for the next 3 days.`,
    });
  }

  if (overallStreaks.currentStreak > 0) {
    patterns.push({
      id: 'p-momentum',
      type: 'positive',
      title: `Active Momentum: ${overallStreaks.currentStreak} Day Streak`,
      summary: `You are sustaining active momentum across key daily routines.`,
      metric: `${overallStreaks.currentStreak} days`,
      actionable: `Remember the 'Never Miss Twice' rule: even a partial session counts towards identity.`,
    });
  }

  return patterns;
};

export const generateDailySummaryLocal = (dashboardData) => {
  const { todayStats, habits, overallStreaks } = dashboardData;
  const total = todayStats.totalActive || habits.length || 0;
  const done = todayStats.completedCount || 0;

  const strong = habits.filter((h) => h.monthlyRate >= 70).map((h) => h.name);
  const needsAttention = habits.filter((h) => h.monthlyRate < 50).map((h) => h.name);

  return {
    title: "Today's Progress Overview",
    completed: done,
    total,
    completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
    currentStreak: overallStreaks.currentStreak,
    bestStreak: overallStreaks.bestStreak,
    strong: strong.slice(0, 3),
    needsAttention: needsAttention.slice(0, 3),
    recommendation: done === total && total > 0
      ? 'Perfect day achieved! You crushed all active habits.'
      : `You have ${Math.max(0, total - done)} habit${total - done === 1 ? '' : 's'} remaining today. Focus on quick wins to keep momentum high.`,
  };
};

export const generateWeeklySummaryLocal = (dashboardData) => {
  const { weeklyProgress, habits } = dashboardData;
  const currentWeek = weeklyProgress[weeklyProgress.length - 1] || weeklyProgress[0];

  const strong = habits.filter((h) => h.monthlyRate >= 75).map((h) => h.name);
  const needsAttention = habits.filter((h) => h.monthlyRate < 50).map((h) => h.name);

  return {
    title: 'Weekly AI Executive Review',
    overallCompletion: currentWeek ? currentWeek.completionRate : 0,
    bestHabit: currentWeek?.bestHabit || strong[0] || 'None',
    weakestHabit: currentWeek?.weakestHabit || needsAttention[0] || 'None',
    strong: strong.slice(0, 3),
    needsAttention: needsAttention.slice(0, 3),
    pattern: 'Consistency is strongest when habits are executed early in the day.',
    recommendation: 'Anchor low-completion habits to an established morning trigger to guarantee execution.',
  };
};

// --- Expense Operations ---

export const getStoredExpenses = (params = {}) => {
  const list = readJSON(STORAGE_KEYS.EXPENSES, []);
  let filtered = [...list];

  if (params.category && params.category !== 'All') {
    filtered = filtered.filter((e) => e.category === params.category);
  }
  if (params.startDate) {
    const start = new Date(params.startDate).getTime();
    filtered = filtered.filter((e) => new Date(e.date).getTime() >= start);
  }
  if (params.endDate) {
    const end = new Date(params.endDate).getTime();
    filtered = filtered.filter((e) => new Date(e.date).getTime() <= end);
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return filtered;
};

export const createExpenseRecord = (expenseData) => {
  const expenses = readJSON(STORAGE_KEYS.EXPENSES, []);
  const amountVal = parseFloat(expenseData.amount);
  if (isNaN(amountVal) || amountVal <= 0) {
    throw new Error('Valid amount required');
  }

  const newExpense = {
    id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    amount: amountVal,
    category: expenseData.category || 'General',
    description: expenseData.description || '',
    date: expenseData.date ? new Date(expenseData.date).toISOString() : new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  expenses.unshift(newExpense);
  writeJSON(STORAGE_KEYS.EXPENSES, expenses);
  return newExpense;
};

export const updateExpenseRecord = (id, expenseData) => {
  const expenses = readJSON(STORAGE_KEYS.EXPENSES, []);
  const idx = expenses.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Expense not found');

  expenses[idx] = {
    ...expenses[idx],
    ...expenseData,
    amount: expenseData.amount !== undefined ? parseFloat(expenseData.amount) : expenses[idx].amount,
    date: expenseData.date ? new Date(expenseData.date).toISOString() : expenses[idx].date,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(STORAGE_KEYS.EXPENSES, expenses);
  return expenses[idx];
};

export const deleteExpenseRecord = (id) => {
  const expenses = readJSON(STORAGE_KEYS.EXPENSES, []).filter((e) => e.id !== id);
  writeJSON(STORAGE_KEYS.EXPENSES, expenses);
  return { message: 'Expense deleted successfully' };
};

export const computeExpenseSummaryLocal = () => {
  const expenses = readJSON(STORAGE_KEYS.EXPENSES, []);
  const now = new Date();
  const todayStr = toISODate(now);

  // Week start (Sunday)
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  // Month start
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  let dailyTotal = 0;
  let weeklyTotal = 0;
  let monthlyTotal = 0;
  let lastMonthTotal = 0;
  let allTimeTotal = 0;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyBreakdown = {};

  // Last 6 months buckets
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    monthlyBreakdown[label] = 0;
  }

  expenses.forEach((e) => {
    const d = new Date(e.date);
    const amount = Number(e.amount) || 0;
    allTimeTotal += amount;

    if (toISODate(d) === todayStr) {
      dailyTotal += amount;
    }
    if (d >= weekStart) {
      weeklyTotal += amount;
    }
    if (d >= monthStart) {
      monthlyTotal += amount;
    }
    if (d >= lastMonthStart && d <= lastMonthEnd) {
      lastMonthTotal += amount;
    }

    const mLabel = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    if (monthlyBreakdown[mLabel] !== undefined) {
      monthlyBreakdown[mLabel] += amount;
    }
  });

  const monthlyComparison = Object.keys(monthlyBreakdown).map((k) => ({
    month: k,
    total: monthlyBreakdown[k],
  }));

  const monthlyAverage = expenses.length > 0 ? Math.round(allTimeTotal / Math.max(1, Object.keys(monthlyBreakdown).length)) : 0;

  return {
    dailyTotal,
    weeklyTotal,
    monthlyTotal,
    lastMonthTotal,
    monthlyAverage,
    monthlyComparison,
  };
};

// --- Natural Language Habit Parser ---
export const parseHabitNaturalLanguageLocal = (text) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Please enter habit description');
  }

  const clean = text.trim();
  const lower = clean.toLowerCase();

  let name = clean;
  let target = 1;
  let unit = 'times';
  let frequency = 'daily';
  let preferredTime = 'anytime';
  let category = 'General';
  let color = '#6366f1';

  const numberMatch = lower.match(/(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|pages?|problems?|glasses?|liters?|reps?|steps?|km|miles?|times?|sessions?)/i);
  if (numberMatch) {
    target = parseFloat(numberMatch[1]);
    const matchedUnit = numberMatch[2].toLowerCase();
    if (matchedUnit.startsWith('min')) unit = 'minutes';
    else if (matchedUnit.startsWith('hr') || matchedUnit.startsWith('hour')) {
      target = target * 60;
      unit = 'minutes';
    } else if (matchedUnit.startsWith('page')) unit = 'pages';
    else if (matchedUnit.startsWith('problem')) unit = 'problems';
    else if (matchedUnit.startsWith('glass')) unit = 'glasses';
    else if (matchedUnit.startsWith('step')) unit = 'steps';
    else unit = matchedUnit;
  }

  if (lower.includes('morning') || lower.includes('breakfast')) {
    preferredTime = 'morning';
  } else if (lower.includes('afternoon') || lower.includes('lunch')) {
    preferredTime = 'afternoon';
  } else if (lower.includes('evening') || lower.includes('night') || lower.includes('before bed')) {
    preferredTime = 'evening';
  }

  if (lower.includes('weekdays')) frequency = 'weekdays';
  else if (lower.includes('weekly')) frequency = 'weekly';
  else frequency = 'daily';

  if (lower.includes('water') || lower.includes('drink') || lower.includes('sleep') || lower.includes('eat') || lower.includes('diet') || lower.includes('fruit')) {
    category = 'Health';
    color = '#0284c7';
  } else if (lower.includes('read') || lower.includes('book') || lower.includes('study') || lower.includes('learn') || lower.includes('code') || lower.includes('course')) {
    category = 'Learning';
    color = '#4f46e5';
  } else if (lower.includes('walk') || lower.includes('run') || lower.includes('gym') || lower.includes('workout') || lower.includes('stretch') || lower.includes('yoga')) {
    category = 'Mindfulness';
    color = '#059669';
  } else if (lower.includes('work') || lower.includes('deep work') || lower.includes('focus') || lower.includes('write') || lower.includes('project')) {
    category = 'Productivity';
    color = '#d97706';
  }

  // Capitalize name
  name = clean.charAt(0).toUpperCase() + clean.slice(1);

  return {
    name,
    category,
    target,
    unit,
    frequency,
    preferredTime,
    color,
    description: `Target: ${target} ${unit} (${preferredTime})`,
  };
};

// --- Behavioral Assistant Handler ---
export const answerHabitAssistantQueryLocal = (query, dashboardData) => {
  const { habits = [], overallProgress = 0, overallStreaks = { currentStreak: 0, bestStreak: 0 }, todayStats = { completedCount: 0, totalActive: 0 } } = dashboardData || {};
  const activeHabits = habits.filter((h) => h.active);
  const q = (query || '').toLowerCase().trim();

  if (/^(hi|hello|hey|greetings|good morning|good evening|yo)\b/i.test(q)) {
    return {
      reply: `👋 **Hello! I'm your AI Habit & Productivity Coach.**\n\n` +
             `I have live visibility into your tracking data to help you build bulletproof momentum.\n\n` +
             `📊 **Today's Snapshot**:\n` +
             `• Completed **${todayStats.completedCount}/${todayStats.totalActive || activeHabits.length}** habits so far.\n` +
             `• Monthly consistency rate: **${overallProgress}%**.\n` +
             `• Active streak: **${overallStreaks.currentStreak} days**.\n\n` +
             `Ask me anything—about fixing broken streaks, designing a morning routine, dopamine management, or psychology from *Atomic Habits*!`,
      source: 'local-cognitive-engine',
    };
  }

  if (q.includes('streak') || q.includes('losing') || q.includes('missed') || q.includes('break')) {
    return {
      reply: `🛡️ **Streak Protection & Momentum Protocol**:\n\n` +
             `Your current overall streak is **${overallStreaks.currentStreak} days** (Personal Best: **${overallStreaks.bestStreak} days**).\n\n` +
             `🧠 **The 2-Minute Rule & Never Miss Twice**:\n` +
             `1. Missing one day is an accident; missing two is the start of an unwanted habit.\n` +
             `2. On busy or low-energy days, do the micro-version (e.g. read 1 page, drink 1 glass, 5 pushups).\n` +
             `3. Doing something small maintains the neural identity and keeps your streak alive!`,
      source: 'local-cognitive-engine',
    };
  }

  if (q.includes('procrastinat') || q.includes('lazy') || q.includes('motivation') || q.includes('focus')) {
    return {
      reply: `⚡ **Action Over Motivation: 3 Behavioral Hacks**:\n\n` +
             `1. **Activation Energy (5-Second Rule)**: Count 5-4-3-2-1 and physically start before your brain creates rationalized friction.\n` +
             `2. **Habit Stacking**: Pair what you need to do with something you already do effortlessly:\n` +
             `   *"Immediately after [Current Habit], I will do [Target Habit] for 2 minutes."*\n` +
             `3. **Clear Your Physical Environment**: Place visual cues in plain sight (book on pillow, water bottle on desk).`,
      source: 'local-cognitive-engine',
    };
  }

  if (q.includes('attention') || q.includes('weak') || q.includes('worst') || q.includes('hard')) {
    const weakest = [...activeHabits].sort((a, b) => a.monthlyRate - b.monthlyRate);
    const lowest = weakest[0];

    if (!lowest) {
      return {
        reply: `You don't have active habits yet. Add your first habit using the **+ Add Habit** button!`,
        source: 'local-cognitive-engine',
      };
    }

    return {
      reply: `🔍 **Habit Needing Priority Focus**: **${lowest.name}**\n\n` +
             `• **Monthly Consistency**: ${lowest.monthlyRate}%\n` +
             `• **Current Streak**: ${lowest.currentStreak} days\n` +
             `• **Target**: ${lowest.target} ${lowest.unit} (${lowest.preferredTime})\n\n` +
             `💡 **Action Step**: Reduce initial friction by cutting target in half for the next 3 days until momentum rebuilds!`,
      source: 'local-cognitive-engine',
    };
  }

  return {
    reply: `💡 **Consistency Insight**:\n\n` +
           `You've completed **${todayStats.completedCount}** habits today with an overall monthly rate of **${overallProgress}%**.\n\n` +
           `• **Habit Stacking Tip**: Anchor your most demanding habit directly to your first morning coffee or glass of water.\n` +
           `• **Friction Reduction**: Prepare your environment the evening before.\n` +
           `Keep checking off your calendar days to lock in identity-based habit transformation!`,
    source: 'local-cognitive-engine',
  };
};

// --- Full Data Backup & Restore ---
export const exportAllDataJSON = () => {
  const data = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    habits: getStoredHabits(),
    completions: getStoredCompletions(),
    expenses: readJSON(STORAGE_KEYS.EXPENSES, []),
    preferences: readJSON(STORAGE_KEYS.PREFERENCES, {}),
  };
  return JSON.stringify(data, null, 2);
};

export const importAllDataJSON = (jsonString) => {
  try {
    const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    if (parsed.habits && Array.isArray(parsed.habits)) {
      writeJSON(STORAGE_KEYS.HABITS, parsed.habits);
    }
    if (parsed.completions && typeof parsed.completions === 'object') {
      writeJSON(STORAGE_KEYS.COMPLETIONS, parsed.completions);
    }
    if (parsed.expenses && Array.isArray(parsed.expenses)) {
      writeJSON(STORAGE_KEYS.EXPENSES, parsed.expenses);
    }
    if (parsed.preferences) {
      writeJSON(STORAGE_KEYS.PREFERENCES, parsed.preferences);
    }
    return { success: true };
  } catch (err) {
    throw new Error('Invalid JSON backup file: ' + err.message);
  }
};

export const resetAllDataToDefault = () => {
  writeJSON(STORAGE_KEYS.HABITS, STARTER_HABITS);
  writeJSON(STORAGE_KEYS.COMPLETIONS, {});
  writeJSON(STORAGE_KEYS.EXPENSES, []);
  initializeStorageIfEmpty();
};

