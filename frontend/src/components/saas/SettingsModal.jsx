import React, { useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Check,
  FileText,
  FileJson,
  Sliders,
  Globe,
  User,
  LogOut,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useHabits } from '../../context/HabitContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ConfirmationModal from '../common/ConfirmationModal';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { soundEnabled, toggleSound } = useGamification();
  const { dashboardData, refreshDashboard, seedStarterHabits } = useHabits();
  const { user, logout } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('preferences'); // 'preferences', 'data', 'account'
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  if (!isOpen) return null;

  // Export Data as JSON
  const handleExportJSON = () => {
    setExporting(true);
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dashboardData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `project_h_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Habit archive exported to JSON successfully.');
    } catch (e) {
      toast.error('Failed to export JSON backup.');
    } finally {
      setExporting(false);
    }
  };

  // Export Data as CSV
  const handleExportCSV = () => {
    if (!dashboardData?.habits) {
      toast.warning('No habits available to export.');
      return;
    }
    setExporting(true);
    try {
      const { habits } = dashboardData;
      let csv = 'Habit Name,Category,Target,Unit,Monthly Rate (%),Current Streak (days)\n';
      habits.forEach((h) => {
        csv += `"${h.name}","${h.category}",${h.target},"${h.unit}",${h.monthlyRate},${h.currentStreak}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `project_h_metrics_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Spreadsheet summary exported to CSV successfully.');
    } catch (e) {
      toast.error('Failed to export CSV summary.');
    } finally {
      setExporting(false);
    }
  };

  // Handle Import
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && (parsed.habits || parsed.daysInMonth)) {
          toast.success('Backup archive verified successfully! Reloading metrics.');
          refreshDashboard();
        } else {
          toast.warning('File format recognized, but no habits found.');
        }
      } catch (err) {
        toast.error('Invalid JSON file format. Please upload a valid Project H backup.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSeedStarters = async () => {
    setIsResetConfirmOpen(false);
    try {
      await seedStarterHabits();
      toast.success('Starter habits seeded successfully.');
    } catch (err) {
      toast.error('Failed to load starter habits.');
    }
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    logout();
    onClose();
    toast.info('You have been signed out.');
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      >
        <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-md w-full p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1 text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-text-primary">
                Preferences & Settings
              </h3>
              <p className="text-xs text-text-secondary">
                Configure audio, accounts, and cloud backups
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-3 p-1 bg-surface-muted rounded-xl border border-border mb-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === 'preferences'
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === 'data'
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Backups
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === 'account'
                  ? 'bg-surface text-text-primary shadow-xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Account
            </button>
          </div>

          {/* Tab 1: General Preferences */}
          {activeTab === 'preferences' && (
            <div className="space-y-3.5 text-xs animate-in fade-in">
              {/* Sound Toggle */}
              <div className="p-3 rounded-2xl bg-surface-muted/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-text-secondary" />
                  )}
                  <div>
                    <span className="font-bold text-text-primary block">
                      Acoustic Sound Effects
                    </span>
                    <span className="text-[11px] text-text-secondary">
                      Chimes on completion, bubble pop & leveling
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSound}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle audio effects"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Timezone */}
              <div className="p-3 rounded-2xl bg-surface-muted/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-text-secondary" />
                  <div>
                    <span className="font-bold text-text-primary block">Timezone</span>
                    <span className="text-[11px] text-text-secondary">Auto-synchronized date boundaries</span>
                  </div>
                </div>
                <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 text-[11px]">
                  Local Browser Time
                </span>
              </div>

              {/* PWA / Offline Sync info */}
              <div className="p-3 rounded-2xl bg-surface-muted/60 border border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <span className="font-bold text-text-primary block">Offline Cache & PWA</span>
                    <span className="text-[11px] text-text-secondary">Changes sync automatically upon reconnect</span>
                  </div>
                </div>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[10px]">
                  Active
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Data & Backups */}
          {activeTab === 'data' && (
            <div className="space-y-3.5 text-xs animate-in fade-in">
              {/* Export Buttons */}
              <div className="p-3.5 rounded-2xl bg-surface-muted/60 border border-border space-y-2.5">
                <div>
                  <span className="font-bold text-text-primary block">
                    Export Habits & History
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Download full archive in portable JSON or CSV formats
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    disabled={exporting}
                    className="py-2 px-3 bg-surface hover:bg-surface-muted border border-border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <FileJson className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Export JSON</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={exporting}
                    className="py-2 px-3 bg-surface hover:bg-surface-muted border border-border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Import File */}
              <div className="p-3.5 rounded-2xl bg-surface-muted/60 border border-border">
                <div className="mb-2">
                  <span className="font-bold text-text-primary block">
                    Restore from Backup
                  </span>
                  <span className="text-[11px] text-text-secondary">
                    Upload a previously exported JSON backup file
                  </span>
                </div>

                <label className="w-full py-2 px-3 bg-surface hover:bg-surface-muted border border-dashed border-border rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer text-text-secondary hover:text-text-primary transition-colors text-center">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{importing ? 'Validating file...' : 'Choose JSON Backup File'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          )}

          {/* Tab 3: Account Profile */}
          {activeTab === 'account' && (
            <div className="space-y-3.5 text-xs animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-surface-muted/60 border border-border space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 dark:bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-text-primary">
                      {user?.name || 'Authorized Member'}
                    </div>
                    <div className="text-[11px] text-text-secondary">
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-text-secondary">Current Plan:</span>
                  <span className="font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 text-[10px]">
                    Pro Member (Full Suite)
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="w-full py-2.5 px-3 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Project H</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Seeding Starter Habits */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleSeedStarters}
        title="Add Starter Habits?"
        message="This will add 3 core curated habits (Exercise, Deep Work, Reading) to your consistency dashboard."
        confirmText="Add Habits"
        variant="primary"
      />

      {/* Confirmation Modal for Logout */}
      <ConfirmationModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out?"
        message="You will need to sign in again to access your habits and offline synchronization queue."
        confirmText="Sign Out"
        variant="danger"
      />
    </>
  );
};

export default SettingsModal;
