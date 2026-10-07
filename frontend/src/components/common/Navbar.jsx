import React from 'react';
import {
  Sparkles,
  Wifi,
  WifiOff,
  Plus,
  User,
  LogOut,
  CheckCircle2,
  Wind,
  Trophy,
  Sliders,
  Share2,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHabits } from '../../context/HabitContext';
import { useGamification } from '../../context/GamificationContext';

export const Navbar = ({
  onOpenAI,
  onOpenAddHabit,
  onOpenAuth,
  onOpenZen,
  onOpenPricing,
  onOpenSettings,
  onOpenShare,
  onScrollToAchievements,
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isOffline, offlineQueueCount } = useHabits();
  const { levelInfo } = useGamification();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-sm border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-lg tracking-tight text-text-primary">
                Project H
              </span>
              <button
                onClick={onOpenPricing}
                className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-0.5 sm:gap-1 cursor-pointer"
                title="View SaaS Pro Subscription"
              >
                <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700" />
                <span>PRO</span>
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-text-secondary hidden sm:block">
              Daily Tracking & Cognitive Analytics
            </p>
          </div>
        </div>

        {/* Right Desktop: Full Executive Nav (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 sm:gap-2.5">
          
          {/* Level / XP Pill */}
          <button
            onClick={onScrollToAchievements}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            title="View Daily & Weekly Achievements"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Lvl {levelInfo.level} • {levelInfo.currentXp} XP</span>
          </button>

          {/* Zen Zone Button */}
          <button
            onClick={onOpenZen}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-teal-50/80 hover:bg-teal-100/80 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors"
            title="Open Mind Relaxing Tools & Breathing Orb"
          >
            <Wind className="w-3.5 h-3.5 text-teal-700" />
            <span>Zen Zone</span>
          </button>

          {/* Offline/Online status */}
          {isOffline ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs border border-amber-200 font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">({offlineQueueCount} unsynced)</span>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 font-medium">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Synced</span>
            </div>
          )}

          {/* AI Coach Action Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors"
            title="Open AI Habit Coach"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Coach</span>
          </button>

          {/* Quick Add Habit Button */}
          <button
            onClick={onOpenAddHabit}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Habit</span>
          </button>

          {/* Share Progress Button */}
          <button
            onClick={onOpenShare}
            className="p-1.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
            title="Share Accountability Card"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
            title="Preferences & Data Backups"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* User profile / Auth */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-1 border-l border-border">
              <div
                onClick={onOpenSettings}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors"
                title={user?.email}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 text-text-secondary hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors hidden sm:block"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-text-primary hover:bg-surface-muted transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Log in</span>
            </button>
          )}

        </div>

        {/* Right Mobile: Streamlined Touch Controls (md:hidden) */}
        <div className="flex md:hidden items-center gap-1.5">
          {/* Quick AI Coach trigger */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200"
            title="AI Coach"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px]">AI</span>
          </button>

          {/* Quick Add Habit trigger */}
          <button
            onClick={onOpenAddHabit}
            className="p-1.5 rounded-xl bg-slate-900 text-white font-bold shadow-2xs"
            title="Add Habit"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl border border-border text-text-primary hover:bg-surface-muted transition-colors"
            aria-label="Open Mobile Menu"
          >
            <Sliders className="w-4 h-4 text-slate-700" />
          </button>
        </div>

      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-2.5 animate-in slide-in-from-top duration-200 shadow-md">
          {/* Level & XP */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-800">
                Level {levelInfo.level} • {levelInfo.title}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {levelInfo.currentXp} XP
            </span>
          </div>

          {/* Quick Actions Grid in Mobile Drawer */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenZen();
              }}
              className="p-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-2 font-semibold"
            >
              <Wind className="w-4 h-4 text-teal-700" />
              <span>Zen Zone</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenShare();
              }}
              className="p-2.5 rounded-xl bg-surface border border-border text-slate-800 flex items-center gap-2 font-semibold hover:bg-surface-muted"
            >
              <Share2 className="w-4 h-4 text-indigo-600" />
              <span>Share Card</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPricing();
              }}
              className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-2 font-semibold"
            >
              <Crown className="w-4 h-4 text-amber-600" />
              <span>SaaS Pro</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSettings();
              }}
              className="p-2.5 rounded-xl bg-surface border border-border text-slate-800 flex items-center gap-2 font-semibold hover:bg-surface-muted"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>Settings</span>
            </button>
          </div>

          {/* User profile / Logout */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-semibold text-slate-800 truncate text-[11px]">
                    {user?.email}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-rose-600 font-bold hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Log in / Sign up</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
