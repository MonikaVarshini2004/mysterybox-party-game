import "./GameModeSelector.css";

/**
 * GameModeSelector
 * Reusable component for choosing between:
 * 1. Secret Assignment
 * 2. Truth or Dare
 * 3. Surprise Challenge
 *
 * Props:
 *   selected: string ("secret" | "truth" | "surprise")
 *   onChange: (mode: string) => void
 */
export default function GameModeSelector({ selected = "secret", onChange }) {
  const modes = [
    {
      id: "secret",
      icon: "🤫",
      badge: "Derangement Mode",
      label: "Secret Assignment",
      description:
        "Every player is secretly assigned another player's name and a custom dare. No self-assignments! Keep it secret until the box opens.",
      ruleHighlight: "Rules: 1 recipient + 1 dare per box. Nobody gets themselves.",
    },
    {
      id: "truth",
      icon: "🤔",
      badge: "Classic Choice",
      label: "Truth or Dare",
      description:
        "Open your box and freely pick between a Truth question, Dare, or Surprise challenge! Includes safe, voluntary skip option without penalty.",
      ruleHighlight: "Rules: Pick Truth, Dare, or Surprise. Freely skip if uncomfortable.",
    },
    {
      id: "surprise",
      icon: "🎉",
      badge: "Unpredictable Fun",
      label: "Surprise Challenge",
      description:
        "Every mystery box unveils an unpredictable surprise: a wild solo dare, an epic group challenge, or a game-changing bonus event!",
      ruleHighlight: "Rules: Unpredictable draw! Group challenges require everyone's participation.",
    },
  ];

  return (
    <div className="mode-selector-container">
      <div className="mode-selector-header">
        <span className="mode-selector-subtitle">Choose Your Adventure</span>
        <h2 className="mode-selector-title">Select Game Mode</h2>
      </div>

      <fieldset className="mode-selector">
        <legend className="sr-only">Select mystery box game mode</legend>
        <div className="mode-options" role="radiogroup">
          {modes.map((m) => {
            const isSelected = selected === m.id;
            return (
              <label
                key={m.id}
                className={`mode-card ${isSelected ? "active" : ""}`}
                htmlFor={`mode-radio-${m.id}`}
              >
                <input
                  id={`mode-radio-${m.id}`}
                  type="radio"
                  name="gameMode"
                  value={m.id}
                  checked={isSelected}
                  onChange={() => onChange(m.id)}
                  className="mode-radio-input"
                />

                <div className="mode-top-row">
                  <span className="mode-icon" aria-hidden="true">
                    {m.icon}
                  </span>
                  <span className="mode-badge">{m.badge}</span>
                </div>

                <div className="mode-header">{m.label}</div>
                <p className="mode-description">{m.description}</p>

                <div className="mode-rule-box">
                  <span className="rule-text">{m.ruleHighlight}</span>
                </div>

                {isSelected && (
                  <div className="mode-selected-indicator" aria-hidden="true">
                    <span>✓ Selected Mode</span>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
