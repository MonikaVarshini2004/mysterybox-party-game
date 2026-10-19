import { DARES } from "./dares.js";
import { TRUTHS } from "./truths.js";
import { SURPRISES } from "./surprises.js";

/**
 * Unified CHALLENGES collection with difficulty levels & categories.
 */
export const CHALLENGES = {
  dares: DARES,
  truths: TRUTHS,
  surprise: SURPRISES,
};

/**
 * Helper: pick a random element from an array safely.
 */
export const randomItem = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Validates a user-submitted custom challenge.
 * Returns { valid: boolean, error?: string, sanitized?: object }
 */
export function validateCustomChallenge(item) {
  if (!item || typeof item !== "object") {
    return { valid: false, error: "Invalid challenge submission." };
  }

  const text = (item.text || "").trim();
  if (text.length < 5) {
    return { valid: false, error: "Challenge text must be at least 5 characters long." };
  }
  if (text.length > 250) {
    return { valid: false, error: "Challenge text must be under 250 characters." };
  }

  const validDifficulties = ["Easy", "Medium", "Hard"];
  const difficulty = validDifficulties.includes(item.difficulty)
    ? item.difficulty
    : "Medium";

  const validTypes = ["dare", "truth", "surprise"];
  const type = validTypes.includes(item.type) ? item.type : "dare";

  const validCategories = [
    "acting",
    "singing",
    "dancing",
    "funny",
    "creative",
    "quick-thinking",
    "group",
    "bonus",
  ];
  const category = validCategories.includes(item.category)
    ? item.category
    : "funny";

  return {
    valid: true,
    sanitized: {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text,
      difficulty,
      type,
      category,
      isCustom: true,
    },
  };
}

/**
 * Returns a challenge by type and difficulty, with optional custom challenge merging.
 */
export function getChallengeByType(type = "dare", difficulty = null, customList = []) {
  const pool = [...(CHALLENGES[type === "truth" ? "truths" : type === "surprise" ? "surprise" : "dares"] || [])];
  
  if (Array.isArray(customList) && customList.length > 0) {
    const matchingCustom = customList.filter((c) => c.type === type);
    pool.push(...matchingCustom);
  }

  if (difficulty) {
    const filtered = pool.filter((item) => item.difficulty === difficulty);
    if (filtered.length > 0) return randomItem(filtered);
  }

  return randomItem(pool);
}
