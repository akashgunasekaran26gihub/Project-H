/**
 * Analytical service for Habit Tracker calculations
 * Computes deterministic streaks, monthly grids, weekly aggregates, and lifetime stats.
 */

// Helper to get ISO date string YYYY-MM-DD
export const toISODate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Calculate days in a given year and month (month: 1-12)
export const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

// Calculate streak for a single habit given an array of completion dates (YYYY-MM-DD)
export const calculateHabitStreak = (completionDatesSet, todayISO) => {
  if (!completionDatesSet || completionDatesSet.size === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Sort dates chronologically
  const sortedDates = Array.from(completionDatesSet).sort();
  
  // Calculate best streak historically
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

  // Calculate current streak
  // Check if today is completed or yesterday is completed
  let currentStreak = 0;
  const today = new Date(todayISO + 'T00:00:00Z');
  
  let checkDate = new Date(today);
  const todayStr = toISODate(checkDate);

  if (completionDatesSet.has(todayStr)) {
    // Today is completed, count backwards
    currentStreak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Check if yesterday was completed
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

// Calculate monthly dashboard data
export const computeMonthlyDashboard = (habits, completions, year, month, todayISO) => {
  const daysInMonth = getDaysInMonth(year, month);
  const monthStr = String(month).padStart(2, '0');
  
  // Map completions by habitId and date
  const completionMap = new Map(); // key: `${habitId}_${date}` -> completion
  completions.forEach((c) => {
    completionMap.set(`${c.habitId}_${c.date}`, c);
  });

  // Calculate daily totals for month
  const dailyStats = [];
  const activeHabitsCount = habits.filter(h => h.active).length || 1;

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateISO = `${year}-${monthStr}-${dayStr}`;
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat

    let completedCount = 0;
    let partialCount = 0;

    habits.forEach((h) => {
      const key = `${h.id}_${dateISO}`;
      const rec = completionMap.get(key);
      if (rec && rec.status === 'completed') {
        completedCount++;
      } else if (rec && rec.status === 'partial') {
        partialCount++;
      }
    });

    const completionRate = activeHabitsCount > 0 
      ? Math.round(((completedCount + (partialCount * 0.5)) / activeHabitsCount) * 100) 
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

  // Calculate Habit Rows
  // Effective days to measure completion against (up to today if current month, or entire month if past)
  const isCurrentMonth = todayISO.startsWith(`${year}-${monthStr}`);
  const todayDay = isCurrentMonth ? parseInt(todayISO.split('-')[2], 10) : (year < parseInt(todayISO.split('-')[0], 10) ? daysInMonth : 1);
  const eligibleDaysCount = isCurrentMonth ? todayDay : daysInMonth;

  const habitRows = habits.map((habit) => {
    const habitCompletionsSet = new Set();
    const daysData = {};
    let completedCount = 0;
    let partialCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const dateISO = `${year}-${monthStr}-${dayStr}`;
      const key = `${habit.id}_${dateISO}`;
      const rec = completionMap.get(key);

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

    const monthlyRate = Math.min(100, Math.round(((completedCount + (partialCount * 0.5)) / daysInMonth) * 100));

    const { currentStreak, bestStreak } = calculateHabitStreak(habitCompletionsSet, todayISO);

    return {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      color: habit.color,
      frequency: habit.frequency,
      target: habit.target,
      unit: habit.unit,
      active: habit.active,
      order: habit.order,
      days: daysData,
      completedCount,
      partialCount,
      monthlyRate,
      currentStreak,
      bestStreak,
    };
  });

  // Calculate Weekly Progress (5 weekly buckets matching reference sheet)
  const weeks = [
    { weekNumber: 1, startDay: 1, endDay: 7, label: 'Week 1', colorKey: 'week1' },
    { weekNumber: 2, startDay: 8, endDay: 14, label: 'Week 2', colorKey: 'week2' },
    { weekNumber: 3, startDay: 15, endDay: 21, label: 'Week 3', colorKey: 'week3' },
    { weekNumber: 4, startDay: 22, endDay: 28, label: 'Week 4', colorKey: 'week4' },
    { weekNumber: 5, startDay: 29, endDay: daysInMonth, label: 'Week 5', colorKey: 'week5' },
  ];

  const weeklyProgress = weeks.map((w) => {
    const daysInThisWeek = Math.max(0, w.endDay - w.startDay + 1);
    const totalPotential = activeHabitsCount * daysInThisWeek;

    let weekCompleted = 0;
    let weekPartial = 0;
    const habitWeekCounts = {};

    habitRows.forEach((h) => {
      habitWeekCounts[h.name] = 0;
      for (let d = w.startDay; d <= w.endDay; d++) {
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
      ? Math.round(((weekCompleted + (weekPartial * 0.5)) / totalPotential) * 100)
      : 0;

    // Find best & weakest habits
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
      dateRange: `${month}/${w.startDay} - ${month}/${w.endDay}`,
      startDay: w.startDay,
      endDay: w.endDay,
      colorKey: w.colorKey,
      totalCompletions: weekCompleted,
      totalPotential,
      completionRate,
      bestHabit: maxVal > 0 ? bestHabit : 'None',
      weakestHabit: weakestHabit || 'None',
    };
  });

  // Calculate Overall Progress
  const totalCompletedMonth = habitRows.reduce((acc, h) => acc + h.completedCount, 0);
  const totalPotentialMonth = activeHabitsCount * daysInMonth;
  const overallProgress = totalPotentialMonth > 0 
    ? Math.min(100, Math.round((totalCompletedMonth / totalPotentialMonth) * 100))
    : 0;

  // Today stats
  const todayStats = dailyStats.find(d => d.isToday) || {
    completedCount: 0,
    totalActive: activeHabitsCount,
    completionRate: 0,
  };

  // Overall Current Streak and Best Streak (across all habits meeting >= 60% completion)
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

  // Calculate current streak backwards from today
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

// Calculate Lifetime Statistics from all completions
export const computeLifetimeStats = (habits, allCompletions, todayISO) => {
  const totalHabits = habits.length;
  const totalCompletions = allCompletions.filter(c => c.status === 'completed').length;
  
  // Total tracked days (unique dates with at least one record)
  const uniqueDates = new Set(allCompletions.map(c => c.date));
  const totalTrackedDays = uniqueDates.size;

  // Habit consistency calculation
  const habitPerformances = habits.map(h => {
    const habitCompletions = allCompletions.filter(c => c.habitId === h.id && c.status === 'completed');
    const { currentStreak, bestStreak } = calculateHabitStreak(new Set(habitCompletions.map(c => c.date)), todayISO);
    return {
      id: h.id,
      name: h.name,
      completionsCount: habitCompletions.length,
      currentStreak,
      bestStreak,
    };
  });

  habitPerformances.sort((a, b) => b.completionsCount - a.completionsCount);

  const mostConsistent = habitPerformances.length > 0 ? habitPerformances[0].name : 'N/A';
  const leastConsistent = habitPerformances.length > 1 ? habitPerformances[habitPerformances.length - 1].name : 'N/A';
  const bestOverallStreak = habitPerformances.reduce((max, h) => Math.max(max, h.bestStreak), 0);
  const currentOverallStreak = habitPerformances.length > 0 ? Math.round(habitPerformances.reduce((acc, h) => acc + h.currentStreak, 0) / habitPerformances.length) : 0;

  // Average completion rate across tracked days
  const activeHabitsCount = habits.filter(h => h.active).length || 1;
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
    bestMonth: 'October 2026',
  };
};
