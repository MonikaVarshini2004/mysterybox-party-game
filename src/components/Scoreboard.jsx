import { useState } from "react";
import { calculateRankings } from "../utils/scoring.js";
import "./Scoreboard.css";

/**
 * Scoreboard
 * Reusable leaderboard component tracking points, completed, skipped, and rankings.
 *
 * Props:
 *   scores: Record<string, { points: number, completed: number, skipped: number }>
 *   isMuted?: boolean
 *   onToggleMute?: () => void
 *   compactDefault?: boolean
 */
export default function Scoreboard({
  scores,
  isMuted = false,
  onToggleMute,
  compactDefault = false,
}) {
  const [isExpanded, setIsExpanded] = useState(!compactDefault);
  const rankings = calculateRankings(scores);

  const getMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <aside
      className={`scoreboard-container ${isExpanded ? "scoreboard--expanded" : "scoreboard--collapsed"}`}
      aria-label="Live Game Scoreboard"
    >
      <div className="scoreboard-header">
        <button
          type="button"
          className="scoreboard-toggle-btn"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          aria-controls="scoreboard-list"
          title={isExpanded ? "Collapse Leaderboard" : "Expand Leaderboard"}
        >
          <span className="scoreboard-title-icon" aria-hidden="true">🏆</span>
          <span className="scoreboard-title">Live Scoreboard</span>
          <span className="scoreboard-toggle-arrow" aria-hidden="true">
            {isExpanded ? "▲" : "▼"}
          </span>
        </button>

        {onToggleMute && (
          <button
            type="button"
            className="sound-toggle-btn"
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        )}
      </div>

      {isExpanded && (
        <div id="scoreboard-list" className="scoreboard-body">
          <div className="scoreboard-grid" role="list">
            {rankings.map((player) => {
              const isFirst = player.rank === 1;
              return (
                <div
                  key={player.name}
                  className={`score-card ${isFirst ? "score-card--leader" : ""}`}
                  role="listitem"
                >
                  <div className="score-rank-col">
                    <span className="score-medal" aria-label={`Rank ${player.rank}`}>
                      {getMedal(player.rank)}
                    </span>
                  </div>

                  <div className="score-info-col">
                    <span className="score-player-name">{player.name}</span>
                    <div className="score-stats-row">
                      <span className="score-stat-pill score-stat--completed" title="Completed Challenges">
                        ✅ {player.completed}
                      </span>
                      <span className="score-stat-pill score-stat--skipped" title="Skipped Challenges">
                        ⏭ {player.skipped}
                      </span>
                    </div>
                  </div>

                  <div className="score-points-col">
                    <strong className="score-points-num">{player.points}</strong>
                    <span className="score-points-label">pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
