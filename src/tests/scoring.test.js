import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateChallengePoints,
  initializePlayerScores,
  calculateRankings,
  getWinners,
  DIFFICULTY_POINTS,
  BONUS_SURPRISE_POINTS,
} from "../utils/scoring.js";
import {
  getSoundMuted,
  setSoundMuted,
} from "../utils/soundEffects.js";

describe("Scoring System Calculations", () => {
  test("awards exact points per difficulty", () => {
    assert.equal(calculateChallengePoints("Easy"), 10);
    assert.equal(calculateChallengePoints("Medium"), 20);
    assert.equal(calculateChallengePoints("Hard"), 30);
    assert.equal(DIFFICULTY_POINTS.Easy, 10);
    assert.equal(DIFFICULTY_POINTS.Medium, 20);
    assert.equal(DIFFICULTY_POINTS.Hard, 30);
  });

  test("awards extra bonus points for special surprise challenges", () => {
    assert.equal(
      calculateChallengePoints("Medium", true),
      20 + BONUS_SURPRISE_POINTS
    );
    assert.equal(
      calculateChallengePoints("Hard", true),
      30 + BONUS_SURPRISE_POINTS
    );
  });

  test("initializes player scores with 0 points, 0 completed, 0 skipped", () => {
    const scores = initializePlayerScores(["Alice", "Bob", "Charlie"]);
    assert.deepEqual(scores.Alice, { points: 0, completed: 0, skipped: 0 });
    assert.deepEqual(scores.Bob, { points: 0, completed: 0, skipped: 0 });
    assert.deepEqual(scores.Charlie, { points: 0, completed: 0, skipped: 0 });
  });

  test("does not award completion points for skipped challenges", () => {
    const scores = {
      Alice: { points: 0, completed: 0, skipped: 1 },
      Bob: { points: 20, completed: 1, skipped: 0 },
    };
    assert.equal(scores.Alice.points, 0);
    assert.equal(scores.Bob.points, 20);
  });
});

describe("Ranking System and Tie Handling", () => {
  test("accurately ranks players with distinct scores", () => {
    const scores = {
      Alice: { points: 30, completed: 1, skipped: 0 },
      Bob: { points: 50, completed: 2, skipped: 0 },
      Charlie: { points: 10, completed: 1, skipped: 1 },
    };

    const ranked = calculateRankings(scores);
    assert.equal(ranked[0].name, "Bob");
    assert.equal(ranked[0].rank, 1);
    assert.equal(ranked[0].rankLabel, "1st");

    assert.equal(ranked[1].name, "Alice");
    assert.equal(ranked[1].rank, 2);
    assert.equal(ranked[1].rankLabel, "2nd");

    assert.equal(ranked[2].name, "Charlie");
    assert.equal(ranked[2].rank, 3);
    assert.equal(ranked[2].rankLabel, "3rd");
  });

  test("accurately handles ties for 1st place", () => {
    const scores = {
      Alice: { points: 40, completed: 2, skipped: 0 },
      Bob: { points: 40, completed: 2, skipped: 0 },
      Charlie: { points: 20, completed: 1, skipped: 1 },
    };

    const ranked = calculateRankings(scores);
    // Both Alice and Bob should be Rank 1
    assert.equal(ranked[0].rank, 1);
    assert.equal(ranked[1].rank, 1);
    assert.equal(ranked[2].rank, 3);

    const { winners, isTie, topScore } = getWinners(ranked);
    assert.equal(isTie, true);
    assert.equal(winners.length, 2);
    assert.equal(topScore, 40);
    const winnerNames = winners.map((w) => w.name);
    assert.ok(winnerNames.includes("Alice"));
    assert.ok(winnerNames.includes("Bob"));
  });

  test("accurately determines a single winner", () => {
    const scores = {
      Alice: { points: 50, completed: 2, skipped: 0 },
      Bob: { points: 30, completed: 1, skipped: 1 },
    };

    const ranked = calculateRankings(scores);
    const { winners, isTie, topScore } = getWinners(ranked);
    assert.equal(isTie, false);
    assert.equal(winners.length, 1);
    assert.equal(winners[0].name, "Alice");
    assert.equal(topScore, 50);
  });
});

describe("Sound Mute Control", () => {
  test("toggles and persists mute state cleanly", () => {
    setSoundMuted(true);
    assert.equal(getSoundMuted(), true);

    setSoundMuted(false);
    assert.equal(getSoundMuted(), false);

    const toggled = setSoundMuted();
    assert.equal(toggled, true);
    assert.equal(getSoundMuted(), true);

    // Reset back to unmuted
    setSoundMuted(false);
    assert.equal(getSoundMuted(), false);
  });
});
