import React from 'react';
import { Award, Flame, Calendar, CheckSquare, Target, BarChart2, Star } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';

export const LifetimeStatsSection = () => {
  const { lifetimeData, loading } = useHabits();

  if (loading || !lifetimeData) {
    return (
      <div className="bg-surface p-6 rounded-2xl border border-border shadow-soft animate-pulse h-36" />
    );
  }

  const items = [
    { label: 'Total Habits', value: lifetimeData.totalHabits, icon: Target, color: 'text-indigo-600' },
    { label: 'Total Completions', value: lifetimeData.totalCompletions, icon: CheckSquare, color: 'text-emerald-600' },
    { label: 'Total Tracked Days', value: `${lifetimeData.totalTrackedDays} days`, icon: Calendar, color: 'text-blue-600' },
    { label: 'Best Lifetime Streak', value: `${lifetimeData.bestStreak} days`, icon: Award, color: 'text-amber-500' },
    { label: 'Average Consistency', value: `${lifetimeData.averageCompletionRate}%`, icon: BarChart2, color: 'text-purple-600' },
    { label: 'Most Consistent', value: lifetimeData.mostConsistentHabit, icon: Star, color: 'text-emerald-600' },
    { label: 'Growth Habit', value: lifetimeData.leastConsistentHabit, icon: Flame, color: 'text-rose-500' },
    { label: 'Best Month', value: lifetimeData.bestMonth, icon: Award, color: 'text-indigo-500' },
  ];

  return (
    <div className="bg-surface p-3.5 sm:p-6 rounded-2xl border border-border shadow-soft mb-6 sm:mb-8">
      <div className="mb-3 sm:mb-4">
        <h3 className="text-base font-bold text-text-primary tracking-tight">
          LIFETIME STATISTICS
        </h3>
        <p className="text-xs text-text-secondary">
          Historical habit data accumulated across all tracking cycles
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {items.map((it, idx) => {
          const Icon = it.icon;
          return (
            <div
              key={idx}
              className="p-2.5 sm:p-3.5 rounded-xl bg-surface-muted/60 border border-border/80 flex items-center gap-2.5 sm:gap-3"
            >
              <div className={`p-2 rounded-lg bg-surface shadow-xs ${it.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-text-secondary block tracking-wider truncate">
                  {it.label}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-text-primary block truncate">
                  {it.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LifetimeStatsSection;
