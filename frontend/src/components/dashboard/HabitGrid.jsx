import React, { useState } from 'react';
import {
  Check,
  Circle,
  HelpCircle,
  X,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Flame,
  ArrowUpDown,
  Sparkles,
  Edit2,
  Trash2,
  Archive,
  Calendar
} from 'lucide-react';
import { useHabits } from '../../context/HabitContext';

const WEEK_COLORS = {
  1: { header: 'bg-teal-50/60 text-teal-900 border-teal-200/60', label: 'W1' },
  2: { header: 'bg-emerald-50/60 text-emerald-900 border-emerald-200/60', label: 'W2' },
  3: { header: 'bg-rose-50/60 text-rose-900 border-rose-200/60', label: 'W3' },
  4: { header: 'bg-amber-50/60 text-amber-900 border-amber-200/60', label: 'W4' },
  5: { header: 'bg-purple-50/60 text-purple-900 border-purple-200/60', label: 'W5' },
};

const getWeekForDay = (day) => {
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  if (day <= 28) return 4;
  return 5;
};

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const HabitGrid = ({ onOpenAddHabit, onOpenEditHabit }) => {
  const {
    year,
    month,
    dashboardData,
    toggleCell,
    deleteHabit,
    toggleArchiveHabit,
    loading,
    refreshing,
    seedStarterHabits,
  } = useHabits();

  const todayDay = new Date().getDate();
  const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() + 1 === month;
  const [selectedDay, setSelectedDay] = useState(isCurrentMonth ? todayDay : 1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile-today' : 'grid'
  );
  const [activeMenuHabitId, setActiveMenuHabitId] = useState(null);

  React.useEffect(() => {
    const isNow = new Date().getFullYear() === year && new Date().getMonth() + 1 === month;
    setSelectedDay(isNow ? new Date().getDate() : 1);
  }, [year, month]);

  if (loading || !dashboardData) {
    return (
      <div className="bg-surface rounded-2xl border border-border p-8 text-center shadow-2xs mb-8">
        <div className="animate-spin w-7 h-7 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-text-secondary">Loading monthly habit grid...</p>
      </div>
    );
  }

  const { daysInMonth, habits, dailyStats } = dashboardData;

  // Filter habits
  const categories = ['All', ...new Set(habits.map(h => h.category || 'General'))];
  const filteredHabits = habits.filter(h => {
    const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate stats for selectedDay in mobile focus view
  const selectedDayStat = dailyStats.find(d => d.day === selectedDay) || {};
  const selectedDayCompletedCount = habits.filter(h => h.days[selectedDay]?.status === 'completed').length;
  const selectedDayPartialCount = habits.filter(h => h.days[selectedDay]?.status === 'partial').length;
  const selectedDayTotalActive = habits.filter(h => h.active).length;
  const selectedDayRate = selectedDayTotalActive > 0 ? Math.round((selectedDayCompletedCount / selectedDayTotalActive) * 100) : 0;

  // Calculate day completion status icon & style with soft pastel tones
  const renderCellContent = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-md bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-300/70 transition-colors">
            ✓
          </span>
        );
      case 'partial':
        return (
          <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-md bg-amber-100/80 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-300/70 transition-colors">
            ◐
          </span>
        );
      case 'missed':
        return (
          <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-md bg-rose-100/80 text-rose-700 flex items-center justify-center font-bold text-xs border border-rose-200/80 transition-colors">
            ✕
          </span>
        );
      default:
        return (
          <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-md border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 text-slate-300 flex items-center justify-center text-xs transition-colors">
            ○
          </span>
        );
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-soft mb-6 sm:mb-8 overflow-hidden">
      
      {/* Header Bar: Title, Search, Category Filters & Mode Switch */}
      <div className="p-3.5 sm:p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              MONTHLY PROJECT H
            </h2>
            {refreshing && (
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
            Tap any cell to toggle: Completed (✓) → Partial (◐) → Missed (✕) → Unmarked (○)
          </p>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode switch for all screen sizes */}
          <div className="flex items-center bg-surface-muted p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setViewMode('mobile-today')}
              className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all ${viewMode === 'mobile-today' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-secondary'}`}
            >
              Focus View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all ${viewMode === 'grid' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-secondary'}`}
            >
              Full Grid
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-text-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 rounded-lg text-xs bg-surface-muted border border-border text-text-primary focus:outline-none focus:ring-1 focus:ring-accent w-full sm:w-40"
            />
          </div>

          {/* Category Dropdown (mobile) & Pills (desktop) */}
          <div className="block md:hidden">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-1.5 px-2 rounded-lg text-xs bg-surface-muted border border-border text-text-primary focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-surface-muted p-0.5 rounded-lg border border-border">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedCategory === cat
                    ? 'bg-surface text-text-primary shadow-xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Add Habit Button */}
          <button
            onClick={onOpenAddHabit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Add Habit</span>
          </button>
        </div>
      </div>

      {/* Grid or Mobile Today List */}
      {viewMode === 'mobile-today' ? (
        /* Mobile-Friendly Focus View with Day Slider and Big Touch Targets */
        <div className="p-3.5 sm:p-5 space-y-3.5">
          {/* Day Navigation Bar */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
            <button
              onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
              disabled={selectedDay <= 1}
              className="p-1.5 rounded-lg bg-surface border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100"
              title="Previous Day"
            >
              <Calendar className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-extrabold text-slate-900">
                  Day {selectedDay} of {daysInMonth}
                </span>
                {isCurrentMonth && selectedDay === todayDay && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    TODAY
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {selectedDayCompletedCount} of {selectedDayTotalActive} habits completed ({selectedDayRate}%)
              </p>
            </div>

            <button
              onClick={() => setSelectedDay(Math.min(daysInMonth, selectedDay + 1))}
              disabled={selectedDay >= daysInMonth}
              className="p-1.5 rounded-lg bg-surface border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-slate-100"
              title="Next Day"
            >
              <Calendar className="w-4 h-4 rotate-180" />
            </button>
          </div>

          {/* Mini Day Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${selectedDayRate}%` }}
            />
          </div>

          {/* Habit Cards in Focus View */}
          {filteredHabits.length === 0 ? (
            <div className="p-6 text-center bg-surface-muted/50 rounded-2xl border border-dashed border-border my-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 text-base font-bold">
                🌱
              </div>
              <h3 className="font-extrabold text-sm text-text-primary">Welcome! Your Tracker is Clean</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
                No habits logged yet for your account. Start fresh or seed 3 foundational starter habits!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button
                  onClick={onOpenAddHabit}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  + Add First Habit
                </button>
                <button
                  onClick={seedStarterHabits}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors"
                >
                  ✨ Seed 3 Starter Habits
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredHabits.map((habit) => {
                const cell = habit.days[selectedDay] || { status: 'unmarked' };
                const dateISO = `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

                return (
                  <div
                    key={habit.id}
                    className="p-3 sm:p-3.5 rounded-xl bg-surface border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-3 shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: habit.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-text-primary truncate">{habit.name}</h4>
                          {habit.currentStreak > 2 && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200 flex-shrink-0">
                              🔥 {habit.currentStreak}d
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate mt-0.5">
                          {habit.target} {habit.unit} • <span className="font-medium text-slate-700">{habit.category}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Big Touch Target Button for Phone */}
                      <button
                        onClick={() => toggleCell(habit.id, dateISO, cell.status)}
                        className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs ${
                          cell.status === 'completed'
                            ? 'bg-emerald-100/90 text-emerald-800 border-emerald-300'
                            : cell.status === 'partial'
                            ? 'bg-amber-100/90 text-amber-800 border-amber-300'
                            : cell.status === 'missed'
                            ? 'bg-rose-100/90 text-rose-800 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/70'
                        }`}
                        title="Tap to toggle completion"
                      >
                        {cell.status === 'completed' && <span>✓ Done</span>}
                        {cell.status === 'partial' && <span>◐ Half</span>}
                        {cell.status === 'missed' && <span>✕ Missed</span>}
                        {cell.status === 'unmarked' && <span>○ Log</span>}
                      </button>

                      {/* Habit options */}
                      <button
                        onClick={() => onOpenEditHabit(habit)}
                        className="p-2 text-text-secondary hover:text-text-primary hover:bg-slate-100 rounded-lg"
                        title="Edit Habit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Full Spreadsheet Monthly Grid with Sticky Column & Pastel Headers */
        <div className="overflow-x-auto relative" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-left border-collapse select-none">
            <thead>
              {/* Row 1: Week grouping label bands with pastel themes */}
              <tr className="border-b border-border text-[11px] font-semibold text-center">
                <th className="sticky left-0 z-20 bg-surface px-2.5 sm:px-4 py-2 text-left font-bold text-text-secondary border-r border-border min-w-[130px] sm:min-w-[200px]">
                  HABIT
                </th>
                {/* Week Bands matching reference */}
                <th colSpan={7} className={`py-1 border-r border-border ${WEEK_COLORS[1].header}`}>
                  WEEK 1 (Days 1–7)
                </th>
                <th colSpan={7} className={`py-1 border-r border-border ${WEEK_COLORS[2].header}`}>
                  WEEK 2 (Days 8–14)
                </th>
                <th colSpan={7} className={`py-1 border-r border-border ${WEEK_COLORS[3].header}`}>
                  WEEK 3 (Days 15–21)
                </th>
                <th colSpan={7} className={`py-1 border-r border-border ${WEEK_COLORS[4].header}`}>
                  WEEK 4 (Days 22–28)
                </th>
                <th colSpan={daysInMonth - 28} className={`py-1 border-r border-border ${WEEK_COLORS[5].header}`}>
                  WEEK 5 (Days 29–{daysInMonth})
                </th>
                <th className="px-3 py-1 bg-surface font-bold text-text-secondary min-w-[80px]">
                  TOTAL
                </th>
              </tr>

              {/* Row 2: Individual Day Numbers (1 to 31) and Day of Week letters */}
              <tr className="border-b border-border text-[11px] font-bold text-center bg-surface-muted/60">
                <th className="sticky left-0 z-20 bg-surface px-2.5 sm:px-4 py-2 text-left text-xs font-bold text-text-secondary border-r border-border min-w-[130px] sm:min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <span>{filteredHabits.length} habits</span>
                    <span className="text-[10px] font-normal text-text-secondary hidden sm:inline">Oct {year}</span>
                  </div>
                </th>

                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const stat = dailyStats.find(d => d.day === day) || {};
                  const isToday = stat.isToday;
                  const isWeekend = stat.isWeekend;
                  const dayOfWeek = stat.dayOfWeek !== undefined ? DAY_LETTERS[stat.dayOfWeek] : '';
                  const weekNum = getWeekForDay(day);

                  return (
                    <th
                      key={day}
                      className={`px-1 py-1.5 min-w-[32px] max-w-[36px] text-center border-r border-border/60 transition-colors ${
                        isToday ? 'bg-indigo-50 border-x-2 border-indigo-400' : isWeekend ? 'bg-slate-100/50' : ''
                      }`}
                    >
                      <div className="text-[10px] font-semibold text-text-secondary">
                        {dayOfWeek}
                      </div>
                      <div className={`text-xs font-extrabold ${isToday ? 'text-accent' : 'text-text-primary'}`}>
                        {day}
                      </div>
                    </th>
                  );
                })}

                <th className="px-3 py-2 text-center text-xs font-bold text-text-secondary">
                  RATE
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/70 text-xs">
              {filteredHabits.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 2} className="py-12 text-center text-text-secondary">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 text-base font-bold">
                      🌱
                    </div>
                    <p className="font-extrabold text-sm text-text-primary">Your tracker is clean and ready</p>
                    <p className="text-xs text-text-secondary mt-1">Start fresh with your own custom habits or load 3 starter habits.</p>
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button
                        onClick={onOpenAddHabit}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
                      >
                        + Create First Habit
                      </button>
                      <button
                        onClick={seedStarterHabits}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
                      >
                        ✨ Seed 3 Starter Habits
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHabits.map((habit) => (
                  <tr
                    key={habit.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Sticky Habit Info Column */}
                    <td className="sticky left-0 z-10 bg-surface group-hover:bg-slate-50/90 px-2.5 sm:px-4 py-2 sm:py-2.5 border-r border-border sticky-column-shadow min-w-[130px] sm:min-w-[200px]">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Color Dot Indicator */}
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: habit.color }}
                          />
                          <div className="truncate">
                            <span className="font-bold text-text-primary text-xs truncate block max-w-[85px] sm:max-w-none">
                              {habit.name}
                            </span>
                            <span className="text-[10px] text-text-secondary block truncate">
                              {habit.target} {habit.unit} • {habit.category}
                            </span>
                          </div>
                        </div>

                        {/* Action Dropdown Trigger */}
                        <div className="relative flex items-center">
                          <button
                            onClick={() => setActiveMenuHabitId(activeMenuHabitId === habit.id ? null : habit.id)}
                            className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors opacity-0 group-hover:opacity-100"
                            title="Habit Options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeMenuHabitId === habit.id && (
                            <div className="absolute right-0 top-6 z-30 w-36 bg-surface rounded-xl shadow-lg border border-border py-1 text-xs">
                              <button
                                onClick={() => {
                                  setActiveMenuHabitId(null);
                                  onOpenEditHabit(habit);
                                }}
                                className="w-full px-3 py-1.5 text-left text-text-primary hover:bg-surface-muted flex items-center gap-2"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-accent" />
                                <span>Edit Habit</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuHabitId(null);
                                  toggleArchiveHabit(habit.id);
                                }}
                                className="w-full px-3 py-1.5 text-left text-text-primary hover:bg-surface-muted flex items-center gap-2"
                              >
                                <Archive className="w-3.5 h-3.5 text-amber-500" />
                                <span>{habit.active ? 'Archive' : 'Restore'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuHabitId(null);
                                  if (confirm(`Delete habit "${habit.name}"?`)) {
                                    deleteHabit(habit.id);
                                  }
                                }}
                                className="w-full px-3 py-1.5 text-left text-danger hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-danger" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Day Cells 1 to 31 */}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const day = i + 1;
                      const cell = habit.days[day] || { status: 'unmarked' };
                      const stat = dailyStats.find(d => d.day === day) || {};
                      const isToday = stat.isToday;
                      const isWeekend = stat.isWeekend;
                      const dateISO = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                      return (
                        <td
                          key={day}
                          onClick={() => toggleCell(habit.id, dateISO, cell.status)}
                          className={`p-1 text-center cursor-pointer habit-cell-transition border-r border-border/50 ${
                            isToday ? 'bg-indigo-50/50' : isWeekend ? 'bg-slate-50/40' : ''
                          }`}
                          title={`Day ${day}: ${cell.status || 'unmarked'}. Click to toggle.`}
                        >
                          <div className="flex items-center justify-center">
                            {renderCellContent(cell.status)}
                          </div>
                        </td>
                      );
                    })}

                    {/* Total & Streak Column */}
                    <td className="px-3 py-2 text-center font-bold">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`text-xs ${
                          habit.monthlyRate >= 80 ? 'text-emerald-600 font-extrabold' :
                          habit.monthlyRate >= 60 ? 'text-indigo-600 font-bold' :
                          'text-slate-600 font-medium'
                        }`}>
                          {habit.monthlyRate}%
                        </span>
                        {habit.currentStreak > 2 && (
                          <span
                            className="inline-flex items-center text-[10px] font-semibold text-amber-600 bg-amber-50 px-1 py-0.2 rounded"
                            title={`Current streak: ${habit.currentStreak} days`}
                          >
                            <Flame className="w-2.5 h-2.5 mr-0.5 fill-amber-500 text-amber-500" />
                            {habit.currentStreak}d
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HabitGrid;
