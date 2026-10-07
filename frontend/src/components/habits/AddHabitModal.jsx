import React, { useState } from 'react';
import { Sparkles, Check, X, Plus, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useHabits } from '../../context/HabitContext';

const PRESET_COLORS = [
  '#4d7c6f', // pastel sage
  '#387478', // pastel teal
  '#b85d75', // pastel rose
  '#c27847', // pastel warm sand
  '#7c69a5', // pastel lavender
  '#5b6b82', // pastel slate
  '#cf6b59', // pastel peach
  '#6b7d52', // pastel olive
];

const CATEGORIES = ['Fitness', 'Productivity', 'Learning', 'Mindfulness', 'Health', 'General'];

export const AddHabitModal = ({ isOpen, onClose, initialData = null }) => {
  const { createHabit } = useHabits();

  const [tab, setTab] = useState('manual'); // 'manual' or 'ai'
  const [nlPrompt, setNlPrompt] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [frequency, setFrequency] = useState('daily');
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState('times');
  const [preferredTime, setPreferredTime] = useState('morning');
  const [color, setColor] = useState('#4d7c6f');

  // AI Confirmation state
  const [aiProposal, setAiProposal] = useState(null);

  if (!isOpen) return null;

  const handleParseNLP = async () => {
    if (!nlPrompt.trim()) return;
    setIsParsing(true);
    setParseError('');

    try {
      const res = await api.parseHabitPrompt(nlPrompt);
      setAiProposal(res.parsedHabit);
    } catch (e) {
      setParseError(e.message || 'Failed to parse natural language habit description.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAIProposal = async () => {
    if (!aiProposal) return;
    try {
      await createHabit({
        name: aiProposal.name,
        description: aiProposal.description,
        frequency: aiProposal.frequency || 'daily',
        target: Number(aiProposal.target) || 1,
        unit: aiProposal.unit || 'times',
        preferredTime: aiProposal.preferredTime || 'anytime',
        category: aiProposal.category || 'General',
        color: aiProposal.color || '#4d7c6f',
      });
      onClose();
      resetForm();
    } catch (err) {
      alert(err.message || 'Error creating habit');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await createHabit({
        name,
        description,
        category,
        frequency,
        target: Number(target) || 1,
        unit,
        preferredTime,
        color,
      });
      onClose();
      resetForm();
    } catch (err) {
      alert(err.message || 'Error creating habit');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('General');
    setFrequency('daily');
    setTarget(1);
    setUnit('times');
    setPreferredTime('morning');
    setColor('#4d7c6f');
    setNlPrompt('');
    setAiProposal(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-lg w-full overflow-hidden">
        
        {/* Header with Tabs */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-text-primary">
              Add New Habit
            </h3>
            <p className="text-xs text-text-secondary">
              Set goals, tracking metrics, and routines
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-border bg-surface-muted/40">
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
              tab === 'manual'
                ? 'border-accent text-accent bg-surface'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            Manual Configuration
          </button>
          <button
            onClick={() => setTab('ai')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'ai'
                ? 'border-purple-600 text-purple-700 bg-surface'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>AI Natural Language</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {tab === 'ai' ? (
            /* AI Natural Language Habit Creation */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Describe what you want to achieve:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="e.g. I want to exercise for 30 minutes every morning or Read 15 pages of a book before bed daily"
                    value={nlPrompt}
                    onChange={(e) => setNlPrompt(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setNlPrompt('I want to do 20 minutes of morning yoga every day')}
                    className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full hover:bg-purple-100"
                  >
                    Yoga 20 mins
                  </button>
                  <button
                    type="button"
                    onClick={() => setNlPrompt('Solve 1 LeetCode problem every afternoon')}
                    className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full hover:bg-purple-100"
                  >
                    LeetCode 1 problem
                  </button>
                  <button
                    type="button"
                    onClick={() => setNlPrompt('Drink 8 glasses of water daily')}
                    className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full hover:bg-purple-100"
                  >
                    8 glasses of water
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleParseNLP}
                disabled={isParsing || !nlPrompt.trim()}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-2xs transition-all"
              >
                {isParsing ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing sentence with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Parse Details with AI</span>
                  </>
                )}
              </button>

              {parseError && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* AI Confirmation Card */}
              {aiProposal && (
                <div className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                      AI Generated Preview
                    </span>
                    <span className="text-xs text-text-secondary">Requires confirmation</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: aiProposal.color }}
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-text-primary">
                        {aiProposal.name}
                      </h4>
                      <p className="text-xs text-text-secondary">
                        {aiProposal.category} • {aiProposal.target} {aiProposal.unit} • {aiProposal.preferredTime}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-surface p-2.5 rounded-lg border border-indigo-100">
                    <div>
                      <span className="text-text-secondary">Frequency:</span>{' '}
                      <strong className="capitalize">{aiProposal.frequency}</strong>
                    </div>
                    <div>
                      <span className="text-text-secondary">Time:</span>{' '}
                      <strong className="capitalize">{aiProposal.preferredTime}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setAiProposal(null)}
                      className="flex-1 py-2 rounded-lg border border-border text-xs font-semibold text-text-secondary hover:bg-surface-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAIProposal}
                      className="flex-1 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Save Habit</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manual Form */
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Habit Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Cardio, Deep Work, LeetCode"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays (Mon-Fri)</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Target Goal
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Measurement Unit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mins, pages, problems, glasses"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Preferred Time
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="anytime">Anytime</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          color === c ? 'scale-115 border-slate-900 shadow-xs' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Create Habit
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddHabitModal;
