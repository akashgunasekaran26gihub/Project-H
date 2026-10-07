import React, { useState } from 'react';
import {
  Trophy,
  Zap,
  Award,
  Star,
  CheckCircle2,
  Lock,
  ChevronRight,
  Flame,
  Crown,
  Sparkles
} from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useHabits } from '../../context/HabitContext';

export const AchievementsPanel = () => {
  const { levelInfo, xp } = useGamification();
  const { dashboardData, lifetimeData } = useHabits();
  const [selectedBadge, setSelectedBadge] = useState(null);

  if (!dashboardData) return null;

  const { todayStats, overallStreaks, habits } = dashboardData;
  const completedToday = todayStats.completedCount || 0;
  const totalToday = todayStats.totalActive || 1;

  // Daily Quests calculation
  const dailyQuests = [
    {
      id: 'quest-first',
      title: 'Morning Catalyst',
      desc: 'Complete at least 1 habit today',
      xp: 50,
      completed: completedToday >= 1,
      progress: Math.min(1, completedToday) / 1 * 100,
    },
    {
      id: 'quest-triple',
      title: 'Triple Threat',
      desc: 'Complete 3 habits today',
      xp: 75,
      completed: completedToday >= 3,
      progress: Math.min(100, Math.round((completedToday / 3) * 100)),
    },
    {
      id: 'quest-perfection',
      title: 'Daily Mastery',
      desc: 'Achieve 100% completion today',
      xp: 150,
      completed: completedToday === totalToday && totalToday > 0,
      progress: Math.min(100, Math.round((completedToday / totalToday) * 100)),
    },
  ];

  // Trophy Cabinet Badges
  const badges = [
    {
      id: 'b-century',
      name: 'Century Club',
      desc: 'Log 100+ lifetime habit completions',
      icon: Trophy,
      color: 'text-amber-700 bg-amber-50/80 border-amber-200',
      unlocked: (lifetimeData?.totalCompletions || 0) >= 100,
      progress: `${lifetimeData?.totalCompletions || 0} / 100`,
    },
    {
      id: 'b-iron-will',
      name: 'Iron Will',
      desc: 'Maintain a 7-day active streak',
      icon: Flame,
      color: 'text-rose-700 bg-rose-50/80 border-rose-200',
      unlocked: (overallStreaks?.bestStreak || 0) >= 7,
      progress: `${overallStreaks?.bestStreak || 0} / 7 days`,
    },
    {
      id: 'b-zen-master',
      name: 'Zen Practitioner',
      desc: 'Log 15 mindfulness or hydration sessions',
      icon: Star,
      color: 'text-teal-700 bg-teal-50/80 border-teal-200',
      unlocked: true,
      progress: '15 / 15',
    },
    {
      id: 'b-atomic-architect',
      name: 'Atomic Architect',
      desc: 'Build a system of 5 or more active habits',
      icon: Crown,
      color: 'text-indigo-700 bg-indigo-50/80 border-indigo-200',
      unlocked: (habits?.length || 0) >= 5,
      progress: `${habits?.length || 0} / 5 habits`,
    },
    {
      id: 'b-flawless-week',
      name: 'Flawless Week',
      desc: 'Score 90%+ completion in any calendar week',
      icon: Zap,
      color: 'text-emerald-700 bg-emerald-50/80 border-emerald-200',
      unlocked: true,
      progress: 'Week 4: 94%',
    },
    {
      id: 'b-legendary',
      name: 'Consistency Titan',
      desc: 'Reach a 30-day streak milestone',
      icon: Award,
      color: 'text-purple-700 bg-purple-50/80 border-purple-200',
      unlocked: (overallStreaks?.bestStreak || 0) >= 30,
      progress: `${overallStreaks?.bestStreak || 0} / 30 days`,
    },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-soft p-3.5 sm:p-6 mb-6 sm:mb-8">
      
      {/* Top: Header & Level Progression */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-extrabold shadow-2xs">
              <Trophy className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-text-primary tracking-tight">
                DAILY & WEEKLY ACHIEVEMENTS
              </h3>
              <p className="text-xs text-text-secondary">
                Earn XP, level up your habit identity, and unlock milestone trophies
              </p>
            </div>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="bg-surface-muted p-3 rounded-xl border border-border w-full md:w-auto md:min-w-[280px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              Level {levelInfo.level}: {levelInfo.title}
            </span>
            <span className="font-bold text-text-secondary">
              {levelInfo.currentXp} / {levelInfo.nextLevelXp} XP
            </span>
          </div>

          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid: Daily Quests + Weekly Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
        
        {/* Left (5 cols): Daily Quests */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Today's Daily Quests</span>
            </h4>
            <span className="text-[11px] text-text-secondary font-medium">
              Resets at midnight
            </span>
          </div>

          {dailyQuests.map((q) => (
            <div
              key={q.id}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                q.completed
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-surface-muted/60 border-border text-text-primary'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    q.completed ? 'bg-emerald-500 text-white' : 'border border-slate-300 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="font-bold text-xs truncate flex items-center gap-1.5">
                    <span>{q.title}</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                      +{q.xp} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary truncate mt-0.5">{q.desc}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className={`text-[11px] font-extrabold ${q.completed ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {q.completed ? 'Completed' : `${Math.round(q.progress)}%`}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right (7 cols): Trophy Cabinet Badges */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-indigo-500" />
              <span>Milestone Trophy Cabinet</span>
            </h4>
            <span className="text-[11px] text-indigo-600 font-semibold">
              {badges.filter(b => b.unlocked).length} of {badges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBadge(b)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative hover:shadow-xs hover:-translate-y-0.5 ${
                    b.unlocked
                      ? 'bg-surface border-border shadow-2xs hover:border-accent/40'
                      : 'bg-surface-muted/40 border-dashed border-slate-300 opacity-60'
                  }`}
                >
                  <div className="relative inline-block mb-1.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto border ${b.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {!b.unlocked && (
                      <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white p-0.5 rounded-full">
                        <Lock className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <h5 className="font-extrabold text-xs text-text-primary truncate">
                    {b.name}
                  </h5>
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">
                    {b.progress}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Badge Inspector Modal */}
      {selectedBadge && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-xs w-full p-6 text-center relative">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute right-3 top-3 text-text-secondary hover:text-text-primary p-1 rounded-lg"
            >
              ✕
            </button>

            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border text-2xl ${selectedBadge.color}`}
            >
              <selectedBadge.icon className="w-7 h-7" />
            </div>

            <h4 className="font-extrabold text-base text-text-primary mb-1">
              {selectedBadge.name}
            </h4>
            <p className="text-xs text-text-secondary mb-3">
              {selectedBadge.desc}
            </p>

            <div className="p-2.5 bg-surface-muted rounded-xl text-xs font-bold text-indigo-700 mb-4">
              {selectedBadge.unlocked ? '✨ Badge Unlocked & Earned!' : `Locked: ${selectedBadge.progress}`}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AchievementsPanel;
