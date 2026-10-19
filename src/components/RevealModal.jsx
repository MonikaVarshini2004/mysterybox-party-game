import { useEffect, useRef, useState, useMemo } from "react";
import ChallengeTimer from "./ChallengeTimer";
import { CHALLENGES, randomItem } from "../data/challenges.js";
import { playCompleteSound, playSurpriseSound } from "../utils/soundEffects.js";
import { calculateChallengePoints } from "../utils/scoring.js";
import "./RevealModal.css";

/**
 * Confetti particle – rendered as an absolutely-positioned span.
 */
function ConfettiParticle({ style }) {
  return <span className="confetti-particle" style={style} aria-hidden="true" />;
}

/** Generate N random confetti particles for the burst animation. */
function generateConfetti(count = 32) {
  const colors = [
    "#f472b6",
    "#c084fc",
    "#818cf8",
    "#34d399",
    "#facc15",
    "#fb923c",
    "#f9a8d4",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 0.35}s`,
    animationDuration: `${0.7 + Math.random() * 0.8}s`,
    size: `${6 + Math.random() * 8}px`,
    shape: Math.random() > 0.5 ? "circle" : "square",
  }));
}

/**
 * RevealModal
 *
 * Props:
 *   assignment - Active mystery box data { name, secret, dare, mode, difficulty, category, ... }
 *   onClose    - () => void
 *   onComplete - ({ difficulty, category, isBonus, pointsEarned }) => void
 *   onSkip     - () => void
 */
export default function RevealModal({ assignment, onClose, onComplete, onSkip }) {
  const confetti = useMemo(() => generateConfetti(32), []);
  const [status, setStatus] = useState(null); // null | "completed" | "skipped"
  const closeRef = useRef(null);

  // Mode-specific state for Truth or Dare mode
  const [selectedType, setSelectedType] = useState("dare"); // "truth" | "dare" | "surprise"
  const [activeChallengeText, setActiveChallengeText] = useState("");
  const [activeDifficulty, setActiveDifficulty] = useState("Medium");
  const [activeCategory, setActiveCategory] = useState("funny");

  // Keep track of current assignment id to reset internal state when a different box is opened
  const currentId = assignment ? `${assignment.name}-${assignment.index}` : null;
  const [lastAssignedId, setLastAssignedId] = useState(null);

  if (currentId !== lastAssignedId && currentId !== null) {
    setLastAssignedId(currentId);
    setStatus(null);
    setSelectedType("dare");
    setActiveChallengeText(assignment.dare || "");
    setActiveDifficulty(assignment.difficulty || "Medium");
    setActiveCategory(assignment.category || "funny");
  }

  // Focus close button & trigger initial surprise sound if surprise mode
  useEffect(() => {
    if (assignment) {
      const timer = setTimeout(() => closeRef.current?.focus(), 80);
      if (assignment.mode === "surprise") {
        playSurpriseSound();
      }
      return () => clearTimeout(timer);
    }
  }, [assignment]);

  // Keyboard: Escape closes
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && assignment && !status) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [assignment, onClose, status]);

  if (!assignment) return null;

  const mode = assignment.mode || "secret";

  // Check if current challenge qualifies for special surprise bonus points
  const isBonusChallenge =
    mode === "surprise"
      ? assignment.category === "bonus" || assignment.surpriseType === "Bonus Event"
      : selectedType === "surprise";

  const potentialPoints = calculateChallengePoints(activeDifficulty, isBonusChallenge);

  // Dynamic selection handler for Truth or Dare mode
  const handleSelectType = (type) => {
    if (status) return; // locked if already completed/skipped
    setSelectedType(type);
    if (type === "truth") {
      const truthItem = randomItem(CHALLENGES.truths);
      setActiveChallengeText(assignment.truth || truthItem?.text || "Share a funny childhood memory!");
      setActiveDifficulty(truthItem?.difficulty || "Medium");
      setActiveCategory(truthItem?.category || "funny");
    } else if (type === "surprise") {
      playSurpriseSound();
      const surpriseItem = randomItem(CHALLENGES.surprise);
      setActiveChallengeText(assignment.surprise || surpriseItem?.text || "All players sing together!");
      setActiveDifficulty(surpriseItem?.difficulty || "Medium");
      setActiveCategory(surpriseItem?.category || "group");
    } else {
      const dareItem = randomItem(CHALLENGES.dares);
      setActiveChallengeText(assignment.dare || dareItem?.text || "Do your best animal impression!");
      setActiveDifficulty(assignment.difficulty || dareItem?.difficulty || "Medium");
      setActiveCategory(assignment.category || dareItem?.category || "acting");
    }
  };

  // Re-draw a fresh challenge of the current type in Truth or Dare mode
  const handleRedraw = () => {
    if (status) return;
    if (selectedType === "truth") {
      const item = randomItem(CHALLENGES.truths);
      if (item) {
        setActiveChallengeText(item.text);
        setActiveDifficulty(item.difficulty);
        setActiveCategory(item.category);
      }
    } else if (selectedType === "surprise") {
      playSurpriseSound();
      const item = randomItem(CHALLENGES.surprise);
      if (item) {
        setActiveChallengeText(item.text);
        setActiveDifficulty(item.difficulty);
        setActiveCategory(item.category);
      }
    } else {
      const item = randomItem(CHALLENGES.dares);
      if (item) {
        setActiveChallengeText(item.text);
        setActiveDifficulty(item.difficulty);
        setActiveCategory(item.category);
      }
    }
  };

  // Double-click safe complete handler
  const handleComplete = () => {
    if (status) return; // prevent duplicate clicks
    setStatus("completed");
    playCompleteSound();

    setTimeout(() => {
      onComplete({
        difficulty: activeDifficulty || "Medium",
        category: activeCategory || "funny",
        isBonus: isBonusChallenge,
        pointsEarned: potentialPoints,
      });
      onClose();
    }, 700);
  };

  // Double-click safe skip handler
  const handleSkip = () => {
    if (status) return; // prevent duplicate clicks
    setStatus("skipped");

    setTimeout(() => {
      onSkip();
      onClose();
    }, 500);
  };

  // Category Icon map
  const categoryIcons = {
    acting: "🎭",
    singing: "🎤",
    dancing: "💃",
    funny: "😂",
    creative: "🎨",
    "quick-thinking": "⚡",
    group: "👥",
    bonus: "🌟",
  };

  const currentIcon = categoryIcons[activeCategory] || "🎲";

  return (
    <div
      className="rm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rm-player-name"
      onClick={(e) => e.target === e.currentTarget && !status && onClose()}
    >
      {/* ── Confetti burst ── */}
      <div className="rm-confetti" aria-hidden="true">
        {confetti.map((p) => (
          <ConfettiParticle
            key={p.id}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.shape === "circle" ? "50%" : "2px",
              animationDelay: p.animationDelay,
              animationDuration: p.animationDuration,
            }}
          />
        ))}
      </div>

      <div className="rm-card">
        {/* ── Decorative accents ── */}
        <span className="rm-accent rm-accent--tl" aria-hidden="true">🎉</span>
        <span className="rm-accent rm-accent--tr" aria-hidden="true">✨</span>
        <span className="rm-accent rm-accent--br" aria-hidden="true">🎊</span>

        {/* ── Header ── */}
        <div className="rm-header">
          <div className="rm-box-icon" aria-hidden="true">
            {mode === "surprise" ? "🎁" : mode === "truth" ? "🎭" : "🤫"}
          </div>
          <h2 className="rm-player-name" id="rm-player-name">
            {assignment.name}
          </h2>
          <p className="rm-tagline">
            {mode === "secret" && "Your Secret Assignment has been revealed!"}
            {mode === "truth" && "Choose your challenge: Truth, Dare, or Surprise!"}
            {mode === "surprise" && "An unpredictable surprise awaits!"}
          </p>

          {/* Points Potential Pill */}
          <div className="rm-points-badge" title="Points earned upon completing this challenge">
            <span>+{potentialPoints} pts</span>
            {isBonusChallenge && <span className="rm-bonus-tag">Bonus!</span>}
          </div>
        </div>

        {/* ── MODE 1: Secret Assignment Cards ── */}
        {mode === "secret" && (
          <div className="rm-body">
            {/* Secret assignment */}
            <div className="rm-info-card rm-info-card--secret">
              <span className="rm-info-icon" aria-hidden="true">👤</span>
              <div className="rm-info-text">
                <span className="rm-info-label">You are gifting to</span>
                <strong className="rm-info-value">{assignment.secret}</strong>
              </div>
            </div>

            {/* Dare card */}
            <div className="rm-info-card rm-info-card--dare">
              <span className="rm-info-icon" aria-hidden="true">{currentIcon}</span>
              <div className="rm-info-text">
                <div className="rm-badges-row">
                  <span className="rm-info-label">Your Dare</span>
                  <span className={`rm-diff-badge rm-diff--${activeDifficulty.toLowerCase()}`}>
                    {activeDifficulty} ({potentialPoints} pts)
                  </span>
                  <span className="rm-cat-badge">
                    {currentIcon} {activeCategory}
                  </span>
                </div>
                <strong className="rm-info-value">{assignment.dare}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ── MODE 2: Truth or Dare Interactive Selection ── */}
        {mode === "truth" && (
          <div className="rm-body">
            {/* Challenge Type Selector Tabs */}
            <div className="rm-tod-selector" role="tablist" aria-label="Select challenge type">
              <button
                type="button"
                role="tab"
                aria-selected={selectedType === "truth"}
                className={`rm-tod-tab ${selectedType === "truth" ? "active" : ""}`}
                onClick={() => handleSelectType("truth")}
                disabled={status !== null}
              >
                🤔 Truth
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedType === "dare"}
                className={`rm-tod-tab ${selectedType === "dare" ? "active" : ""}`}
                onClick={() => handleSelectType("dare")}
                disabled={status !== null}
              >
                🎲 Dare
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={selectedType === "surprise"}
                className={`rm-tod-tab ${selectedType === "surprise" ? "active" : ""}`}
                onClick={() => handleSelectType("surprise")}
                disabled={status !== null}
              >
                🎁 Surprise
              </button>
            </div>

            {/* Display the active challenge */}
            <div className={`rm-info-card rm-info-card--${selectedType}`}>
              <span className="rm-info-icon" aria-hidden="true">
                {selectedType === "truth" ? "🤔" : selectedType === "surprise" ? "🎁" : "🎲"}
              </span>
              <div className="rm-info-text">
                <div className="rm-badges-row">
                  <span className="rm-info-label">
                    {selectedType === "truth"
                      ? "Truth Question"
                      : selectedType === "surprise"
                      ? "Surprise Challenge"
                      : "Selected Dare"}
                  </span>
                  <span className={`rm-diff-badge rm-diff--${activeDifficulty.toLowerCase()}`}>
                    {activeDifficulty} ({potentialPoints} pts)
                  </span>
                  <span className="rm-cat-badge">
                    {currentIcon} {activeCategory}
                  </span>
                </div>
                <strong className="rm-info-value">{activeChallengeText}</strong>
              </div>
            </div>

            {/* Option to re-roll challenge */}
            <button
              type="button"
              className="rm-btn-reroll"
              onClick={handleRedraw}
              disabled={status !== null}
              title="Pick a different challenge of this type"
            >
              🔄 Pick another {selectedType}
            </button>
          </div>
        )}

        {/* ── MODE 3: Surprise Challenge Card ── */}
        {mode === "surprise" && (
          <div className="rm-body">
            <div className="rm-info-card rm-info-card--surprise">
              <span className="rm-info-icon" aria-hidden="true">
                {assignment.category === "bonus"
                  ? "🌟"
                  : assignment.category === "group"
                  ? "👥"
                  : "🎲"}
              </span>
              <div className="rm-info-text">
                <div className="rm-badges-row">
                  <span className="rm-info-label">
                    {assignment.surpriseType || "Surprise Event"}
                  </span>
                  <span className={`rm-diff-badge rm-diff--${assignment.difficulty.toLowerCase()}`}>
                    {assignment.difficulty} ({potentialPoints} pts)
                  </span>
                  <span className="rm-cat-badge">
                    {categoryIcons[assignment.category] || "🎉"} {assignment.category}
                  </span>
                </div>
                <strong className="rm-info-value">{assignment.dare}</strong>
              </div>
            </div>

            {/* Clear Rules Box */}
            <div className="rm-rules-box">
              <span className="rm-rules-title">📜 Game Rules:</span>
              <p className="rm-rules-text">{assignment.rules}</p>
            </div>
          </div>
        )}

        {/* ── Challenge Timer (stops on completed, skipped, or unmount) ── */}
        <ChallengeTimer
          defaultDuration={30}
          isStopped={status !== null}
        />

        {/* ── Voluntary notice ── */}
        <p className="rm-voluntary-hint">
          🛡️ Safe & Voluntary: It is always okay to skip any task without penalty (0 pts).
        </p>

        {/* ── Status message ── */}
        {status === "completed" && (
          <p className="rm-status rm-status--completed" role="status">
            🏆 Challenge completed! +{potentialPoints} points awarded!
          </p>
        )}
        {status === "skipped" && (
          <p className="rm-status rm-status--skipped" role="status">
            💨 Challenge skipped. 0 points awarded.
          </p>
        )}

        {/* ── Action buttons ── */}
        {!status && (
          <div className="rm-actions">
            <button
              className="rm-btn rm-btn--complete"
              onClick={handleComplete}
              disabled={status !== null}
            >
              ✅ Mark as Completed (+{potentialPoints} pts)
            </button>
            <button
              className="rm-btn rm-btn--skip"
              onClick={handleSkip}
              disabled={status !== null}
            >
              ⏭ Skip Challenge (0 pts)
            </button>
            <button
              ref={closeRef}
              className="rm-btn rm-btn--close"
              onClick={onClose}
              disabled={status !== null}
            >
              Close 🙈
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
