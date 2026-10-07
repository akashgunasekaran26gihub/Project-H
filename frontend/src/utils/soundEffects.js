/**
 * Pure Web Audio API Sound Synthesizer
 * Zero external audio files required — generates rich acoustic feedback natively.
 */

let audioCtx = null;

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playSound = (type = 'check', enabled = true) => {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'check') {
      // Pleasant marimba-like double chime (C5 -> G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.28);
    } else if (type === 'pop') {
      // Satisfying bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'levelUp') {
      // Ascending triumphant 3-tone arpeggio (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } else if (type === 'click') {
      // Subtle tactile click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    }
  } catch (e) {
    console.debug('Audio play prevented or unavailable:', e);
  }
};

/**
 * Ambient Procedural Soundscapes Engine (Binaural Drone, Rain, Ocean)
 */
class AmbientSoundEngine {
  constructor() {
    this.activeNodes = null;
    this.currentTrack = null;
  }

  stop() {
    if (this.activeNodes) {
      try {
        this.activeNodes.stop();
      } catch (e) {}
      this.activeNodes = null;
    }
    this.currentTrack = null;
  }

  play(track = 'zen', volume = 0.3) {
    this.stop();
    const ctx = getAudioContext();
    if (!ctx) return;

    this.currentTrack = track;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    if (track === 'zen') {
      // 432Hz Sacred Resonance Binaural Drone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(216, now); // Fundamental harmonic
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(220, now); // Gentle binaural 4Hz theta wave beat

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(masterGain);

      osc1.start();
      osc2.start();

      this.activeNodes = {
        stop: () => {
          masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          setTimeout(() => {
            try { osc1.stop(); osc2.stop(); } catch (e) {}
          }, 500);
        },
        setVolume: (v) => masterGain.gain.setValueAtTime(v, ctx.currentTime)
      };
    } else if (track === 'rain') {
      // Procedural Soft Rain using white noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();

      this.activeNodes = {
        stop: () => {
          masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          setTimeout(() => {
            try { whiteNoise.stop(); } catch (e) {}
          }, 500);
        },
        setVolume: (v) => masterGain.gain.setValueAtTime(v, ctx.currentTime)
      };
    }
  }

  setVolume(vol) {
    if (this.activeNodes && this.activeNodes.setVolume) {
      this.activeNodes.setVolume(vol);
    }
  }
}

export const ambientPlayer = new AmbientSoundEngine();
