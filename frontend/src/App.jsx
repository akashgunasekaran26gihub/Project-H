import React, { useState, useRef } from 'react';
import Navbar from './components/common/Navbar';
import MonthSelector from './components/dashboard/MonthSelector';
import SummaryStatCards from './components/dashboard/SummaryStatCards';
import HabitGrid from './components/dashboard/HabitGrid';
import WeeklyProgressCards from './components/dashboard/WeeklyProgressCards';
import AchievementsPanel from './components/achievements/AchievementsPanel';
import ChartsSection from './components/dashboard/ChartsSection';
import AIInsightsSection from './components/dashboard/AIInsightsSection';
import LifetimeStatsSection from './components/dashboard/LifetimeStatsSection';
import AddHabitModal from './components/habits/AddHabitModal';
import EditHabitModal from './components/habits/EditHabitModal';
import AIAssistantDrawer from './components/ai/AIAssistantDrawer';
import AuthModal from './components/auth/AuthModal';
import ZenZoneModal from './components/zen/ZenZoneModal';
import PricingModal from './components/saas/PricingModal';
import SettingsModal from './components/saas/SettingsModal';
import ShareModal from './components/saas/ShareModal';
import MobileBottomNav from './components/common/MobileBottomNav';
import AuthScreen from './components/auth/AuthScreen';
import { useHabits } from './context/HabitContext';
import { useAuth } from './context/AuthContext';

export function HabitTrackerApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isZenOpen, setIsZenOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('tracker');

  const trackerRef = useRef(null);
  const analyticsRef = useRef(null);
  const achievementsRef = useRef(null);

  const handleScrollToAchievements = () => {
    setMobileTab('achievements');
    achievementsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectMobileTab = (tab) => {
    setMobileTab(tab);
    if (tab === 'tracker') {
      trackerRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'analytics') {
      analyticsRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (tab === 'achievements') {
      achievementsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-9 h-9 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-text-secondary font-medium">Loading your consistency dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenAI={() => setIsAIOpen(true)}
        onOpenAddHabit={() => setIsAddOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenZen={() => setIsZenOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onScrollToAchievements={handleScrollToAchievements}
      />

      {/* Main Content Dashboard Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-24 md:pb-8">
        
        {/* 1. Month / Year Selector Header */}
        <MonthSelector />

        {/* 2. Top Summary KPI Cards (Overall Progress, Today, Current Streak, Best Streak) */}
        <SummaryStatCards />

        {/* 3. Monthly Habit Grid (Spreadsheet & Mobile Daily Focus) */}
        <div ref={trackerRef}>
          <HabitGrid
            onOpenAddHabit={() => setIsAddOpen(true)}
            onOpenEditHabit={(habit) => setEditingHabit(habit)}
          />
        </div>

        {/* 4. Weekly Progress Cards (5 calendar weeks with pastel tokens and progress rings) */}
        <div ref={analyticsRef}>
          <WeeklyProgressCards />
        </div>

        {/* 5. Daily & Weekly Achievements & Gamification Section */}
        <div ref={achievementsRef}>
          <AchievementsPanel />
        </div>

        {/* 6. Progress Charts (Monthly trend line & Habit comparison bar charts) */}
        <ChartsSection />

        {/* 7. AI Insights Section (Pattern detection, daily briefing, recommendations) */}
        <AIInsightsSection onOpenAI={() => setIsAIOpen(true)} />

        {/* 8. Lifetime Statistics */}
        <LifetimeStatsSection />

      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-6 pb-20 md:pb-6 text-center text-xs text-text-secondary">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Project H Pro • Built for high consistency & behavioral momentum</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsPricingOpen(true)} className="hover:text-text-primary">SaaS Plans</button>
            <span>•</span>
            <button onClick={() => setIsZenOpen(true)} className="hover:text-text-primary">Zen Zone</button>
            <span>•</span>
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-text-primary">Export Data</button>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Visible only on phone/mobile screens) */}
      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        onOpenAddHabit={() => setIsAddOpen(true)}
        onOpenZen={() => setIsZenOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
      />

      {/* Modals & Slide-out Drawers */}
      <AddHabitModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <EditHabitModal
        habit={editingHabit}
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
      />

      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ZenZoneModal
        isOpen={isZenOpen}
        onClose={() => setIsZenOpen(false)}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}

export default HabitTrackerApp;
