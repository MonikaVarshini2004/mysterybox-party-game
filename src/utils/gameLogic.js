/**
 * gameLogic.js
 * Pure utility functions for the MysteryBox game.
 * No React, no DOM — safe to unit-test in isolation.
 */

import { DARES } from "../data/dares.js";
import { TRUTHS } from "../data/truths.js";
import { SURPRISES } from "../data/surprises.js";

// ─────────────────────────────────────────────
// 1. Fisher-Yates shuffle (proper, unbiased)
// ─────────────────────────────────────────────
/**
 * Returns a NEW array that is a Fisher-Yates shuffle of `arr`.
 * Does NOT mutate the original.
 */
export function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─────────────────────────────────────────────
// 2. Sattolo's Algorithm – guaranteed derangement
//    O(n), no retries, no unbounded loops.
//    Every element moves to a different position.
// ─────────────────────────────────────────────
/**
 * Returns a NEW array that is a valid derangement of `arr`
 * using Sattolo's cycle algorithm.
 * Requires arr.length >= 2.
 */
export function derangePlayers(players) {
  if (players.length < 2) {
    throw new Error("derangePlayers requires at least 2 players.");
  }
  const result = [...players];
  // Sattolo: pick j strictly less than i (not equal), guaranteeing a single cycle
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i); // note: i (exclusive), not i+1
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─────────────────────────────────────────────
// 3. Input validation
// ─────────────────────────────────────────────
/**
 * Validates the player list.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validatePlayers(players) {
  const trimmed = players.map((p) => p.trim());

  if (trimmed.length < 3) {
    return { valid: false, error: "You need at least 3 players to play." };
  }

  const empty = trimmed.filter((p) => p === "");
  if (empty.length > 0) {
    return { valid: false, error: "All player name fields must be filled in." };
  }

  const unique = new Set(trimmed.map((p) => p.toLowerCase()));
  if (unique.size !== trimmed.length) {
    return { valid: false, error: "Player names must be unique (case-insensitive)." };
  }

  return { valid: true };
}

/**
 * Validates the dares list against the player count.
 * Returns { valid: true } or { valid: false, error: string }.
 */
export function validateDares(dares, playerCount) {
  if (!Array.isArray(dares) || dares.length === 0) {
    return { valid: false, error: "Dare list cannot be empty." };
  }
  if (dares.length < playerCount) {
    return {
      valid: false,
      error: `You need at least ${playerCount} dares for ${playerCount} players (you have ${dares.length}). Add more or clear the field to use the built-in defaults.`,
    };
  }
  return { valid: true };
}

// ─────────────────────────────────────────────
// 4. Build assignments across all 3 game modes
// ─────────────────────────────────────────────
/**
 * Builds assignments for the selected game mode:
 * - "secret": deranged player gifting + assigned dare
 * - "truth": truth or dare with dynamic challenge selection
 * - "surprise": unpredictable surprise challenge, group event, or bonus card
 *
 * @param {string[]} players           Trimmed, unique player names (min 3)
 * @param {string[]|object[]} dares    Trimmed dare strings or challenge objects
 * @param {string} mode                "secret" | "truth" | "surprise"
 * @param {object[]} customChallenges  Optional array of validated custom challenges
 * @returns {Array<object>}
 */
export function buildAssignments(players, dares, mode = "secret", customChallenges = []) {
  const pv = validatePlayers(players);
  if (!pv.valid) throw new Error(pv.error);

  // If dares is explicitly provided with items, use it; otherwise fallback to default DARES
  const rawDares = (!Array.isArray(dares) || dares.length === 0)
    ? DARES.map((d) => d.text)
    : dares;

  // 1. Secret Assignment Mode
  if (mode === "secret") {
    const dv = validateDares(rawDares, players.length);
    if (!dv.valid) throw new Error(dv.error);

    const deranged = derangePlayers(players);
    const shuffledDares = shuffleArray(rawDares).slice(0, players.length);

    return players.map((player, idx) => {
      const dareItem = shuffledDares[idx];
      const dareText = typeof dareItem === "object" ? dareItem.text : dareItem;
      // find metadata if available
      const meta = DARES.find((d) => d.text === dareText) || {};

      return {
        id: `secret-${idx}`,
        name: player,
        secret: deranged[idx],
        dare: dareText,
        difficulty: meta.difficulty || "Medium",
        category: meta.category || "creative",
        mode: "secret",
      };
    });
  }

  // 2. Truth or Dare Mode
  if (mode === "truth") {
    // Combine standard truths/dares with custom challenges
    const customTruths = customChallenges.filter((c) => c.type === "truth");
    const customDares = customChallenges.filter((c) => c.type === "dare");

    const truthPool = shuffleArray([...TRUTHS, ...customTruths]);
    const darePool = shuffleArray([...DARES, ...customDares]);
    const surprisePool = shuffleArray([...SURPRISES]);

    return players.map((player, idx) => {
      const defaultDare = darePool[idx % darePool.length];
      const defaultTruth = truthPool[idx % truthPool.length];
      const defaultSurprise = surprisePool[idx % surprisePool.length];

      return {
        id: `truth-${idx}`,
        name: player,
        secret: null,
        dare: defaultDare.text,
        truth: defaultTruth.text,
        surprise: defaultSurprise.text,
        challenge: defaultDare.text, // initial preview
        challengeType: "dare",
        difficulty: defaultDare.difficulty || "Medium",
        category: defaultDare.category || "funny",
        mode: "truth",
      };
    });
  }

  // 3. Surprise Challenge Mode
  if (mode === "surprise") {
    const customSurprises = customChallenges.filter((c) => c.type === "surprise");
    const combinedSurprises = shuffleArray([...SURPRISES, ...customSurprises]);

    return players.map((player, idx) => {
      const surprise = combinedSurprises[idx % combinedSurprises.length];

      return {
        id: `surprise-${idx}`,
        name: player,
        secret: null,
        dare: surprise.text,
        surpriseType: surprise.subType || "Surprise Event",
        rules: surprise.rules || "Follow the surprise instructions with enthusiasm!",
        difficulty: surprise.difficulty || "Medium",
        category: surprise.category || "group",
        mode: "surprise",
      };
    });
  }

  // Fallback to secret mode if unknown mode
  return buildAssignments(players, rawDares, "secret", customChallenges);
}
