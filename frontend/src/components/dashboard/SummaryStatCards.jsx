import React from 'react';
import { Flame, CheckCircle2, Trophy, Activity } from 'lucide-react';
import ProgressRing from '../common/ProgressRing';
import { useHabits } from '../../context/HabitContext';

export const SummaryStatCards = () => {
  const { dashboardData, loading } = useHabits();

  if (loading || !dashboardData) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-surface rounded-2xl border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  const { overallProgress, todayStats, overallStreaks } = dashboardData;

  const cards = [
    {
      id: 'overall-progress',
      title: 'OVERALL PROGRESS',
      value: `${overallProgress}%`,
      subtitle: 'Monthly consistency rate',
      icon: Activity,
      color: '#2e7d5b', // Pastel sage
      ring: true,
      percentage: overallProgress,
    },
    {
      id: 'today-completion',
      title: 'TODAY',
      value: `${todayStats.completedCount} / ${todayStats.totalActive}`,
      subtitle: `${todayStats.completionRate}% habits completed`,
      icon: CheckCircle2,
      color: '#4f46e5', // Pastel indigo
      ring: true,
      percentage: todayStats.completionRate,
    },
    {
      id: 'current-streak',
      title: 'CURRENT STREAK',
      value: `${overallStreaks.currentStreak} days`,
      subtitle: overallStreaks.currentStreak > 0 ? 'Active momentum' : 'Start streak today',
      icon: Flame,
      color: '#b45309', // Pastel warm sand
      ring: false,
      badge: 'Active',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
    },
    {
      id: 'best-streak',
      title: 'BEST STREAK',
      value: `${overallStreaks.bestStreak} days`,
      subtitle: 'All-time personal record',
      icon: Trophy,
      color: '#9f1239', // Pastel rose
      ring: false,
      badge: 'Record',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {cards.map((c) => {
        const IconComponent = c.icon;
        return (
          <div
            key={c.id}
            className="bg-surface p-3 sm:p-5 rounded-2xl border border-border shadow-2xs flex items-center justify-between hover:border-slate-300 transition-all"
          >
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-text-secondary uppercase truncate">
                  {c.title}
                </span>
                {c.badge && (
                  <span className={`text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.2 rounded-full border ${c.badgeClass} hidden xs:inline-block`}>
                    {c.badge}
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-3xl font-extrabold text-text-primary tracking-tight truncate">
                {c.value}
              </div>
              <div className="text-[10px] sm:text-xs text-text-secondary mt-0.5 truncate">
                {c.subtitle}
              </div>
            </div>

            <div className="flex-shrink-0">
              {c.ring ? (
                <ProgressRing
                  percentage={c.percentage}
                  size={46}
                  strokeWidth={4.5}
                  strokeColor={c.color}
                  trackColor="#f1f5f9"
                  textSize="text-[10px] sm:text-[11px] font-bold"
                  textColor="text-slate-700"
                />
              ) : (
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border"
                  style={{
                    backgroundColor: `${c.color}10`,
                    borderColor: `${c.color}25`,
                    color: c.color,
                  }}
                >
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryStatCards;
