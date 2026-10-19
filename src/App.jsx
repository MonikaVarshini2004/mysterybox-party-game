import { useState } from "react";
import SetupScreen from "./components/SetupScreen";
import GameScreen from "./components/GameScreen";
import { buildAssignments } from "./utils/gameLogic";
import {
  loadActiveGame,
  clearActiveGame,
  saveLastConfig,
  loadLastConfig,
  hasSavedGame,
} from "./utils/storage";
import "./App.css";

/**
 * App – root component that coordinates game state and persistent storage.
 *
 * Supports:
 * - Refresh restoration of active games
 * - Validation of stored game data
 * - Reset Game and Play Again workflows
 * - Local-first privacy (browser only)
 */
export default function App() {
  // Check on initial load if an in-progress game was saved
  const [restoredActive] = useState(() => loadActiveGame());

  const [screen, setScreen] = useState(() => (restoredActive ? "game" : "setup"));
  const [assignments, setAssignments] = useState(() => restoredActive?.assignments || null);
  const [gameMode, setGameMode] = useState(() => restoredActive?.gameMode || "secret");
  const [lastConfig, setLastConfig] = useState(
    () => restoredActive?.lastConfig || loadLastConfig()
  );

  const [initialGameState, setInitialGameState] = useState(() =>
    restoredActive
      ? {
          openedIndexes: restoredActive.openedIndexes,
          completedIndexes: restoredActive.completedIndexes,
          skippedIndexes: restoredActive.skippedIndexes,
          scores: restoredActive.scores,
          isGameOverScreen: restoredActive.isGameOverScreen,
        }
      : null
  );

  /* Called by SetupScreen when a new game is started */
  const handleStart = (players, dares, mode = "secret", customChallenges = []) => {
    // Clear previous round's active game state
    clearActiveGame();
    setInitialGameState(null);

    const config = { players, dares, mode, customChallenges };
    saveLastConfig(config);
    setLastConfig(config);

    const result = buildAssignments(players, dares, mode, customChallenges);
    setAssignments(result);
    setGameMode(mode);
    setScreen("game");
  };

  /* Called by GameOver / GameScreen's "Play Again" button */
  const handlePlayAgain = () => {
    if (!lastConfig) return;
    clearActiveGame();
    setInitialGameState(null);

    const result = buildAssignments(
      lastConfig.players,
      lastConfig.dares,
      lastConfig.mode,
      lastConfig.customChallenges
    );
    setAssignments(result);
    setScreen("game");
  };

  /* Called by GameScreen's "Edit Setup / Start Over" button */
  const handleRestart = () => {
    setScreen("setup");
  };

  /* Called by "New Game" button: resets active storage and returns to setup */
  const handleResetGame = () => {
    clearActiveGame();
    setAssignments(null);
    setInitialGameState(null);
    setScreen("setup");
  };

  /* Called by SetupScreen when resuming an ongoing saved game */
  const handleResumeGame = () => {
    const active = loadActiveGame();
    if (active) {
      setAssignments(active.assignments);
      setGameMode(active.gameMode);
      setInitialGameState({
        openedIndexes: active.openedIndexes,
        completedIndexes: active.completedIndexes,
        skippedIndexes: active.skippedIndexes,
        scores: active.scores,
        isGameOverScreen: active.isGameOverScreen,
      });
      setScreen("game");
    }
  };

  return (
    <div className="app-root">
      {screen === "setup" && (
        <SetupScreen
          onStart={handleStart}
          initialConfig={lastConfig}
          hasActiveGame={hasSavedGame() && assignments !== null}
          onResumeGame={handleResumeGame}
        />
      )}
      {screen === "game" && assignments && (
        <GameScreen
          assignments={assignments}
          onRestart={handleRestart}
          onPlayAgain={handlePlayAgain}
          onResetGame={handleResetGame}
          gameMode={gameMode}
          initialState={initialGameState}
          lastConfig={lastConfig}
        />
      )}
    </div>
  );
}
