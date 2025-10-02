import React from "react";
import { Chessboard } from "react-chessboard";

function ChessboardWrapper({
  game,
  optionSquares,
  boardOrientation,
  onSquareClick,
}) {
  return (
    <div className="chessboard-container">
      <div className="chessboard-wrapper">
        <Chessboard
          id="styled-board"
          position={game.fen()}
          onSquareClick={onSquareClick}
          boardOrientation={boardOrientation}
          arePiecesDraggable={false}
          customSquareStyles={optionSquares}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)",
            width: "100%",
            height: "100%",
          }}
          customDarkSquareStyle={{ backgroundColor: "#BEADFA" }}
          customLightSquareStyle={{ backgroundColor: "#DFCCFB" }}
          customSquareRenderer={({ square, children, style }) => {
            const isTarget =
              optionSquares[square] && optionSquares[square].isTarget;

            return (
              <div style={{ ...style, position: "relative" }}>
                {children}
                {isTarget && (
                  <div className="square-highlight-circle" />
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

export default ChessboardWrapper;
