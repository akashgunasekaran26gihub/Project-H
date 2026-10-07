import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MonthSelector = () => {
  const { year, month, setMonthAndYear, prevMonth, nextMonth, jumpToToday, jumpToDemoMonth } = useHabits();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isCurrentMonthActive = year === currentYear && month === currentMonth;

  const todayFormatted = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleMonthChange = (e) => {
    setMonthAndYear(year, parseInt(e.target.value, 10));
  };

  const handleYearChange = (e) => {
    setMonthAndYear(parseInt(e.target.value, 10), month);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-border mb-4 sm:mb-6">
      {/* Title & Live Date Badge */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Project H
          </h1>
          <span className="hidden xs:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            ● Today: {todayFormatted}
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
          High-performance consistency spreadsheet & visual analytics • {MONTH_NAMES[month - 1]} {year}
        </p>
      </div>

      {/* Month & Year Navigation Control */}
      <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 bg-surface p-1.5 rounded-xl border border-border shadow-soft w-full sm:w-auto">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 px-1 sm:px-2">
          <Calendar className="w-4 h-4 text-slate-600 hidden xs:block" />
          
          <select
            value={month}
            onChange={handleMonthChange}
            aria-label="Select Month"
            className="bg-transparent font-bold text-xs sm:text-sm text-text-primary focus:outline-none cursor-pointer py-1"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={handleYearChange}
            aria-label="Select Year"
            className="bg-transparent font-bold text-xs sm:text-sm text-text-primary focus:outline-none cursor-pointer py-1"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
          title="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Today Button - always available */}
        <button
          onClick={jumpToToday}
          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors border ${
            isCurrentMonthActive
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
          }`}
          title="Jump to current real-time month"
        >
          Today
        </button>

        {/* Demo Month Shortcut */}
        <button
          onClick={jumpToDemoMonth}
          className="hidden sm:inline-block px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          title="Jump to demo seed data (Oct 2026)"
        >
          Oct &apos;26
        </button>
      </div>
    </div>
  );
};

export default MonthSelector;
