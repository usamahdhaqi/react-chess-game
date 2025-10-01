import React from "react";

function GameStatus({ status, turn }) {
  return (
    <div className="game-status">
      <h3>Game Status</h3>
      <p className="status-text">{status}</p>
      <p className="turn-text">Giliran: {turn}</p>
      <p className="instruction">
        Klik bidak Anda, lalu klik kotak tujuan.
      </p>
    </div>
  );
}

export default GameStatus;
