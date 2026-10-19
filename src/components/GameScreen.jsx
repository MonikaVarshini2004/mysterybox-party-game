import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import GiftBox from "./GiftBox";
import RevealModal from "./RevealModal";
import Scoreboard from "./Scoreboard";
import GameOver from "./GameOver";
import { initializePlayerScores, calculateChallengePoints, calculateRankings, getWinners } from "../utils/scoring.js";
import { getSoundMuted, setSoundMuted } from "../utils/soundEffects.js";
import { saveActiveGame, saveGameToHistory } from "../utils/storage.js";
import "./GameScreen.css";

/**
 * GameScreen – the main game board.
 *
 * Props:
 *   assignments   - Array<{ name, secret, dare, mode, difficulty, category, ... }>
 *   onRestart     - () => void
 *   onPlayAgain   - () => void
 *   onResetGame   - () => void
 *   gameMode      - "secret" | "truth" | "surprise"
 *   initialState  - object | null (restored saved state)
 *   lastConfig    - object | null
 */
export default function GameScreen({
  assignments,
  onRestart,
  onPlayAgain,
  onResetGame,
  gameMode = "secret",
  initialState = null,
  lastConfig = null,
}) {
  const [activeAssignment, setActiveAssignment] = useState(null);

  // Restore or initialize index sets
  const [openedIndexes, setOpenedIndexes] = useState(
    () => initialState?.openedIndexes || new Set()
  );
  const [completedIndexes, setCompletedIndexes] = useState(
    () => initialState?.completedIndexes || new Set()
  );
  const [skippedIndexes, setSkippedIndexes] = useState(
    () => initialState?.skippedIndexes || new Set()
  );
  const [isGameOverScreen, setIsGameOverScreen] = useState(
    () => Boolean(initialState?.isGameOverScreen)
  );
  const [isMuted, setIsMuted] = useState(() => getSoundMuted());

  // Initialize or restore player scores
  const playerNames = useMemo(
    () => assignments.map((a) => a.name),
    [assignments]
  );

  const [scores, setScores] = useState(() => {
    if (initialState?.scores) {
      return initialState.scores;
    }
    return initializePlayerScores(playerNames);
  });

  // Derived counts
  const total = assignments.length;
  const completed = completedIndexes.size;
  const skipped = skippedIndexes.size;
  const revealed = openedIndexes.size;
  const allDone = completed + skipped === total;

  // Toggle audio mute
  const handleToggleMute = useCallback(() => {
    const next = setSoundMuted();
    setIsMuted(next);
  }, []);

  // Determine active mode metadata
  const currentMode = assignments[0]?.mode || gameMode || "secret";
  const modeMetadata = {
    secret: {
      name: "Secret Assignment",
      icon: "🤫",
      hint: "Click your box to reveal your secret recipient and dare!",
    },
    truth: {
      name: "Truth or Dare",
      icon: "🤔",
      hint: "Click your box to choose Truth, Dare, or Surprise!",
    },
    surprise: {
      name: "Surprise Challenge",
      icon: "🎉",
      hint: "Click your box to reveal an unpredictable surprise!",
    },
  }[currentMode] || {
    name: "MysteryBox",
    icon: "🎁",
    hint: "Click your box to reveal your challenge!",
  };

  // ── Auto-save active progress to localStorage ────────────────────────
  useEffect(() => {
    saveActiveGame({
      assignments,
      gameMode: currentMode,
      openedIndexes,
      completedIndexes,
      skippedIndexes,
      scores,
      isGameOverScreen,
      lastConfig,
    });
  }, [
    assignments,
    currentMode,
    openedIndexes,
    completedIndexes,
    skippedIndexes,
    scores,
    isGameOverScreen,
    lastConfig,
  ]);

  // ── Record to match history when round finishes ─────────────────────
  const hasSavedHistoryRef = useRef(false);
  useEffect(() => {
    if (allDone && !hasSavedHistoryRef.current) {
      hasSavedHistoryRef.current = true;
      const ranked = calculateRankings(scores);
      const { winners, topScore } = getWinners(ranked);
      saveGameToHistory({
        gameMode: currentMode,
        players: playerNames,
        winners,
        topScore,
        totalCompleted: completed,
        totalSkipped: skipped,
      });
    }
  }, [allDone, scores, currentMode, playerNames, completed, skipped]);

  // ── Open a box ──────────────────────────────────────────────────────
  const handleOpen = (assignment, index) => {
    // Cannot open already resolved boxes
    if (completedIndexes.has(index) || skippedIndexes.has(index)) return;

    setOpenedIndexes((prev) => new Set([...prev, index]));
    setActiveAssignment({ ...assignment, index });
  };

  // ── Modal actions ────────────────────────────────────────────────────
  const handleClose = () => {
    setActiveAssignment(null);
    // If all done, open GameOver screen
    if (completedIndexes.size + skippedIndexes.size === total) {
      setTimeout(() => setIsGameOverScreen(true), 300);
    }
  };

  /**
   * Idempotent Challenge Completion:
   * Prevents double-awarding of points even if clicked repeatedly.
   */
  const handleComplete = ({ difficulty = "Medium", isBonus = false } = {}) => {
    if (activeAssignment == null) return;
    const index = activeAssignment.index;
    const playerName = activeAssignment.name;

    // Strict double-click guard
    if (completedIndexes.has(index) || skippedIndexes.has(index)) return;

    const pointsEarned = calculateChallengePoints(difficulty, isBonus);

    // Update completed indexes
    setCompletedIndexes((prev) => new Set([...prev, index]));

    // Update score immediately
    setScores((prev) => {
      const current = prev[playerName] || { points: 0, completed: 0, skipped: 0 };
      return {
        ...prev,
        [playerName]: {
          points: current.points + pointsEarned,
          completed: current.completed + 1,
          skipped: current.skipped,
        },
      };
    });
  };

  /**
   * Idempotent Challenge Skip:
   * 0 points awarded; tracks skipped count.
   */
  const handleSkip = () => {
    if (activeAssignment == null) return;
    const index = activeAssignment.index;
    const playerName = activeAssignment.name;

    // Strict double-click guard
    if (completedIndexes.has(index) || skippedIndexes.has(index)) return;

    setSkippedIndexes((prev) => new Set([...prev, index]));

    setScores((prev) => {
      const current = prev[playerName] || { points: 0, completed: 0, skipped: 0 };
      return {
        ...prev,
        [playerName]: {
          points: current.points,
          completed: current.completed,
          skipped: current.skipped + 1,
        },
      };
    });
  };

  // Progress subtitle
  const subtitle = allDone
    ? "🎊 All challenges resolved! Check the final results below!"
    : `${modeMetadata.hint} (${revealed}/${total} opened)`;

  // If game is over and user opened results
  if (isGameOverScreen) {
    return (
      <GameOver
        scores={scores}
        onPlayAgain={() => {
          setIsGameOverScreen(false);
          hasSavedHistoryRef.current = false;
          onPlayAgain();
        }}
        onEditSetup={onRestart}
        onResetGame={onResetGame}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
    );
  }

  return (
    <div className="game-wrapper">
      {/* ── Header ── */}
      <header className="game-header">
        <div className="game-header-top">
          <div className="game-mode-pill">
            <span className="mode-pill-icon">{modeMetadata.icon}</span>
            <span className="mode-pill-text">{modeMetadata.name}</span>
          </div>

          <button
            type="button"
            className="sound-toggle-btn header-sound-btn"
            onClick={handleToggleMute}
            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>

        <h1 className="game-title">🎁 MysteryBox</h1>
        <p className="game-subtitle">{subtitle}</p>

        {/* Progress bar + counters */}
        <div className="game-progress">
          <div className="progress-counters">
            <span className="counter counter--revealed">
              👀 {revealed} revealed
            </span>
            <span className="counter counter--completed">
              ✅ {completed} completed
            </span>
            <span className="counter counter--skipped">
              ⏭ {skipped} skipped
            </span>
          </div>

          <div
            className="progress-bar-track"
            role="progressbar"
            aria-valuenow={completed + skipped}
            aria-valuemin={0}
            aria-valuemax={total}
          >
            {/* Completed segment */}
            <div
              className="progress-bar-fill progress-bar-fill--completed"
              style={{ width: `${(completed / total) * 100}%` }}
            />
            {/* Skipped segment */}
            <div
              className="progress-bar-fill progress-bar-fill--skipped"
              style={{
                width: `${(skipped / total) * 100}%`,
                left: `${(completed / total) * 100}%`,
              }}
            />
          </div>
          <span className="progress-label">
            {completed + skipped} / {total} resolved
          </span>
        </div>
      </header>

      {/* ── Live Scoreboard ── */}
      <Scoreboard
        scores={scores}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* ── All Done Banner if completed ── */}
      {allDone && (
        <div className="all-done-banner">
          <span>🎉 All boxes opened!</span>
          <button
            type="button"
            className="btn btn-primary view-results-btn"
            onClick={() => setIsGameOverScreen(true)}
          >
            🏆 View Final Results & Winners!
          </button>
        </div>
      )}

      {/* ── Gift box grid ── */}
      <div
        className="gift-box-container"
        role="list"
        aria-label="Player mystery boxes"
      >
        {assignments.map((assignment, idx) => (
          <div key={`box-${assignment.name}-${idx}`} role="listitem">
            <GiftBox
              assignment={assignment}
              index={idx}
              onOpen={(a) => handleOpen(a, idx)}
              isOpened={openedIndexes.has(idx)}
              isCompleted={completedIndexes.has(idx)}
              isSkipped={skippedIndexes.has(idx)}
            />
          </div>
        ))}
      </div>

      {/* ── Bottom Controls ── */}
      <div className="game-bottom-actions">
        {allDone && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsGameOverScreen(true)}
          >
            🏆 Results & Podium
          </button>
        )}
        <button
          type="button"
          className="btn btn-restart"
          onClick={onRestart}
          title="Return to setup while keeping current player names"
        >
          🔄 Edit Setup
        </button>
        {onResetGame && (
          <button
            type="button"
            className="btn btn-secondary reset-game-btn"
            onClick={() => {
              if (window.confirm("Are you sure you want to start a brand new game? Active progress will be cleared.")) {
                onResetGame();
              }
            }}
            title="Clear saved game and start a fresh setup"
          >
            ✨ New Game
          </button>
        )}
      </div>

      {/* ── Privacy & Storage Note ── */}
      <p className="game-storage-notice">
        💾 Progress saved locally in this browser. Game data is private to your device.
      </p>

      {/* ── Reveal Modal ── */}
      <RevealModal
        assignment={activeAssignment}
        onClose={handleClose}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    </div>
  );
}
