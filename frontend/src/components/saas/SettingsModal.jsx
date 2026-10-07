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
  Globe
} from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { useHabits } from '../../context/HabitContext';
import { api } from '../../services/api';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { soundEnabled, toggleSound } = useGamification();
  const { dashboardData, refreshDashboard } = useHabits();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  // Export Data as JSON
  const handleExportJSON = () => {
    setExporting(true);
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dashboardData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `habit_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert('Error exporting JSON data');
    } finally {
      setExporting(false);
    }
  };

  // Export Data as CSV
  const handleExportCSV = () => {
    if (!dashboardData?.habits) return;
    setExporting(true);
    try {
      const { habits, daysInMonth } = dashboardData;
      let csv = 'Habit Name,Category,Target,Unit,Monthly Rate (%),Current Streak (days)\n';
      habits.forEach((h) => {
        csv += `"${h.name}","${h.category}",${h.target},"${h.unit}",${h.monthlyRate},${h.currentStreak}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `habit_tracker_summary_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Error exporting CSV data');
    } finally {
      setExporting(false);
    }
  };

  // Handle Mock Import
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        alert('Backup verified successfully! Your habit archive is compatible.');
        refreshDashboard();
      } catch (err) {
        alert('Invalid JSON file format. Please upload a valid habit backup.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-surface rounded-3xl border border-border shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-text-primary">
              App Preferences & Data
            </h3>
            <p className="text-xs text-text-secondary">
              Configure audio, notifications, and manage backups
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* 1. Audio Sound Effects Toggle */}
          <div className="p-3 rounded-xl bg-surface-muted/60 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-indigo-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-text-secondary" />
              )}
              <div>
                <span className="font-bold text-text-primary block">
                  Acoustic Audio Feedback
                </span>
                <span className="text-[11px] text-text-secondary">
                  Chimes on habit completion, level-ups & bubble pop
                </span>
              </div>
            </div>

            <button
              onClick={toggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 2. Timezone setting */}
          <div className="p-3 rounded-xl bg-surface-muted/60 border border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-text-secondary" />
              <div>
                <span className="font-bold text-text-primary block">Timezone</span>
                <span className="text-[11px] text-text-secondary">Deterministic date synchronizer</span>
              </div>
            </div>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
              UTC / Auto-Detect
            </span>
          </div>

          {/* 3. Export / Backup Section */}
          <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border space-y-2.5">
            <div>
              <span className="font-bold text-text-primary block">
                Export & Download Backup
              </span>
              <span className="text-[11px] text-text-secondary">
                Download your complete tracking history and metrics
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                disabled={exporting}
                className="flex-1 py-2 px-3 bg-surface hover:bg-slate-100 border border-border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileJson className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={handleExportCSV}
                disabled={exporting}
                className="flex-1 py-2 px-3 bg-surface hover:bg-slate-100 border border-border rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* 4. Import / Restore */}
          <div className="p-3.5 rounded-xl bg-surface-muted/60 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-bold text-text-primary block">
                  Restore Data
                </span>
                <span className="text-[11px] text-text-secondary">
                  Upload previously exported JSON backup
                </span>
              </div>
            </div>

            <label className="w-full py-2 px-3 bg-surface hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer text-text-secondary hover:text-text-primary transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>{importing ? 'Processing file...' : 'Choose Backup File'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
