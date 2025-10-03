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
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)",
            width: "100%",
            height: "100%",
          }}
          customDarkSquareStyle={{ backgroundColor: "#BEADFA" }}
          customLightSquareStyle={{ backgroundColor: "#DFCCFB" }}
          customSquareRenderer={({ square, children, style }) => {
            const props = optionSquares[square] || {};
            console.log("Render:", square, props);
            const isFrom = props.isFrom;
            const isTo = props.isTo;
            const isTarget = props.isTarget;

            return (
              <div style={{ ...style, position: "relative" }}>

                {isFrom && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      boxShadow:
                        "inset 0 0 0 3px rgba(90, 75, 129, 0.9), 0 0 10px rgba(90, 75, 129, 0.4)",
                      borderRadius: "4px",
                    }}
                  />
                )}

                {isTo && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      boxShadow:
                        "inset 0 0 0 3px rgba(255, 200, 0, 0.9), 0 0 12px rgba(255, 200, 0, 0.6)",
                      borderRadius: "4px",
                    }}
                  />
                )}

                {isTarget && <div className="square-highlight-circle" />}
                {children}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

export default ChessboardWrapper;
