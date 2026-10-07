import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../utils/soundEffects';

const GamificationContext = createContext(null);

const STORAGE_KEY = 'habit_tracker_gamification';

// Level thresholds
const LEVELS = [
  { level: 1, title: 'Novice Tracker', xpRequired: 0 },
  { level: 2, title: 'Momentum Builder', xpRequired: 300 },
  { level: 3, title: 'Habit Alchemist', xpRequired: 800 },
  { level: 4, title: 'Consistency Master', xpRequired: 1600 },
  { level: 5, title: 'Atomic Titan', xpRequired: 2800 },
  { level: 6, title: 'Grandmaster of Focus', xpRequired: 4500 },
];

export const GamificationProvider = ({ children }) => {
  const [xp, setXp] = useState(1450); // Initial baseline from seed activity
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentXpGain, setRecentXpGain] = useState(null);

  // Load from local storage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.xp) setXp(parsed.xp);
        if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
      }
    } catch (e) {}
  }, []);

  const saveState = (newXp, sound = soundEnabled) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ xp: newXp, soundEnabled: sound }));
  };

  // Determine current level
  const getCurrentLevel = () => {
    let current = LEVELS[0];
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].xpRequired) {
        current = LEVELS[i];
      } else {
        break;
      }
    }
    const nextLevel = LEVELS.find(l => l.level === current.level + 1) || null;
    const prevXp = current.xpRequired;
    const nextXp = nextLevel ? nextLevel.xpRequired : current.xpRequired + 1000;
    const progress = Math.min(100, Math.round(((xp - prevXp) / (nextXp - prevXp)) * 100));

    return {
      level: current.level,
      title: current.title,
      currentXp: xp,
      nextLevelXp: nextXp,
      progress,
    };
  };

  const addXp = (amount, reason = '') => {
    setXp((prev) => {
      const updated = prev + amount;
      saveState(updated);

      // Check level up
      const oldLvl = LEVELS.filter(l => prev >= l.xpRequired).pop()?.level || 1;
      const newLvl = LEVELS.filter(l => updated >= l.xpRequired).pop()?.level || 1;

      if (newLvl > oldLvl) {
        playSound('levelUp', soundEnabled);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffd700', '#ff69b4', '#00ffff', '#7b68ee'],
        });
      }

      return updated;
    });

    setRecentXpGain({ amount, reason, id: Date.now() });
    setTimeout(() => setRecentXpGain(null), 2500);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      saveState(xp, next);
      return next;
    });
  };

  return (
    <GamificationContext.Provider value={{
      xp,
      addXp,
      levelInfo: getCurrentLevel(),
      soundEnabled,
      toggleSound,
      recentXpGain,
    }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};
