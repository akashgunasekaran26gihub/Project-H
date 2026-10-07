import React, { useState } from 'react';
import { X, Share2, Copy, Check, Flame, Trophy, Award, Sparkles } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';
import { useGamification } from '../../context/GamificationContext';

export const ShareModal = ({ isOpen, onClose }) => {
  const { dashboardData } = useHabits();
  const { levelInfo } = useGamification();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !dashboardData) return null;

  const { overallProgress, overallStreaks, todayStats, habits } = dashboardData;

  const shareText = `🚀 My Habit Consistency Update:\n` +
    `• Monthly Consistency: ${overallProgress}%\n` +
    `• Active Streak: ${overallStreaks.currentStreak} Days 🔥\n` +
    `• Level: ${levelInfo.level} (${levelInfo.title})\n` +
    `• Today: ${todayStats.completedCount}/${todayStats.totalActive} Habits Completed ✓\n` +
    `Built with AI Habit Tracker!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-sm w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mx-auto mb-2">
            <Share2 className="w-4 h-4" />
          </div>
          <h3 className="font-extrabold text-base text-text-primary">
            Share Accountability Card
          </h3>
          <p className="text-xs text-text-secondary">
            Celebrate your streak with an accountability partner
          </p>
        </div>

        {/* The Card Snapshot with Executive Pastel Styling */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs mb-4 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5 mb-3">
            <span className="text-[11px] font-extrabold tracking-wider text-slate-700">
              PROJECT H PRO
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Level {levelInfo.level}
            </span>
          </div>

          <div className="flex items-center justify-between my-2">
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                {overallProgress}%
              </div>
              <div className="text-[11px] text-slate-500 font-medium">October Consistency</div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-amber-700 flex items-center justify-end gap-1">
                <Flame className="w-5 h-5 fill-amber-500 text-amber-600" />
                <span>{overallStreaks.currentStreak}d</span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Active Streak</div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
            <span>{habits.length} Habits Tracked</span>
            <span>Personal Best: {overallStreaks.bestStreak}d</span>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Card Summary</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
