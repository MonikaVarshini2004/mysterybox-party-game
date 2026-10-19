/**
 * storage.js
 * Manages localStorage persistence for MysteryBox.
 *
 * Saves and restores:
 * - Current player names and setup config
 * - Game mode
 * - Assignments
 * - Box-opening status (revealed, completed, skipped)
 * - Player scores and round progress
 * - Match history
 *
 * Requirements:
 * - Safe validation against corrupted, missing, or outdated schema
 * - In-memory fallback for sandboxed/test/Node environments
 * - Privacy notice: local to browser, no sensitive data stored
 */

export const STORAGE_VERSION = 1;
export const STORAGE_KEY_ACTIVE_GAME = "mysterybox_active_game";
export const STORAGE_KEY_CONFIG = "mysterybox_last_config";
export const STORAGE_KEY_HISTORY = "mysterybox_game_history";
export const MAX_HISTORY_ITEMS = 15;

// In-memory fallback store for Node testing or restricted browsers
const memoryStore = new Map();

/**
 * Returns safe storage provider with memory fallback
 */
export function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const testKey = "__mb_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch {
      // LocalStorage access restricted (e.g. strict iframe or private browsing)
    }
  }
  return {
    getItem: (key) => (memoryStore.has(key) ? memoryStore.get(key) : null),
    setItem: (key, val) => memoryStore.set(key, String(val)),
    removeItem: (key) => memoryStore.delete(key),
    clear: () => memoryStore.clear(),
  };
}

/**
 * Validates saved game state schema safely.
 * Returns true if valid, false if corrupted or outdated.
 *
 * @param {any} data
 * @returns {boolean}
 */
