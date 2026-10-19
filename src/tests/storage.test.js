import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  saveActiveGame,
  loadActiveGame,
  clearActiveGame,
  validateSavedGameState,
  saveLastConfig,
  loadLastConfig,
  saveGameToHistory,
  loadGameHistory,
  clearGameHistory,
  hasSavedGame,
  getStorage,
  STORAGE_VERSION,
} from "../utils/storage.js";

describe("Storage System & Validation", () => {
  beforeEach(() => {
    getStorage().clear();
  });

  test("validates valid game state correctly", () => {
    const validState = {
      version: STORAGE_VERSION,
      gameMode: "secret",
      assignments: [
        { name: "Alice", secret: "Bob", dare: "Dance" },
        { name: "Bob", secret: "Alice", dare: "Sing" },
      ],
      openedIndexes: [0],
      completedIndexes: [0],
      skippedIndexes: [],
      scores: {
        Alice: { points: 20, completed: 1, skipped: 0 },
        Bob: { points: 0, completed: 0, skipped: 0 },
      },
    };

    assert.equal(validateSavedGameState(validState), true);
  });

  test("rejects corrupted or outdated game state", () => {
    // Missing version
    assert.equal(validateSavedGameState({ assignments: [] }), false);

    // Invalid version
    assert.equal(validateSavedGameState({ version: 999 }), false);

    // Out of bound indexes
    assert.equal(
      validateSavedGameState({
        version: STORAGE_VERSION,
        gameMode: "secret",
        assignments: [{ name: "Alice" }, { name: "Bob" }],
        openedIndexes: [99], // out of bounds
        completedIndexes: [],
        skippedIndexes: [],
        scores: { Alice: { points: 0, completed: 0, skipped: 0 } },
      }),
      false
    );

    // Missing scores
    assert.equal(
      validateSavedGameState({
        version: STORAGE_VERSION,
        gameMode: "secret",
        assignments: [{ name: "Alice" }, { name: "Bob" }],
        openedIndexes: [0],
        completedIndexes: [],
        skippedIndexes: [],
        scores: {},
      }),
      false
    );
  });

  test("saves and restores active game state accurately", () => {
    const sampleState = {
      gameMode: "truth",
      assignments: [
        { name: "Charlie", dare: "Do pushups", mode: "truth" },
        { name: "Dana", dare: "Tell a secret", mode: "truth" },
        { name: "Eve", dare: "Show dance moves", mode: "truth" },
      ],
      openedIndexes: new Set([0, 1]),
      completedIndexes: new Set([0]),
      skippedIndexes: new Set([1]),
      scores: {
        Charlie: { points: 20, completed: 1, skipped: 0 },
        Dana: { points: 0, completed: 0, skipped: 1 },
        Eve: { points: 0, completed: 0, skipped: 0 },
      },
      isGameOverScreen: false,
    };

    const saved = saveActiveGame(sampleState);
    assert.equal(saved, true);
    assert.equal(hasSavedGame(), true);

    const loaded = loadActiveGame();
    assert.ok(loaded);
    assert.equal(loaded.gameMode, "truth");
    assert.equal(loaded.assignments.length, 3);
    assert.equal(loaded.openedIndexes.has(0), true);
    assert.equal(loaded.openedIndexes.has(1), true);
    assert.equal(loaded.completedIndexes.has(0), true);
    assert.equal(loaded.skippedIndexes.has(1), true);
    assert.equal(loaded.scores.Charlie.points, 20);
    assert.equal(loaded.scores.Dana.skipped, 1);
  });

  test("clears active game state on demand", () => {
    saveActiveGame({
      gameMode: "secret",
      assignments: [{ name: "A" }, { name: "B" }],
      openedIndexes: [],
      completedIndexes: [],
      skippedIndexes: [],
      scores: {
        A: { points: 0, completed: 0, skipped: 0 },
        B: { points: 0, completed: 0, skipped: 0 },
      },
    });

    assert.equal(hasSavedGame(), true);
    clearActiveGame();
    assert.equal(hasSavedGame(), false);
    assert.equal(loadActiveGame(), null);
  });

  test("saves and loads setup config for quick replay/restart", () => {
    const config = {
      players: ["Alex", "Sam", "Taylor"],
      dares: ["Sing", "Dance", "Tell joke"],
      mode: "surprise",
      customChallenges: [],
    };

    saveLastConfig(config);
    const restored = loadLastConfig();
    assert.deepEqual(restored.players, config.players);
    assert.equal(restored.mode, "surprise");
  });

  test("records and limits match history to MAX_HISTORY_ITEMS", () => {
    clearGameHistory();
    for (let i = 1; i <= 20; i++) {
      saveGameToHistory({
        gameMode: "secret",
        players: ["P1", "P2", "P3"],
        winners: [{ name: `Winner ${i}` }],
        topScore: i * 10,
        totalCompleted: 3,
        totalSkipped: 0,
      });
    }

    const history = loadGameHistory();
    assert.equal(history.length, 15);
    // Most recent first
    assert.equal(history[0].topScore, 200);
  });
});
