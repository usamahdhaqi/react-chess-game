import React from "react";

function GameControls({ resetGame, flipBoard, difficulty, onDifficultyChange }) {
  return (
    <div className="controls-group">
      <div className="difficulty-selector">
        <label htmlFor="difficulty">Difficulty:</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => onDifficultyChange(parseInt(e.target.value))}
          className="select-difficulty"
        >
          <option value={0}>Easy (Random)</option>
          <option value={1}>Medium (Minimax Depth 1)</option>
          <option value={2}>Hard (Minimax Depth 2)</option>
        </select>
      </div>
      
      <div className="buttons">
        <button onClick={resetGame} className="btn btn-reset">
          New Game
        </button>
        <button onClick={flipBoard} className="btn btn-flip">
          Flip Board
        </button>
      </div>
    </div>
  );
}

export default GameControls;