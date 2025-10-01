import React from "react";
import { Chessboard } from "react-chessboard";

function ChessboardWrapper({
  game,
  optionSquares,
  boardOrientation,
  onSquareClick,
  onSquareRightClick,
}) {
  return (
    <div className="chessboard-container">
      <div className="chessboard-wrapper">
        <Chessboard
          id="styled-board"
          position={game.fen()}
          onSquareClick={onSquareClick}
          onSquareRightClick={onSquareRightClick}
          boardOrientation={boardOrientation}
          arePiecesDraggable={false}
          customSquares={optionSquares}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)",
            width: "100%",
            height: "100%",
          }}
          customDarkSquareStyle={{ backgroundColor: "#BEADFA" }}
          customLightSquareStyle={{ backgroundColor: "#DFCCFB" }}
        />
      </div>
    </div>
  );
}

export default ChessboardWrapper;
