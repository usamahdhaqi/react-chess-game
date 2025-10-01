import React from "react";

function GameControls({ resetGame, flipBoard }) {
  return (
    <div className="buttons">
      <button onClick={resetGame} className="btn btn-reset">
        New Game
      </button>
      <button onClick={flipBoard} className="btn btn-flip">
        Flip Board
      </button>
    </div>
  );
}

export default GameControls;
