import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, ChevronRight, Zap } from 'lucide-react';
import { useHabits } from '../../context/HabitContext';

export const AIInsightsSection = ({ onOpenAI }) => {
  const { insightsData, dailySummary, weeklySummary, loading } = useHabits();

  if (loading) {
    return (
      <div className="bg-surface p-5 rounded-2xl border border-border shadow-2xs mb-8 animate-pulse h-40" />
    );
  }

  return (
    <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-2xs mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-text-primary tracking-tight">
              AI HABIT INTELLIGENCE & PATTERNS
            </h3>
            <p className="text-xs text-text-secondary">
              Real-time statistical pattern detection and actionable habit optimization
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAI}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-muted text-text-primary border border-border text-xs font-semibold transition-colors shadow-2xs"
        >
          <span>Ask Assistant</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Insight Cards with Clean Pastel Styling */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Today's AI Snapshot */}
        {dailySummary && (
          <div className="bg-slate-50/50 p-4 rounded-xl border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/80">
                  Daily Briefing
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {dailySummary.completed}/{dailySummary.total} done
                </span>
              </div>
              <h4 className="font-bold text-xs text-text-primary mb-1">
                {dailySummary.title}
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                {dailySummary.recommendation}
              </p>
            </div>

            {dailySummary.strong?.length > 0 && (
              <div className="text-[11px] pt-2 border-t border-border flex items-center gap-1 text-emerald-800 font-semibold truncate">
                <Zap className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <span className="truncate">Strong: {dailySummary.strong.join(', ')}</span>
              </div>
            )}
          </div>
        )}

        {/* Card 2: Peak / Friction Pattern */}
        {insightsData && insightsData.length > 0 ? (
          <div className="bg-slate-50/50 p-4 rounded-xl border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  insightsData[0].type === 'positive'
                    ? 'text-emerald-800 bg-emerald-50 border-emerald-200/80'
                    : 'text-amber-800 bg-amber-50 border-amber-200/80'
                }`}>
                  Pattern Detected
                </span>
                {insightsData[0].metric && (
                  <span className="text-xs font-bold text-text-primary">
                    {insightsData[0].metric}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-xs text-text-primary mb-1 flex items-center gap-1.5">
                {insightsData[0].type === 'positive' ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{insightsData[0].title}</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-2">
                {insightsData[0].summary}
              </p>
            </div>

            {insightsData[0].actionable && (
              <div className="text-[11px] pt-2 border-t border-border text-slate-700 font-medium">
                💡 <span className="font-bold">Next Step:</span> {insightsData[0].actionable}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50/50 p-4 rounded-xl border border-border flex items-center justify-center text-xs text-text-secondary">
            Tracking more days unlocks statistical trend analysis.
          </div>
        )}

        {/* Card 3: Weekly AI Strategic Recommendation */}
        {weeklySummary && (
          <div className="bg-slate-50/50 p-4 rounded-xl border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/80">
                  Weekly Strategy
                </span>
                <span className="text-xs font-bold text-purple-700">
                  {weeklySummary.overallCompletion}% Rate
                </span>
              </div>
              <h4 className="font-bold text-xs text-text-primary mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                <span>Habit Architecture</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-2">
                {weeklySummary.recommendation}
              </p>
            </div>

            <div className="text-[11px] pt-2 border-t border-border text-text-secondary flex items-center justify-between">
              <span>Top: <strong className="text-emerald-700">{weeklySummary.bestHabit}</strong></span>
              <span>Focus: <strong className="text-amber-700">{weeklySummary.weakestHabit}</strong></span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIInsightsSection;
