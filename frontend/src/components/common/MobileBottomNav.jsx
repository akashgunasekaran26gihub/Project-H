import React from 'react';
import {
  CheckCircle2,
  BarChart2,
  Trophy,
  Wind,
  Sparkles,
  Plus
} from 'lucide-react';

export const MobileBottomNav = ({
  activeTab = 'tracker',
  onSelectTab,
  onOpenAddHabit,
  onOpenZen,
  onOpenAI,
}) => {
  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border md:hidden shadow-lg transition-transform"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 h-14">
        
        {/* 1. Habit Tracker */}
        <button
          onClick={() => onSelectTab('tracker')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'tracker'
              ? 'text-slate-900 font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <CheckCircle2 className={`w-5 h-5 ${activeTab === 'tracker' ? 'stroke-[2.5px] text-slate-900' : ''}`} />
          <span className="text-[10px] mt-0.5">Tracker</span>
        </button>

        {/* 2. Weekly & Analytics */}
        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'analytics'
              ? 'text-slate-900 font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <BarChart2 className={`w-5 h-5 ${activeTab === 'analytics' ? 'stroke-[2.5px] text-slate-900' : ''}`} />
          <span className="text-[10px] mt-0.5">Trends</span>
        </button>

        {/* 3. Center Quick Add Action */}
        <button
          onClick={onOpenAddHabit}
          className="flex items-center justify-center -mt-4 w-11 h-11 rounded-full bg-slate-900 text-white shadow-md active:scale-95 transition-transform"
          title="Add New Habit"
          aria-label="Add Habit"
        >
          <Plus className="w-5 h-5 stroke-[2.5px]" />
        </button>

        {/* 4. Achievements */}
        <button
          onClick={() => onSelectTab('achievements')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            activeTab === 'achievements'
              ? 'text-slate-900 font-bold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Trophy className={`w-5 h-5 ${activeTab === 'achievements' ? 'stroke-[2.5px] text-amber-600' : ''}`} />
          <span className="text-[10px] mt-0.5">Badges</span>
        </button>

        {/* 5. Zen Zone */}
        <button
          onClick={onOpenZen}
          className="flex flex-col items-center justify-center flex-1 py-1 text-teal-800 transition-colors"
          title="Zen Zone"
        >
          <Wind className="w-5 h-5 text-teal-700" />
          <span className="text-[10px] mt-0.5 font-medium">Zen</span>
        </button>

        {/* 6. AI Coach */}
        <button
          onClick={onOpenAI}
          className="flex flex-col items-center justify-center flex-1 py-1 text-indigo-700 transition-colors"
          title="AI Coach"
        >
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-[10px] mt-0.5 font-medium">AI</span>
        </button>

      </div>
    </nav>
  );
};

export default MobileBottomNav;
