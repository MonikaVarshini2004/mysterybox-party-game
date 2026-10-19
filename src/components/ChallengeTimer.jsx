import { useState, useEffect, useRef, useCallback } from "react";
import "./ChallengeTimer.css";

/**
 * ChallengeTimer
 * Reusable timer with 30s, 60s, and 90s preset durations.
 *
 * Props:
 *   defaultDuration - initial duration in seconds (30 | 60 | 90), default 30
 *   onTimeUp        - callback invoked when timer reaches 0
 *   isStopped       - boolean flag to externally halt and reset the timer
 */
export default function ChallengeTimer({
  defaultDuration = 30,
  onTimeUp,
  isStopped = false,
}) {
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  const timerRef = useRef(null);

  // Derived running state respecting external halt
  const activeRunning = isRunning && !isStopped;

  // Play a soft pleasant synth chime when time is up using Web Audio API
  const playTimeUpChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.4);
      });
    } catch {
      // Audio playback is optional; ignore if audio context is blocked
    }
  }, []);

  // Clear interval helper to guarantee no multiple timers run simultaneously
  const clearCurrentTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearCurrentTimer();
    };
  }, [clearCurrentTimer]);

  // Main tick interval
  useEffect(() => {
    if (!activeRunning) {
      clearCurrentTimer();
      return;
    }

    clearCurrentTimer();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearCurrentTimer();
          setIsRunning(false);
          setHasFinished(true);
          playTimeUpChime();
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearCurrentTimer();
    };
  }, [activeRunning, clearCurrentTimer, onTimeUp, playTimeUpChime]);

  // Select duration (30, 60, 90)
  const handleSelectDuration = (seconds) => {
    clearCurrentTimer();
    setIsRunning(false);
    setHasFinished(false);
    setSelectedDuration(seconds);
    setTimeLeft(seconds);
  };

  // Start / Resume
  const handleStart = () => {
    if (timeLeft === 0) {
      setTimeLeft(selectedDuration);
    }
    setHasFinished(false);
    setIsRunning(true);
  };

  // Pause
  const handlePause = () => {
    clearCurrentTimer();
    setIsRunning(false);
  };

  // Reset
  const handleReset = () => {
    clearCurrentTimer();
    setIsRunning(false);
    setHasFinished(false);
    setTimeLeft(selectedDuration);
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Progress percentage for progress bar
  const progressPercent = ((selectedDuration - timeLeft) / selectedDuration) * 100;
  const isUrgent = timeLeft > 0 && timeLeft <= 10;

  return (
    <div
      className={`challenge-timer ${isUrgent ? "timer--urgent" : ""} ${
        hasFinished ? "timer--finished" : ""
      }`}
      role="region"
      aria-label="Challenge countdown timer"
    >
      <div className="timer-header">
        <span className="timer-icon" aria-hidden="true">
          {hasFinished ? "⏰" : activeRunning ? "⏳" : "⏱️"}
        </span>
        <span className="timer-title">Challenge Timer</span>
        {hasFinished && <span className="timer-badge-done">Time's Up!</span>}
      </div>

      {/* Preset duration buttons */}
      <div className="timer-durations" role="group" aria-label="Select challenge duration">
        {[30, 60, 90].map((sec) => (
          <button
            key={sec}
            type="button"
            className={`timer-duration-btn ${selectedDuration === sec ? "active" : ""}`}
            onClick={() => handleSelectDuration(sec)}
            disabled={activeRunning}
            aria-pressed={selectedDuration === sec}
          >
            {sec}s
          </button>
        ))}
      </div>

      {/* Clock display */}
      <div className="timer-display-wrap">
        <div
          className={`timer-clock-digits ${isUrgent ? "pulse-urgent" : ""}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {formatTime(timeLeft)}
        </div>

        {/* Progress bar */}
        <div className="timer-progress-track" aria-hidden="true">
          <div
            className="timer-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="timer-controls">
        {!activeRunning ? (
          <button
            type="button"
            className="timer-btn timer-btn--start"
            onClick={handleStart}
          >
            {timeLeft === 0 ? "🔄 Restart" : timeLeft < selectedDuration ? "▶ Resume" : "▶ Start"}
          </button>
        ) : (
          <button
            type="button"
            className="timer-btn timer-btn--pause"
            onClick={handlePause}
          >
            ⏸ Pause
          </button>
        )}

        <button
          type="button"
          className="timer-btn timer-btn--reset"
          onClick={handleReset}
          disabled={timeLeft === selectedDuration && !activeRunning}
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
