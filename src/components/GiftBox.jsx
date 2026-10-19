import { useState } from "react";
import { playBoxOpenSound } from "../utils/soundEffects.js";
import "./GiftBox.css";

/**
 * Unique colour theme per box index (cycles every 8).
 * Each theme defines CSS custom properties injected inline.
 */
const BOX_THEMES = [
  { emoji: "🎁", color1: "#f472b6", color2: "#c084fc", glow: "rgba(244,114,182,0.45)" },
  { emoji: "🎀", color1: "#818cf8", color2: "#6366f1", glow: "rgba(129,140,248,0.45)" },
  { emoji: "🎊", color1: "#f9a8d4", color2: "#e879f9", glow: "rgba(249,168,212,0.45)" },
  { emoji: "🎉", color1: "#34d399", color2: "#059669", glow: "rgba(52,211,153,0.4)"  },
  { emoji: "🎈", color1: "#fb923c", color2: "#f472b6", glow: "rgba(251,146,60,0.4)"  },
  { emoji: "✨", color1: "#a78bfa", color2: "#818cf8", glow: "rgba(167,139,250,0.45)" },
  { emoji: "🌟", color1: "#facc15", color2: "#fb923c", glow: "rgba(250,204,21,0.4)"  },
  { emoji: "💝", color1: "#fb7185", color2: "#c084fc", glow: "rgba(251,113,133,0.45)" },
];

/**
 * GiftBox – a single mystery box card for one player.
 *
 * Props
 * ─────
 * assignment   { name, secret, dare, ... }
 * index        number   — for colour theme & stagger delay
 * onOpen       (assignment) => void
 * isOpened     boolean  — has been revealed
 * isCompleted  boolean  — dare marked done
 * isSkipped    boolean  — dare skipped
 */
export default function GiftBox({
  assignment,
  index,
  onOpen,
  isOpened,
  isCompleted,
  isSkipped,
}) {
  const [isOpening, setIsOpening] = useState(false);
  const theme = BOX_THEMES[index % BOX_THEMES.length];

  // Determine class modifiers
  let modifier = "";
  if (isOpening) modifier = " gift-box--opening";
  else if (isCompleted) modifier = " gift-box--completed";
  else if (isSkipped) modifier = " gift-box--skipped";
  else if (isOpened)  modifier = " gift-box--opened";

  const isLocked = isOpened || isCompleted || isSkipped || isOpening; // can't re-open

  const statusBadge = isCompleted
    ? "✅ Completed"
    : isSkipped
    ? "⏭ Skipped"
    : isOpened
    ? "Opened 👀"
    : null;

  const handleClick = () => {
    if (!isLocked) {
      setIsOpening(true);
      playBoxOpenSound();
      setTimeout(() => {
        setIsOpening(false);
        onOpen(assignment);
      }, 200);
    }
  };

  return (
    <button
      className={`gift-box${modifier}`}
      style={{
        animationDelay: `${index * 0.1}s`,
        "--c1": theme.color1,
        "--c2": theme.color2,
        "--glow": theme.glow,
      }}
      onClick={handleClick}
      aria-label={
        isLocked
          ? `${assignment.name}'s box – ${statusBadge}`
          : `Click to open ${assignment.name}'s mystery box`
      }
      title={
        isLocked
          ? statusBadge
          : `Click to reveal ${assignment.name}'s dare`
      }
      aria-disabled={isLocked}
    >
      {/* Shimmer layer */}
      <span className="gift-box__shimmer" aria-hidden="true" />

      {/* Emoji */}
      <span className="gift-box__emoji" aria-hidden="true">
        {isCompleted ? "🏆" : isSkipped ? "💨" : theme.emoji}
      </span>

      {/* Player name */}
      <span className="gift-box__name">{assignment.name}</span>

      {/* Status badge */}
      {statusBadge && (
        <span className="gift-box__badge">{statusBadge}</span>
      )}
    </button>
  );
}
