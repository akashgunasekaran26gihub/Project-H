import React, { useState } from 'react';
import { Calendar, ChevronRight, Award, AlertCircle } from 'lucide-react';
import ProgressRing from '../common/ProgressRing';
import { useHabits } from '../../context/HabitContext';

const WEEK_THEMES = {
  week1: {
    bg: 'bg-teal-50/50',
    border: 'border-teal-200/60',
    ring: '#0f766e',
    badge: 'bg-teal-100/70 text-teal-900',
  },
  week2: {
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200/60',
    ring: '#15803d',
    badge: 'bg-emerald-100/70 text-emerald-900',
  },
  week3: {
    bg: 'bg-rose-50/50',
    border: 'border-rose-200/60',
    ring: '#be123c',
    badge: 'bg-rose-100/70 text-rose-900',
  },
  week4: {
    bg: 'bg-amber-50/50',
    border: 'border-amber-200/60',
    ring: '#b45309',
    badge: 'bg-amber-100/70 text-amber-900',
  },
  week5: {
    bg: 'bg-purple-50/50',
    border: 'border-purple-200/60',
    ring: '#7e22ce',
    badge: 'bg-purple-100/70 text-purple-900',
  },
};

export const WeeklyProgressCards = () => {
  const { dashboardData, loading } = useHabits();
  const [selectedWeek, setSelectedWeek] = useState(null);

  if (loading || !dashboardData) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-32 bg-surface rounded-2xl border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  const { weeklyProgress } = dashboardData;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-text-primary tracking-tight">
            WEEKLY PROGRESS BREAKDOWN
          </h3>
          <p className="text-xs text-text-secondary">
            Performance metrics across calendar weeks
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {weeklyProgress.map((w, idx) => {
          const theme = WEEK_THEMES[w.colorKey] || WEEK_THEMES.week1;
          const isLastOdd = idx === 4;

          return (
            <div
              key={w.weekNumber}
              onClick={() => setSelectedWeek(w)}
              className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:border-slate-400/60 ${theme.bg} ${theme.border} ${isLastOdd ? 'col-span-2 sm:col-span-1' : ''}`}
            >
              {/* Header: Week Label & Date Range */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${theme.badge}`}>
                  {w.label}
                </span>
                <span className="text-[11px] font-semibold text-text-secondary">
                  {w.dateRange}
                </span>
              </div>

              {/* Progress Ring & Total */}
              <div className="flex items-center justify-between my-2">
                <div>
                  <div className="text-xl font-extrabold text-text-primary">
                    {w.completionRate}%
                  </div>
                  <div className="text-[11px] text-text-secondary mt-0.5 font-medium">
                    {w.totalCompletions} / {w.totalPotential} done
                  </div>
                </div>

                <ProgressRing
                  percentage={w.completionRate}
                  size={48}
                  strokeWidth={4.5}
                  strokeColor={theme.ring}
                  trackColor="#ffffff80"
                  showText={false}
                />
              </div>

              {/* Quick Best/Weakest stats */}
              <div className="mt-3 pt-2.5 border-t border-black/5 text-[11px] space-y-1">
                <div className="flex items-center justify-between truncate text-text-secondary">
                  <span className="flex items-center gap-1 truncate text-emerald-800">
                    <Award className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{w.bestHabit}</span>
                  </span>
                </div>
                {w.weakestHabit !== 'None' && w.weakestHabit !== w.bestHabit && (
                  <div className="flex items-center justify-between truncate text-text-secondary">
                    <span className="flex items-center gap-1 truncate text-amber-800">
                      <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                      <span className="truncate">{w.weakestHabit}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Detail Inspector Modal */}
      {selectedWeek && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-surface rounded-2xl border border-border shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setSelectedWeek(null)}
              className="absolute right-4 top-4 text-text-secondary hover:text-text-primary text-sm font-bold p-1 rounded-lg hover:bg-surface-muted"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <ProgressRing
                percentage={selectedWeek.completionRate}
                size={56}
                strokeWidth={5}
                strokeColor={WEEK_THEMES[selectedWeek.colorKey]?.ring || '#319795'}
              />
              <div>
                <h4 className="font-extrabold text-lg text-text-primary">
                  {selectedWeek.label} Detailed Review
                </h4>
                <p className="text-xs text-text-secondary">
                  Date range: {selectedWeek.dateRange} (Days {selectedWeek.startDay} to {selectedWeek.endDay})
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-surface-muted p-4 rounded-xl text-xs">
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-secondary font-medium">Completion Rate:</span>
                <span className="font-bold text-text-primary">{selectedWeek.completionRate}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-secondary font-medium">Completions Logged:</span>
                <span className="font-bold text-text-primary">{selectedWeek.totalCompletions} sessions</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-secondary font-medium">Total Opportunities:</span>
                <span className="font-bold text-text-primary">{selectedWeek.totalPotential} habit-days</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-text-secondary font-medium">Top Performer:</span>
                <span className="font-bold text-emerald-600">🌟 {selectedWeek.bestHabit}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-secondary font-medium">Growth Area:</span>
                <span className="font-bold text-amber-600">⚠️ {selectedWeek.weakestHabit}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedWeek(null)}
              className="mt-5 w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyProgressCards;
