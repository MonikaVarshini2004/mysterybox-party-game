/**
 * scoring.js
 * Pure scoring calculation and ranking utilities.
 * Easy: 10 pts, Medium: 20 pts, Hard: 30 pts, Bonus: +15 pts.
 * Skipped challenges receive 0 points.
 */

export const DIFFICULTY_POINTS = {
  Easy: 10,
  Medium: 20,
  Hard: 30,
};

export const BONUS_SURPRISE_POINTS = 15;

/**
 * Calculates points awarded for a challenge completion.
 * @param {string} [difficulty="Medium"] "Easy" | "Medium" | "Hard"
 * @param {boolean} [isBonus=false] Whether this is a special bonus surprise
 * @returns {number} Points earned
 */
export function calculateChallengePoints(difficulty = "Medium", isBonus = false) {
  const basePoints = DIFFICULTY_POINTS[difficulty] || DIFFICULTY_POINTS.Medium;
  return isBonus ? basePoints + BONUS_SURPRISE_POINTS : basePoints;
}

/**
 * Initializes empty score records for a list of player names.
 * @param {string[]} playerNames
 * @returns {Record<string, { points: number, completed: number, skipped: number }>}
 */
export function initializePlayerScores(playerNames) {
  const scores = {};
  playerNames.forEach((name) => {
    scores[name] = {
      points: 0,
      completed: 0,
      skipped: 0,
    };
  });
  return scores;
}

/**
 * Calculates player rankings from scores.
 * Handles ties accurately using standard competition ranking (1224 ranking).
 *
 * @param {Record<string, { points: number, completed: number, skipped: number }>} playerScores
 * @returns {Array<{ name: string, points: number, completed: number, skipped: number, rank: number, rankLabel: string }>}
 */
export function calculateRankings(playerScores) {
  if (!playerScores || typeof playerScores !== "object") return [];

  // Convert to array and sort descending by points, then by completed descending, then by skipped ascending
  const playerList = Object.entries(playerScores).map(([name, data]) => ({
    name,
    points: data.points || 0,
    completed: data.completed || 0,
    skipped: data.skipped || 0,
  }));

  playerList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.completed !== a.completed) return b.completed - a.completed;
    return a.skipped - b.skipped;
  });

  // Calculate ranks handling ties
  let currentRank = 1;
  const ranked = [];

  for (let i = 0; i < playerList.length; i++) {
    if (i > 0) {
      const prev = playerList[i - 1];
      const curr = playerList[i];
      if (curr.points !== prev.points) {
        currentRank = i + 1;
      }
    }

    const rankSuffix =
      currentRank === 1
        ? "1st"
        : currentRank === 2
        ? "2nd"
        : currentRank === 3
        ? "3rd"
        : `${currentRank}th`;

    ranked.push({
      ...playerList[i],
      rank: currentRank,
      rankLabel: rankSuffix,
    });
  }

  return ranked;
}

/**
 * Identifies the winning player(s).
 * Handles ties cleanly.
 *
 * @param {Array<object>} rankedPlayers
 * @returns {{ winners: Array<object>, isTie: boolean, topScore: number }}
 */
export function getWinners(rankedPlayers) {
  if (!Array.isArray(rankedPlayers) || rankedPlayers.length === 0) {
    return { winners: [], isTie: false, topScore: 0 };
  }

  const topScore = rankedPlayers[0].points;
  const winners = rankedPlayers.filter((p) => p.points === topScore);

  return {
    winners,
    isTie: winners.length > 1,
    topScore,
  };
}
