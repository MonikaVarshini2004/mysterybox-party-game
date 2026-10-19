/**
 * soundEffects.js
 * Lightweight synthesizer using the Web Audio API.
 * No external audio files or dependencies required.
 * Fully supports mute/unmute controls and respects autoplay policies.
 */

let audioCtx = null;
let isMuted = false;

// Check stored mute preference if in browser
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem("mysterybox_sound_muted");
    if (stored !== null) {
      isMuted = stored === "true";
    }
  } catch {
    // localStorage may be restricted in some sandboxes
  }
}

/**
 * Get the current audio context (lazily instantiated on first user gesture)
 */
function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Returns whether sounds are currently muted.
 */
export function getSoundMuted() {
  return isMuted;
}

/**
 * Toggles or sets the mute state.
 * @param {boolean} [newMutedState] Optional explicit boolean
 * @returns {boolean} Updated muted state
 */
export function setSoundMuted(newMutedState) {
  isMuted = typeof newMutedState === "boolean" ? newMutedState : !isMuted;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("mysterybox_sound_muted", String(isMuted));
    } catch {
      // ignore storage errors
    }
  }
  return isMuted;
}

/**
 * Play a magical mystery box opening chime (shimmering sparkle chord).
 */
export function playBoxOpenSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const frequencies = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.4);
    });
  } catch {
    // Audio playback error safely caught
  }
}

/**
 * Play a fun surprise challenge selection fanfare (whoosh + mystery flourish).
 */
export function playSurpriseSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const freqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.07);
      osc.stop(ctx.currentTime + idx * 0.07 + 0.35);
    });
  } catch {
    // Audio playback error safely caught
  }
}

/**
 * Play a cheerful challenge completion success chime.
 */
export function playCompleteSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (ascending major)
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
    });
  } catch {
    // Audio playback error safely caught
  }
}

/**
 * Play a grand victory celebration fanfare when the game is won.
 */
export function playWinnerSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Grand victory fanfare sequence
    const melody = [
      { f: 523.25, t: 0.0, d: 0.15 }, // C5
      { f: 659.25, t: 0.15, d: 0.15 }, // E5
      { f: 783.99, t: 0.3, d: 0.15 }, // G5
      { f: 1046.5, t: 0.45, d: 0.45 }, // C6
      { f: 880.0, t: 0.95, d: 0.2 }, // A5
      { f: 1046.5, t: 1.2, d: 0.6 }, // C6 (long finish)
    ];

    melody.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, ctx.currentTime + t);

      gain.gain.setValueAtTime(0.22, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + d + 0.05);
    });
  } catch {
    // Audio playback error safely caught
  }
}
