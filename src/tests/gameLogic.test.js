import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  shuffleArray,
  derangePlayers,
  validatePlayers,
  validateDares,
  buildAssignments,
} from "../utils/gameLogic.js";
import {
  CHALLENGES,
  validateCustomChallenge,
  getChallengeByType,
  randomItem,
} from "../data/challenges.js";
import { DARES, DEFAULT_DARES } from "../data/dares.js";
import { TRUTHS, DEFAULT_TRUTHS } from "../data/truths.js";
import { SURPRISES } from "../data/surprises.js";

describe("Data Collections", () => {
  test("Dares collection contains Easy, Medium, and Hard challenges", () => {
    assert.ok(DARES.length >= 15);
    const difficulties = new Set(DARES.map((d) => d.difficulty));
    assert.ok(difficulties.has("Easy"));
    assert.ok(difficulties.has("Medium"));
    assert.ok(difficulties.has("Hard"));

    const categories = new Set(DARES.map((d) => d.category));
    assert.ok(categories.has("acting"));
    assert.ok(categories.has("singing"));
    assert.ok(categories.has("dancing"));
    assert.ok(categories.has("funny"));
    assert.ok(categories.has("quick-thinking"));

    assert.equal(DEFAULT_DARES.length, DARES.length);
  });

  test("Truths collection contains Easy, Medium, and Hard safe voluntary questions", () => {
    assert.ok(TRUTHS.length >= 15);
    const difficulties = new Set(TRUTHS.map((t) => t.difficulty));
    assert.ok(difficulties.has("Easy"));
    assert.ok(difficulties.has("Medium"));
    assert.ok(difficulties.has("Hard"));

    assert.equal(DEFAULT_TRUTHS.length, TRUTHS.length);
  });

  test("Surprises collection contains Group challenges and Bonus events", () => {
    assert.ok(SURPRISES.length >= 10);
    assert.ok(CHALLENGES.surprise.length >= 10);
    const types = new Set(SURPRISES.map((s) => s.type));
    assert.ok(types.has("group"));
    assert.ok(types.has("bonus"));

    // Check each has rules
    SURPRISES.forEach((s) => {
      assert.ok(s.rules && s.rules.length > 5, `Surprise ${s.id} should have clear rules`);
    });
  });

  test("validatePlayers and validateDares utility validation", () => {
    assert.equal(validatePlayers(["Alice", "Bob"]).valid, false);
    assert.equal(validatePlayers(["Alice", "Bob", ""]).valid, false);
    assert.equal(validatePlayers(["Alice", "Bob", "alice"]).valid, false);
    assert.equal(validatePlayers(["Alice", "Bob", "Charlie"]).valid, true);

    assert.equal(validateDares([], 3).valid, false);
    assert.equal(validateDares(["d1", "d2"], 3).valid, false);
    assert.equal(validateDares(["d1", "d2", "d3"], 3).valid, true);
  });
});

describe("Custom Challenge Validation", () => {
  test("rejects invalid, empty, or too short input", () => {
    assert.equal(validateCustomChallenge(null).valid, false);
    assert.equal(validateCustomChallenge({ text: "" }).valid, false);
    assert.equal(validateCustomChallenge({ text: "abc" }).valid, false);
  });

  test("rejects overly long challenge text (> 250 chars)", () => {
    const longText = "a".repeat(251);
    assert.equal(validateCustomChallenge({ text: longText }).valid, false);
  });

  test("accepts and sanitizes valid challenge input", () => {
    const valid = validateCustomChallenge({
      text: "  Sing like an opera singer for 30 seconds!  ",
      difficulty: "Hard",
      type: "dare",
      category: "singing",
    });
    assert.equal(valid.valid, true);
    assert.equal(valid.sanitized.text, "Sing like an opera singer for 30 seconds!");
    assert.equal(valid.sanitized.difficulty, "Hard");
    assert.equal(valid.sanitized.type, "dare");
    assert.equal(valid.sanitized.category, "singing");
    assert.equal(valid.sanitized.isCustom, true);
  });
});

describe("Game Mode 1: Secret Assignment", () => {
  const players = ["Alice", "Bob", "Charlie", "Diana"];
  const dares = [
    "Dare 1",
    "Dare 2",
    "Dare 3",
    "Dare 4",
  ];

  test("nobody receives themselves (guaranteed derangement)", () => {
    for (let trial = 0; trial < 50; trial++) {
      const assignments = buildAssignments(players, dares, "secret");
      assert.equal(assignments.length, players.length);
      assignments.forEach((a) => {
        assert.notEqual(
          a.name,
          a.secret,
          `Derangement violation: ${a.name} received themselves on trial ${trial}`
        );
        assert.ok(a.dare, "Each assignment must have a dare");
        assert.equal(a.mode, "secret");
      });
    }
  });

  test("enforces minimum 3 players", () => {
    assert.throws(() => buildAssignments(["Alice", "Bob"], dares, "secret"));
  });

  test("enforces enough dares for player count", () => {
    assert.throws(() => buildAssignments(players, ["Only 1 dare"], "secret"));
  });
});

describe("Game Mode 2: Truth or Dare", () => {
  const players = ["Alice", "Bob", "Charlie"];

  test("assigns truth, dare, and surprise options for each player", () => {
    const assignments = buildAssignments(players, [], "truth");
    assert.equal(assignments.length, 3);
    assignments.forEach((a) => {
      assert.equal(a.mode, "truth");
      assert.ok(a.dare, "Has dare option");
      assert.ok(a.truth, "Has truth option");
      assert.ok(a.surprise, "Has surprise option");
      assert.ok(a.difficulty, "Has difficulty label");
      assert.ok(a.category, "Has category");
    });
  });

  test("incorporates custom challenges into Truth or Dare pool", () => {
    const custom = [
      {
        id: "c1",
        text: "Custom Truth: What is your secret superpower?",
        difficulty: "Easy",
        type: "truth",
        category: "creative",
      },
      {
        id: "c2",
        text: "Custom Dare: Balance a spoon on your nose!",
        difficulty: "Medium",
        type: "dare",
        category: "funny",
      },
    ];

    const challenge = getChallengeByType("truth", null, custom);
    assert.ok(challenge, "Challenge should be retrieved");
  });
});

describe("Game Mode 3: Surprise Challenge", () => {
  const players = ["Alice", "Bob", "Charlie", "David"];

  test("assigns unpredictable surprises with clear rules and categories", () => {
    const assignments = buildAssignments(players, [], "surprise");
    assert.equal(assignments.length, 4);
    assignments.forEach((a) => {
      assert.equal(a.mode, "surprise");
      assert.ok(a.dare, "Has surprise action text");
      assert.ok(a.rules, "Has clear rules");
      assert.ok(a.surpriseType, "Has surprise type badge");
      assert.ok(a.difficulty, "Has difficulty label");
      assert.ok(a.category, "Has category");
    });
  });
});

describe("Utility Functions", () => {
  test("derangePlayers rejects < 2 players", () => {
    assert.throws(() => derangePlayers(["Single"]));
  });

  test("shuffleArray produces a new array without mutating original", () => {
    const orig = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(orig);
    assert.notEqual(orig, shuffled);
    assert.equal(shuffled.length, orig.length);
    assert.deepEqual(orig, [1, 2, 3, 4, 5]);
  });

  test("randomItem returns null for empty array and item for non-empty", () => {
    assert.equal(randomItem([]), null);
    assert.equal(randomItem([42]), 42);
  });
});
