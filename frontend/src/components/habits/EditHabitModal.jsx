import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
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

export const EditHabitModal = ({ habit, isOpen, onClose }) => {
  const { updateHabit } = useHabits();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [frequency, setFrequency] = useState('daily');
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState('times');
  const [preferredTime, setPreferredTime] = useState('morning');
  const [color, setColor] = useState('#4d7c6f');

  useEffect(() => {
    if (habit) {
      setName(habit.name || '');
      setCategory(habit.category || 'General');
      setFrequency(habit.frequency || 'daily');
      setTarget(habit.target || 1);
      setUnit(habit.unit || 'times');
      setPreferredTime(habit.preferredTime || 'morning');
      setColor(habit.color || '#10b981');
    }
  }, [habit]);

  if (!isOpen || !habit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await updateHabit(habit.id, {
        name,
        category,
        frequency,
        target: Number(target) || 1,
        unit,
        preferredTime,
        color,
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Error updating habit');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
    >
      <div className="bg-surface rounded-2xl border border-border shadow-2xl max-w-md w-full overflow-hidden p-4 sm:p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
          <h3 className="font-extrabold text-base text-text-primary">
            Edit Habit: {habit.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-text-primary mb-1">Habit Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-text-primary mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-text-primary mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-text-primary mb-1">Target</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-text-primary mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-surface-muted border border-border text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-text-primary mb-1">Color Token</label>
            <div className="flex gap-2 pt-1">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-border font-semibold text-text-secondary hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditHabitModal;
