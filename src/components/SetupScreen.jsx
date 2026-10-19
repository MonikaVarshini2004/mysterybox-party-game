import { useState, useCallback } from "react";
import { DEFAULT_DARES } from "../data/dares";
import { validatePlayers, validateDares } from "../utils/gameLogic";
import { validateCustomChallenge } from "../data/challenges";
import GameModeSelector from "./GameModeSelector";
import "./SetupScreen.css";

/**
 * SetupScreen – Step 1 of MysteryBox.
 * Configures Game Mode, Player Count & Names, Custom Challenges, and Dares.
 *
 * Props:
 *   onStart(players: string[], dares: string[], mode: string, customChallenges: object[]) => void
 *   initialConfig?: { players: string[], dares?: string[], mode?: string, customChallenges?: object[] }
 *   hasActiveGame?: boolean
 *   onResumeGame?: () => void
 */
export default function SetupScreen({
  onStart,
  initialConfig = null,
  hasActiveGame = false,
  onResumeGame,
}) {
  const [numPlayers, setNumPlayers] = useState(() =>
    initialConfig?.players?.length ? String(initialConfig.players.length) : ""
  );
  const [playerNames, setPlayerNames] = useState(() => initialConfig?.players || []);
  const [daresText, setDaresText] = useState(() =>
    Array.isArray(initialConfig?.dares) ? initialConfig.dares.join("\n") : ""
  );
  const [fieldsGenerated, setFieldsGenerated] = useState(
    () => Boolean(initialConfig?.players?.length)
  );
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({}); // idx → message
  const [touched, setTouched] = useState({}); // idx → bool
  const [selectedMode, setSelectedMode] = useState(() => initialConfig?.mode || "secret");

  // Custom challenges state
  const [customChallenges, setCustomChallenges] = useState(
    () => initialConfig?.customChallenges || []
  );
  const [customText, setCustomText] = useState("");
  const [customType, setCustomType] = useState("dare");
  const [customDifficulty, setCustomDifficulty] = useState("Medium");
  const [customCategory, setCustomCategory] = useState("funny");
  const [customError, setCustomError] = useState("");

  // ── Generate player fields ──────────────────────────────────────────
  const handleGenerate = () => {
    const n = parseInt(numPlayers, 10);
    if (!n || n < 3) {
      setFormError("Please enter a valid player count (minimum 3 players).");
      return;
    }
    setFormError("");
    setFieldsGenerated(true);
    setPlayerNames(Array(n).fill(""));
    setFieldErrors({});
    setTouched({});
    setDaresText(DEFAULT_DARES.slice(0, n + 2).join("\n"));
  };

  // ── Validate all fields on the fly ─────────────────────────────────
  const computeFieldErrors = useCallback(
    (names) => {
      const errs = {};
      const lower = names.map((n) => n.trim().toLowerCase());
      names.forEach((name, idx) => {
        if (touched[idx] === undefined) return;
        const t = name.trim();
        if (t === "") {
          errs[idx] = "Name cannot be empty.";
        } else {
          const firstOccurrence = lower.indexOf(t.toLowerCase());
          if (firstOccurrence !== idx) {
            errs[idx] = `Duplicate of Player ${firstOccurrence + 1}.`;
          }
        }
      });
      return errs;
    },
    [touched]
  );

  // ── Handle name change ──────────────────────────────────────────────
  const handleNameChange = (idx, value) => {
    const updated = [...playerNames];
    updated[idx] = value;
    setPlayerNames(updated);
    setTouched((prev) => ({ ...prev, [idx]: true }));
    setFieldErrors(computeFieldErrors(updated));
    setFormError("");
  };

  const handleNameBlur = (idx) => {
    setTouched((prev) => ({ ...prev, [idx]: true }));
    setFieldErrors(computeFieldErrors(playerNames));
  };

  // ── Add Custom Challenge ───────────────────────────────────────────
  const handleAddCustomChallenge = () => {
    setCustomError("");

    const validation = validateCustomChallenge({
      text: customText,
      difficulty: customDifficulty,
      type: customType,
      category: customCategory,
    });

    if (!validation.valid) {
      setCustomError(validation.error);
      return;
    }

    // Check duplicate in custom challenges
    const isDup = customChallenges.some(
      (c) => c.text.toLowerCase() === validation.sanitized.text.toLowerCase()
    );
    if (isDup) {
      setCustomError("This challenge has already been added.");
      return;
    }

    setCustomChallenges((prev) => [...prev, validation.sanitized]);
    setCustomText("");
    setCustomError("");
  };

  const handleRemoveCustomChallenge = (id) => {
    setCustomChallenges((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Submit Form ─────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    // Mark all fields as touched so errors show
    const allTouched = {};
    playerNames.forEach((_, i) => {
      allTouched[i] = true;
    });
    setTouched(allTouched);

    const players = playerNames.map((n) => n.trim());
    const pv = validatePlayers(players);
    if (!pv.valid) {
      setFormError(pv.error);
      setFieldErrors(computeFieldErrors(players));
      return;
    }

    const rawDares = daresText.trim()
      ? daresText.split("\n").map((d) => d.trim()).filter(Boolean)
      : DEFAULT_DARES;

    if (selectedMode === "secret") {
      const dv = validateDares(rawDares, players.length);
      if (!dv.valid) {
        setFormError(dv.error);
        return;
      }
    }

    onStart(players, rawDares, selectedMode, customChallenges);
  };

  const usingDefaults = !daresText.trim();

  return (
    <div className="setup-wrapper">
      {/* ── Brand header ── */}
      <header className="setup-header">
        <div className="emoji-row" aria-hidden="true">
          🎁 🎉 🎊 🎈 🎁
        </div>
        <h1 className="app-title">MysteryBox</h1>
        <p className="app-subtitle">Open the Box, Reveal the Dare!</p>
      </header>

      <form className="setup-form" onSubmit={handleSubmit} noValidate>
        {/* ── Resume Banner if an active game is in progress ── */}
        {hasActiveGame && onResumeGame && (
          <div className="resume-banner">
            <div className="resume-banner-text">
              <span className="resume-icon" aria-hidden="true">💾</span>
              <span>You have an ongoing game in progress!</span>
            </div>
            <button
              type="button"
              className="btn btn-primary resume-btn"
              onClick={onResumeGame}
            >
              ▶ Resume Game
            </button>
          </div>
        )}

        {/* ── Game Mode Selector ── */}
        <GameModeSelector selected={selectedMode} onChange={setSelectedMode} />

        {/* ── Player count ── */}
        <div className="form-group">
          <label htmlFor="numPlayers" className="form-label">
            🎮 How many players?
          </label>
          <div className="inline-group">
            <input
              id="numPlayers"
              type="number"
              className="form-input"
              min="3"
              value={numPlayers}
              onChange={(e) => {
                setNumPlayers(e.target.value);
                setFieldsGenerated(false);
                setFormError("");
              }}
              placeholder="Min. 3"
              aria-describedby={formError && !fieldsGenerated ? "form-error" : undefined}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleGenerate}
            >
              Generate Fields ✨
            </button>
          </div>
        </div>

        {/* ── Player name fields ── */}
        {fieldsGenerated && (
          <div className="player-inputs-section">
            <h3 className="section-title">👥 Player Names</h3>
            <div className="player-grid">
              {playerNames.map((name, idx) => {
                const err = fieldErrors[idx];
                return (
                  <div
                    key={idx}
                    className={`form-group player-field${
                      err ? " player-field--error" : ""
                    }`}
                  >
                    <label className="form-label" htmlFor={`player-${idx}`}>
                      Player {idx + 1}
                    </label>
                    <input
                      id={`player-${idx}`}
                      type="text"
                      className={`form-input${err ? " input--error" : ""}`}
                      value={name}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      onBlur={() => handleNameBlur(idx)}
                      placeholder="Enter name…"
                      autoComplete="off"
                      aria-describedby={err ? `player-err-${idx}` : undefined}
                      aria-invalid={!!err}
                    />
                    {err && (
                      <span
                        className="field-error"
                        id={`player-err-${idx}`}
                        role="alert"
                      >
                        {err}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Custom Challenges Builder ── */}
        {fieldsGenerated && (
          <div className="custom-challenge-builder">
            <div className="custom-builder-header">
              <h3 className="section-title">✨ Add Custom Challenges</h3>
              <span className="builder-pill">Optional</span>
            </div>
            <p className="builder-hint">
              Craft your own hilarious or creative challenges. All tasks are 100% voluntary with penalty-free skips.
            </p>

            <div className="custom-input-card">
              <div className="custom-controls-row">
                {/* Challenge Type */}
                <div className="custom-control-group">
                  <label htmlFor="custom-type-select" className="custom-label">
                    Type
                  </label>
                  <select
                    id="custom-type-select"
                    className="custom-select"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                  >
                    <option value="dare">🎲 Dare</option>
                    <option value="truth">🤔 Truth</option>
                    <option value="surprise">🎁 Surprise</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="custom-control-group">
                  <label htmlFor="custom-diff-select" className="custom-label">
                    Difficulty
                  </label>
                  <select
                    id="custom-diff-select"
                    className="custom-select"
                    value={customDifficulty}
                    onChange={(e) => setCustomDifficulty(e.target.value)}
                  >
                    <option value="Easy">🟢 Easy</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Hard">🔴 Hard</option>
                  </select>
                </div>

                {/* Category */}
                <div className="custom-control-group">
                  <label htmlFor="custom-cat-select" className="custom-label">
                    Category
                  </label>
                  <select
                    id="custom-cat-select"
                    className="custom-select"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  >
                    <option value="funny">😂 Funny</option>
                    <option value="acting">🎭 Acting</option>
                    <option value="singing">🎤 Singing</option>
                    <option value="dancing">💃 Dancing</option>
                    <option value="quick-thinking">⚡ Quick-Thinking</option>
                    <option value="creative">🎨 Creative</option>
                    <option value="group">👥 Group</option>
                  </select>
                </div>
              </div>

              {/* Text Input */}
              <div className="custom-input-row">
                <input
                  type="text"
                  className="form-input custom-text-input"
                  placeholder="e.g. Do a dramatic voiceover for someone drinking water..."
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    setCustomError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomChallenge();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-secondary custom-add-btn"
                  onClick={handleAddCustomChallenge}
                >
                  + Add Challenge
                </button>
              </div>

              {customError && (
                <p className="custom-error-text" role="alert">
                  ⚠️ {customError}
                </p>
              )}
            </div>

            {/* List of Added Custom Challenges */}
            {customChallenges.length > 0 && (
              <div className="custom-challenges-list">
                <span className="custom-list-label">
                  Your Added Challenges ({customChallenges.length}):
                </span>
                <div className="custom-chips-grid">
                  {customChallenges.map((item) => (
                    <div key={item.id} className="custom-chip">
                      <div className="chip-meta">
                        <span className="chip-type-tag">
                          {item.type === "truth"
                            ? "🤔 Truth"
                            : item.type === "surprise"
                            ? "🎁 Surprise"
                            : "🎲 Dare"}
                        </span>
                        <span className={`chip-diff-tag chip-diff--${item.difficulty.toLowerCase()}`}>
                          {item.difficulty}
                        </span>
                      </div>
                      <p className="chip-text">{item.text}</p>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => handleRemoveCustomChallenge(item.id)}
                        aria-label={`Remove challenge: ${item.text}`}
                        title="Remove challenge"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Dares Textarea (For Secret Mode or Quick Edit) ── */}
        {fieldsGenerated && (
          <div className="form-group dares-section">
            <label htmlFor="daresInput" className="form-label">
              🎲 Quick Dares Pool <span className="label-hint">(one per line)</span>
            </label>
            {usingDefaults && (
              <p className="using-defaults-note">
                ✅ Using built-in curated dares. Edit or type below to customize.
              </p>
            )}
            <textarea
              id="daresInput"
              className="form-textarea"
              rows={5}
              value={daresText}
              onChange={(e) => {
                setDaresText(e.target.value);
                setFormError("");
              }}
              placeholder="Example: Sing a song, Dance, Do 10 pushups…"
            />
          </div>
        )}

        {/* ── Form-level error ── */}
        {formError && (
          <p className="error-msg" id="form-error" role="alert">
            ⚠️ {formError}
          </p>
        )}

        {/* ── Submit ── */}
        {fieldsGenerated && (
          <button type="submit" className="btn btn-primary submit-btn">
            🚀 Launch {selectedMode === "secret" ? "Secret Assignment" : selectedMode === "truth" ? "Truth or Dare" : "Surprise Challenge"}!
          </button>
        )}

        <p className="setup-storage-note">
          💾 Progress and player setup are saved locally on this browser. Your game is private to your device.
        </p>
      </form>
    </div>
  );
}
