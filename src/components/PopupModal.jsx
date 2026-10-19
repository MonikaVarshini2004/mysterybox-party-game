import "./PopupModal.css";

/**
 * PopupModal – displays the revealed dare assignment.
 * Props:
 *   assignment  { name, secret, dare } | null
 *   onClose     () => void
 */
export default function PopupModal({ assignment, onClose }) {
  if (!assignment) return null;

  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Dare reveal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="popup">
        {/* Confetti blobs */}
        <span className="confetti c1">🎉</span>
        <span className="confetti c2">✨</span>
        <span className="confetti c3">🎊</span>

        <div className="popup__header">
          <span className="popup__box-emoji">🎁</span>
          <h2 className="popup__player-name">{assignment.name}</h2>
          <p className="popup__tagline">Your mystery box has been opened!</p>
        </div>

        <div className="popup__body">
          <div className="popup__card popup__card--secret">
            <span className="popup__card-icon">👤</span>
            <div>
              <span className="popup__card-label">You are gifting to</span>
              <strong className="popup__card-value">{assignment.secret}</strong>
            </div>
          </div>

          <div className="popup__card popup__card--dare">
            <span className="popup__card-icon">🎲</span>
            <div>
              <span className="popup__card-label">Your dare is</span>
              <strong className="popup__card-value">{assignment.dare}</strong>
            </div>
          </div>
        </div>

        <button className="btn btn-close" onClick={onClose}>
          Got it! Close 🙈
        </button>
      </div>
    </div>
  );
}
