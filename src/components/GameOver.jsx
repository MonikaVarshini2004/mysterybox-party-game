import { useEffect, useState } from "react";
import { calculateRankings, getWinners } from "../utils/scoring.js";
import { playWinnerSound } from "../utils/soundEffects.js";
import { loadGameHistory, clearGameHistory } from "../utils/storage.js";
import "./GameOver.css";

/**
 * GameOver
 * Displays final results, highlights winner(s), shows leaderboard & challenge stats,
 * and handles "Play Again", "Edit Setup", "New Game", and "Match History".
 *
 * Props:
 *   scores       - Record<string, { points, completed, skipped }>
 *   onPlayAgain  - () => void
 *   onEditSetup  - () => void
 *   onResetGame  - () => void
 *   isMuted      - boolean
 *   onToggleMute - () => void
 */
export default function GameOver({
  scores,
  onPlayAgain,
  onEditSetup,
  onResetGame,
  isMuted,
  onToggleMute,
}) {
  const ranked = calculateRankings(scores);
  const { winners, isTie, topScore } = getWinners(ranked);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => loadGameHistory());

  // Play celebratory sound on mount
  useEffect(() => {
    playWinnerSound();
  }, []);

  // Compute game-wide totals
  const totalCompleted = ranked.reduce((acc, p) => acc + p.completed, 0);
  const totalSkipped = ranked.reduce((acc, p) => acc + p.skipped, 0);
  const totalPoints = ranked.reduce((acc, p) => acc + p.points, 0);

  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇 1st";
    if (rank === 2) return "🥈 2nd";
    if (rank === 3) return "🥉 3rd";
    return `#${rank}`;
  };

  const handleClearHistory = () => {
    clearGameHistory();
    setHistory([]);
  };

  return (
    <div className="gameover-wrapper" role="region" aria-label="Game Results Screen">
      {/* ── Floating Confetti & Sparkles ── */}
      <div className="gameover-sparkles" aria-hidden="true">
        <span className="sparkle s1">✨</span>
        <span className="sparkle s2">🎉</span>
        <span className="sparkle s3">🎊</span>
        <span className="sparkle s4">⭐</span>
        <span className="sparkle s5">🎈</span>
        <span className="sparkle s6">🌟</span>
      </div>

      <div className="gameover-card">
        {/* Header */}
        <div className="gameover-header">
          <div className="gameover-top-bar">
            {onToggleMute && (
              <button
                type="button"
                className="gameover-sound-btn"
                onClick={onToggleMute}
                aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                title={isMuted ? "Unmute sound" : "Mute sound"}
              >
                {isMuted ? "🔇" : "🔊"}
              </button>
            )}
          </div>

          <div className="trophy-icon" aria-hidden="true">🏆</div>
          <h1 className="gameover-title">Game Over!</h1>
          <p className="gameover-subtitle">What an incredible round of MysteryBox!</p>
        </div>

        {/* ── Winner Banner (Handles Ties Correctly) ── */}
        <div className={`winner-banner ${isTie ? "winner-banner--tie" : ""}`}>
          <div className="winner-crown" aria-hidden="true">👑</div>
          <h2 className="winner-heading">
            {isTie ? "🎉 It's a Tie for 1st Place! 🎉" : "🌟 Champion Winner! 🌟"}
          </h2>
          <div className="winner-names">
            {winners.map((w, idx) => (
              <span key={w.name} className="winner-name-pill">
                {w.name}
                {idx < winners.length - 1 && <span className="winner-and"> & </span>}
              </span>
            ))}
          </div>
          <p className="winner-score-tag">
            Score: <strong>{topScore}</strong> points
          </p>
        </div>

        {/* ── Summary Stats Row ── */}
        <div className="gameover-stats-grid">
          <div className="stat-card">
            <span className="stat-icon" aria-hidden="true">🎯</span>
            <span className="stat-val">{totalPoints}</span>
            <span className="stat-label">Total Points</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon" aria-hidden="true">✅</span>
            <span className="stat-val">{totalCompleted}</span>
            <span className="stat-label">Dares Done</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon" aria-hidden="true">⏭</span>
            <span className="stat-val">{totalSkipped}</span>
            <span className="stat-label">Skipped</span>
          </div>
        </div>

        {/* ── Full Leaderboard ── */}
        <div className="gameover-leaderboard">
          <h3 className="leaderboard-heading">🏅 Final Leaderboard</h3>
          <div className="leaderboard-table" role="list">
            {ranked.map((player) => {
              const isWinner = winners.some((w) => w.name === player.name);
              return (
                <div
                  key={player.name}
                  className={`leaderboard-row ${isWinner ? "row--winner" : ""}`}
                  role="listitem"
                >
                  <div className="row-rank">
                    <span className="rank-badge">{getRankBadge(player.rank)}</span>
                  </div>
                  <div className="row-name">
                    <strong>{player.name}</strong>
                  </div>
                  <div className="row-completed">
                    <span className="badge-completed">✅ {player.completed}</span>
                  </div>
                  <div className="row-skipped">
                    <span className="badge-skipped">⏭ {player.skipped}</span>
                  </div>
                  <div className="row-points">
                    <strong className="points-number">{player.points}</strong>
                    <span className="points-pts">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="gameover-actions">
          <button
            type="button"
            className="btn btn-primary gameover-btn"
            onClick={onPlayAgain}
          >
            🔄 Play Again
          </button>
          <button
            type="button"
            className="btn btn-secondary gameover-btn"
            onClick={onEditSetup}
          >
            ✏️ Edit Players & Setup
          </button>
          {onResetGame && (
            <button
              type="button"
              className="btn btn-restart gameover-btn"
              onClick={onResetGame}
            >
              ✨ Start Fresh New Game
            </button>
          )}

          {/* Toggle match history */}
          {history.length > 0 && (
            <button
              type="button"
              className="gameover-history-toggle"
              onClick={() => setShowHistory((prev) => !prev)}
            >
              📜 {showHistory ? "Hide Match History" : `View Match History (${history.length} games)`}
            </button>
          )}
        </div>

        {/* ── Match History Accordion ── */}
        {showHistory && history.length > 0 && (
          <div className="gameover-history-section">
            <div className="history-header-row">
              <h4 className="history-heading">📜 Recent Rounds History</h4>
              <button
                type="button"
                className="history-clear-btn"
                onClick={handleClearHistory}
                title="Clear local match history"
              >
                Clear History
              </button>
            </div>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-top">
                    <span className="history-date">{item.date}</span>
                    <span className="history-mode-pill">{item.gameMode}</span>
                  </div>
                  <div className="history-item-details">
                    <span>🏆 Winner: <strong>{item.winners.join(", ") || "None"}</strong> ({item.topScore} pts)</span>
                    <span className="history-stats-mini">✅ {item.totalCompleted} done · ⏭ {item.totalSkipped} skipped</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Privacy disclaimer */}
        <p className="gameover-privacy-note">
          💾 Game progress & history are stored privately on your local browser.
        </p>
      </div>
    </div>
  );
}
