import React, { useState, useEffect } from 'react';
import {
  X,
  Wind,
  Sparkles,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  Moon,
  Headphones
} from 'lucide-react';
import { playSound, ambientPlayer } from '../../utils/soundEffects';

export const ZenZoneModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('breathing'); // 'breathing', 'bubbles', 'lanterns', 'ambient'

  // 1. Breathing Orb State
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Pause
  const [breathTimer, setBreathTimer] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(true);
  const [breathMode, setBreathMode] = useState('box'); // 'box' (4-4-4-4), 'relax' (4-7-8)

  // 2. Bubble Popper State
  const [bubbles, setBubbles] = useState(Array(36).fill(false)); // true = popped
  const [popCount, setPopCount] = useState(0);

  // 3. Floating Lanterns State
  const [thoughtText, setThoughtText] = useState('');
  const [floatingLanterns, setFloatingLanterns] = useState([]);

  // 4. Ambient Sound State
  const [activeSound, setActiveSound] = useState(null); // null, 'rain', 'zen'
  const [volume, setVolume] = useState(0.25);

  // Breathing Loop Timer
  useEffect(() => {
    if (!isOpen || activeTab !== 'breathing' || !isBreathingActive) return;

    const interval = setInterval(() => {
      setBreathTimer((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phases
        if (breathMode === 'box') {
          // 4-4-4-4
          if (breathPhase === 'Inhale') {
            setBreathPhase('Hold');
            return 4;
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            return 4;
          } else if (breathPhase === 'Exhale') {
            setBreathPhase('Pause');
            return 4;
          } else {
            setBreathPhase('Inhale');
            setBreathCycles((c) => c + 1);
            return 4;
          }
        } else {
          // 4-7-8 Relax
          if (breathPhase === 'Inhale') {
            setBreathPhase('Hold');
            return 7;
          } else if (breathPhase === 'Hold') {
            setBreathPhase('Exhale');
            return 8;
          } else {
            setBreathPhase('Inhale');
            setBreathCycles((c) => c + 1);
            return 4;
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, isBreathingActive, breathPhase, breathMode]);

  // Clean up ambient audio on unmount
  useEffect(() => {
    return () => {
      ambientPlayer.stop();
    };
  }, []);

  if (!isOpen) return null;

  // Bubble Click
  const handleBubbleClick = (index) => {
    if (!bubbles[index]) {
      const updated = [...bubbles];
      updated[index] = true;
      setBubbles(updated);
      setPopCount((c) => c + 1);
      playSound('pop', true);
    }
  };

  const resetBubbles = () => {
    setBubbles(Array(36).fill(false));
    playSound('click', true);
  };

  // Lantern Release
  const handleReleaseThought = (e) => {
    e.preventDefault();
    if (!thoughtText.trim()) return;

    const newLantern = {
      id: Date.now(),
      text: thoughtText,
      x: 20 + Math.random() * 60, // percentage position
    };

    setFloatingLanterns((prev) => [...prev, newLantern]);
    setThoughtText('');
    playSound('check', true);

    // Remove lantern after float animation ends
    setTimeout(() => {
      setFloatingLanterns((prev) => prev.filter((l) => l.id !== newLantern.id));
    }, 7000);
  };

  // Ambient Sound Toggle
  const toggleAmbientSound = (soundName) => {
    if (activeSound === soundName) {
      ambientPlayer.stop();
      setActiveSound(null);
    } else {
      ambientPlayer.play(soundName, volume);
      setActiveSound(soundName);
    }
  };

  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    ambientPlayer.setVolume(newVol);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in"
    >
      <div className="bg-surface rounded-2xl sm:rounded-3xl border border-border shadow-xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center flex-shrink-0">
              <Wind className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-text-primary flex items-center gap-2">
                <span>Zen Zone & Mind Relaxer</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100/70 text-teal-800">
                  CALM
                </span>
              </h3>
              <p className="text-xs text-text-secondary">
                Reset your nervous system, reduce cortisol, and prime yourself for deep focus
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              ambientPlayer.stop();
              onClose();
            }}
            className="p-1.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-surface-muted/30 px-3 pt-2 gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'breathing'
                ? 'border-teal-700 text-teal-900 bg-surface'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-teal-700" />
            <span>Breathing Orb</span>
          </button>

          <button
            onClick={() => setActiveTab('bubbles')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'bubbles'
                ? 'border-rose-600 text-rose-900 bg-surface'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Bubble Popper ({popCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('lanterns')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'lanterns'
                ? 'border-amber-600 text-amber-900 bg-surface'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-amber-600" />
            <span>Thought Release</span>
          </button>

          <button
            onClick={() => setActiveTab('ambient')}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ambient'
                ? 'border-indigo-600 text-indigo-900 bg-surface'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-indigo-600" />
            <span>Soundscapes</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* TAB 1: Breathing Orb (Clean Pastel Sphere, No Glowing Blurs) */}
          {activeTab === 'breathing' && (
            <div className="flex flex-col items-center justify-center text-center py-4">
              {/* Mode switch */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => {
                    setBreathMode('box');
                    setBreathPhase('Inhale');
                    setBreathTimer(4);
                  }}
                  className={`px-3 py-1 text-xs rounded-full font-bold transition-all border ${
                    breathMode === 'box'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-surface-muted text-text-secondary border-transparent hover:bg-slate-200'
                  }`}
                >
                  Box Focus (4-4-4-4)
                </button>
                <button
                  onClick={() => {
                    setBreathMode('relax');
                    setBreathPhase('Inhale');
                    setBreathTimer(4);
                  }}
                  className={`px-3 py-1 text-xs rounded-full font-bold transition-all border ${
                    breathMode === 'relax'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-surface-muted text-text-secondary border-transparent hover:bg-slate-200'
                  }`}
                >
                  4-7-8 Sleep & Calm
                </button>
              </div>

              {/* The Serene Pastel Breathing Sphere */}
              <div className="relative w-52 h-52 flex items-center justify-center my-4">
                <div
                  className={`rounded-full flex flex-col items-center justify-center transition-all duration-1000 transform border ${
                    breathPhase === 'Inhale'
                      ? 'w-44 h-44 bg-teal-50 text-teal-900 border-teal-200 scale-105'
                      : breathPhase === 'Hold'
                      ? 'w-44 h-44 bg-indigo-50 text-indigo-900 border-indigo-200 scale-100'
                      : breathPhase === 'Exhale'
                      ? 'w-32 h-32 bg-rose-50 text-rose-900 border-rose-200 scale-90'
                      : 'w-32 h-32 bg-slate-50 text-slate-800 border-slate-200 scale-90'
                  }`}
                >
                  <span className="text-xs font-bold tracking-wider uppercase">
                    {breathPhase}
                  </span>
                  <span className="text-3xl font-black mt-0.5">{breathTimer}</span>
                </div>
              </div>

              <p className="text-xs text-text-secondary mt-3 max-w-xs leading-relaxed">
                {breathPhase === 'Inhale' && 'Slowly breathe in through your nose, expanding your diaphragm.'}
                {breathPhase === 'Hold' && 'Gently hold your breath without tension in your neck.'}
                {breathPhase === 'Exhale' && 'Smoothly exhale completely through your mouth.'}
                {breathPhase === 'Pause' && 'Rest quietly before the next breath cycle begins.'}
              </p>

              <div className="mt-4 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                Completed Cycles: {breathCycles}
              </div>
            </div>
          )}

          {/* TAB 2: Tactile Bubble Popper with Soft Pastel Buttons */}
          {activeTab === 'bubbles' && (
            <div className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-extrabold text-text-primary">
                    Silicone Bubble Wrap
                  </h4>
                  <p className="text-[11px] text-text-secondary">
                    Click bubbles for acoustic sensory relaxation
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                    {popCount} Popped
                  </span>
                  <button
                    onClick={resetBubbles}
                    className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
                    title="Reset All Bubbles"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 6x6 Bubble Grid with Soft Pastel Styling */}
              <div className="grid grid-cols-6 gap-2.5 max-w-xs mx-auto p-4 bg-surface-muted/60 rounded-2xl border border-border">
                {bubbles.map((popped, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleBubbleClick(idx)}
                    className={`w-10 h-10 rounded-full border transition-all transform active:scale-90 flex items-center justify-center font-bold text-xs ${
                      popped
                        ? 'bg-slate-200/70 border-slate-300 text-slate-400 scale-95 shadow-inner'
                        : 'bg-rose-100 hover:bg-rose-200/80 border-rose-200 text-rose-800 shadow-2xs hover:scale-102'
                    }`}
                  >
                    {popped ? '' : '•'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Thought Release / Sky Lanterns */}
          {activeTab === 'lanterns' && (
            <div className="relative">
              <div className="mb-4 text-center">
                <h4 className="text-xs font-extrabold text-text-primary">
                  Celestial Thought Release
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Type any intrusive worry or mental obstacle, then watch it gently float away into the night sky.
                </p>
              </div>

              {/* Night Sky Canvas */}
              <div className="relative h-48 bg-slate-900 rounded-2xl overflow-hidden p-3 border border-slate-800 shadow-inner mb-4">
                {/* Subtle Stars */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Floating Lanterns (Soft Golden, No Neon Glow) */}
                {floatingLanterns.map((l) => (
                  <div
                    key={l.id}
                    className="absolute bottom-2 text-xs text-amber-200 flex flex-col items-center animate-lantern-float"
                    style={{ left: `${l.x}%` }}
                  >
                    <div className="w-7 h-8 rounded-md bg-amber-400 border border-amber-300 flex items-center justify-center text-[10px] text-amber-950 font-bold shadow-sm">
                      🏮
                    </div>
                    <span className="text-[9px] font-medium text-amber-100 bg-slate-950/80 px-1.5 py-0.5 rounded mt-1 truncate max-w-[100px] border border-amber-500/20">
                      {l.text}
                    </span>
                  </div>
                ))}

                {floatingLanterns.length === 0 && (
                  <div className="h-full flex items-center justify-center text-[11px] text-slate-400 italic">
                    The night sky is calm. Release your worries below.
                  </div>
                )}
              </div>

              {/* Release Input Form */}
              <form onSubmit={handleReleaseThought} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Worrying about tomorrow's schedule..."
                  value={thoughtText}
                  onChange={(e) => setThoughtText(e.target.value)}
                  className="flex-1 bg-surface-muted border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <button
                  type="submit"
                  disabled={!thoughtText.trim()}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Release</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: Ambient Soundscapes */}
          {activeTab === 'ambient' && (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <h4 className="text-xs font-extrabold text-text-primary">
                  Synthesized Ambient Soundscapes
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Native procedural audio generated directly inside your browser
                </p>
              </div>

              {/* Sound cards with Soft Pastel Styling */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => toggleAmbientSound('rain')}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                    activeSound === 'rain'
                      ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-2xs'
                      : 'bg-surface-muted/60 border-border text-text-primary hover:bg-slate-100'
                  }`}
                >
                  <div className="text-2xl mb-1.5">🌧️</div>
                  <h5 className="font-extrabold text-xs">Gentle Rain</h5>
                  <p className="text-[10px] text-text-secondary mt-0.5">Filtered acoustic droplets</p>
                  <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeSound === 'rain' ? 'bg-slate-900 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}>
                    {activeSound === 'rain' ? 'Playing' : 'Click to Play'}
                  </span>
                </div>

                <div
                  onClick={() => toggleAmbientSound('zen')}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                    activeSound === 'zen'
                      ? 'bg-purple-50/80 border-purple-300 text-purple-900 shadow-2xs'
                      : 'bg-surface-muted/60 border-border text-text-primary hover:bg-slate-100'
                  }`}
                >
                  <div className="text-2xl mb-1.5">🧘</div>
                  <h5 className="font-extrabold text-xs">432Hz Binaural Drone</h5>
                  <p className="text-[10px] text-text-secondary mt-0.5">Harmonic theta wave calm</p>
                  <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeSound === 'zen' ? 'bg-slate-900 text-white' : 'bg-slate-200/80 text-slate-700'
                  }`}>
                    {activeSound === 'zen' ? 'Playing' : 'Click to Play'}
                  </span>
                </div>
              </div>

              {/* Volume Slider */}
              <div className="p-3 bg-surface-muted rounded-xl border border-border flex items-center gap-3">
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-text-secondary" />
                ) : (
                  <Volume2 className="w-4 h-4 text-slate-700" />
                )}
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-slate-800"
                />
                <span className="text-xs font-bold text-text-secondary w-8 text-right">
                  {Math.round((volume / 0.8) * 100)}%
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ZenZoneModal;
