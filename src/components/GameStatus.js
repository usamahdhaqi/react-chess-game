import React from "react";

function GameStatus({ status, turn, userColor }) {
  return (
    <div className="game-status">
      <h3>Game Status</h3>
      <p className="status-text">{status}</p>
      <p className="turn-text">Giliran: {turn}</p>
      <p className="instruction">
        Anda bermain sebagai:{" "}
        <span
          style={{
            fontWeight: "bold",
            color: userColor === "w" ? "#5a4b81" : "#333",
          }}
        >
          {userColor === "w" ? "Putih" : "Hitam"}
        </span>
      </p>
    </div>
  );
}

export default GameStatus;