export function validateSavedGameState(data) {
  if (!data || typeof data !== "object") return false;
  if (data.version !== STORAGE_VERSION) return false;

  // Validate assignments
  if (!Array.isArray(data.assignments) || data.assignments.length < 2) return false;
  const total = data.assignments.length;

  for (const item of data.assignments) {
    if (!item || typeof item !== "object" || typeof item.name !== "string" || !item.name.trim()) {
      return false;
    }
  }

  // Validate mode
  const validModes = ["secret", "truth", "surprise"];
  if (!validModes.includes(data.gameMode)) return false;

  // Validate index sets / arrays
  const isValidIndexList = (arr) =>
    Array.isArray(arr) &&
    arr.every((idx) => typeof idx === "number" && idx >= 0 && idx < total && Number.isInteger(idx));

  if (!isValidIndexList(data.openedIndexes)) return false;
  if (!isValidIndexList(data.completedIndexes)) return false;
  if (!isValidIndexList(data.skippedIndexes)) return false;

  // Validate scores
  if (!data.scores || typeof data.scores !== "object") return false;
  for (const item of data.assignments) {
    const sc = data.scores[item.name];
    if (
      !sc ||
      typeof sc !== "object" ||
      typeof sc.points !== "number" ||
      typeof sc.completed !== "number" ||
      typeof sc.skipped !== "number" ||
      sc.points < 0 ||
      sc.completed < 0 ||
      sc.skipped < 0
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Saves current active game progress to storage.
 *
 * @param {object} gameState
 * @param {Array<object>} gameState.assignments
 * @param {string} gameState.gameMode
 * @param {Set<number>|Array<number>} gameState.openedIndexes
 * @param {Set<number>|Array<number>} gameState.completedIndexes
 * @param {Set<number>|Array<number>} gameState.skippedIndexes
 * @param {Record<string, { points: number, completed: number, skipped: number }>} gameState.scores
 * @param {boolean} [gameState.isGameOverScreen=false]
 * @param {object} [gameState.lastConfig=null]
 */
export function saveActiveGame(gameState) {
  try {
    const storage = getStorage();
    const payload = {
      version: STORAGE_VERSION,
      updatedAt: Date.now(),
      assignments: gameState.assignments,
      gameMode: gameState.gameMode,
      openedIndexes: Array.from(gameState.openedIndexes || []),
      completedIndexes: Array.from(gameState.completedIndexes || []),
      skippedIndexes: Array.from(gameState.skippedIndexes || []),
      scores: gameState.scores,
      isGameOverScreen: Boolean(gameState.isGameOverScreen),
      lastConfig: gameState.lastConfig || null,
    };

    if (validateSavedGameState(payload)) {
      storage.setItem(STORAGE_KEY_ACTIVE_GAME, JSON.stringify(payload));
      return true;
    }
  } catch (err) {
    console.warn("MysteryBox: Failed to save active game state to storage", err);
  }
  return false;
}

/**
 * Loads and restores active game progress if valid.
 * Returns null if missing, corrupted, or outdated.
 *
 * @returns {object|null}
 */
export function loadActiveGame() {
  try {
    const storage = getStorage();
    const raw = storage.getItem(STORAGE_KEY_ACTIVE_GAME);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!validateSavedGameState(parsed)) {
      // Clear corrupt or outdated state
      storage.removeItem(STORAGE_KEY_ACTIVE_GAME);
      return null;
    }

    return {
      assignments: parsed.assignments,
      gameMode: parsed.gameMode,
      openedIndexes: new Set(parsed.openedIndexes),
      completedIndexes: new Set(parsed.completedIndexes),
      skippedIndexes: new Set(parsed.skippedIndexes),
      scores: parsed.scores,
      isGameOverScreen: parsed.isGameOverScreen,
      lastConfig: parsed.lastConfig,
      updatedAt: parsed.updatedAt,
    };
  } catch (err) {
    console.warn("MysteryBox: Error loading saved game state", err);
    try {
      getStorage().removeItem(STORAGE_KEY_ACTIVE_GAME);
    } catch {}
    return null;
  }
}

/**
 * Checks if a valid active game is saved.
 * @returns {boolean}
 */
export function hasSavedGame() {
  return loadActiveGame() !== null;
}

/**
 * Clears active game state from storage (e.g. for New Game or Reset).
 */
export function clearActiveGame() {
  try {
    getStorage().removeItem(STORAGE_KEY_ACTIVE_GAME);
    return true;
  } catch (err) {
    console.warn("MysteryBox: Error clearing active game", err);
    return false;
  }
}

/**
 * Saves setup configuration so players don't have to re-enter names on refresh or restart.
 * @param {object} config { players, dares, mode, customChallenges }
 */
export function saveLastConfig(config) {
  try {
    if (!config || !Array.isArray(config.players)) return;
    const storage = getStorage();
    storage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.warn("MysteryBox: Error saving setup config", err);
  }
}

/**
 * Loads saved setup configuration.
 * @returns {object|null}
 */
export function loadLastConfig() {
  try {
    const storage = getStorage();
    const raw = storage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.players) && parsed.players.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn("MysteryBox: Error loading setup config", err);
  }
  return null;
}

/**
 * Saves completed round summary to local match history.
 *
 * @param {object} summary
 * @param {string} summary.gameMode
 * @param {Array<string>} summary.players
 * @param {Array<object>} summary.winners
 * @param {number} summary.topScore
 * @param {number} summary.totalCompleted
 * @param {number} summary.totalSkipped
 */
export function saveGameToHistory(summary) {
  try {
    const storage = getStorage();
    const existing = loadGameHistory();
    const entry = {
      id: `game-${Date.now()}`,
      date: new Date().toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      gameMode: summary.gameMode || "secret",
      playersCount: summary.players?.length || 0,
      winners: summary.winners?.map((w) => w.name) || [],
      topScore: summary.topScore || 0,
      totalCompleted: summary.totalCompleted || 0,
      totalSkipped: summary.totalSkipped || 0,
    };

    const updated = [entry, ...existing].slice(0, MAX_HISTORY_ITEMS);
    storage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.warn("MysteryBox: Error saving game history", err);
    return false;
  }
}

/**
 * Loads list of completed past rounds.
 * @returns {Array<object>}
 */
export function loadGameHistory() {
  try {
    const storage = getStorage();
    const raw = storage.getItem(STORAGE_KEY_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Clears match history.
 */
export function clearGameHistory() {
  try {
    getStorage().removeItem(STORAGE_KEY_HISTORY);
    return true;
  } catch {
    return false;
  }
}
