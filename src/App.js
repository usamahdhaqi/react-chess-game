import React, { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import "./App.css";

import Header from "./components/Header";
import ChessboardWrapper from "./components/ChessboardWrapper";
import MoveHistory from "./components/MoveHistory";
import GameControls from "./components/GameControls";
import GameStatus from "./components/GameStatus";

function App() {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [optionSquares, setOptionSquares] = useState({});
  const [moveHistory, setMoveHistory] = useState([]);
  const [status, setStatus] = useState("In Progress");
  const [turn, setTurn] = useState("White");
  const [userColor, setUserColor] = useState("w");
  const [sourceSquare, setSourceSquare] = useState("");

  const aiColor = userColor === "w" ? "b" : "w";

  const updateGameStatus = useCallback(() => {
    if (game.in_checkmate()) setStatus("Checkmate!");
    else if (game.in_draw()) setStatus("Draw!");
    else if (game.in_check()) setStatus("Check!");
    else if (game.in_stalemate()) setStatus("Stalemate!");
    else setStatus("In Progress");

    setTurn(game.turn() === "w" ? "White" : "Black");
  }, [game]);

  const makeAIMove = useCallback(() => {
    setGame((currentGame) => {
      if (currentGame.game_over() || currentGame.turn() !== aiColor) {
        return currentGame;
      }

      const possibleMoves = currentGame.moves({ verbose: true });
      if (possibleMoves.length === 0) return currentGame;

      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      const move = possibleMoves[randomIndex];

      const gameCopy = new Chess(currentGame.fen());
      gameCopy.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion ? "q" : undefined,
      });

      setMoveHistory((prev) => [...prev, move.san]);

      setOptionSquares({
        [move.from]: { background: "rgba(90, 75, 129, 0.3)" },
        [move.to]: { background: "rgba(255, 230, 0, 0.4)" },
      });

      return gameCopy;
    });
  }, [aiColor]);

  useEffect(() => {
    updateGameStatus();
  }, [game, updateGameStatus]);

  useEffect(() => {
    if (game.turn() === aiColor && !game.game_over()) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [game, aiColor, makeAIMove]);

  function highlightMoves(square) {
    if (game.game_over()) return;

    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    // Kotak asal bidak = highlight ungu lembut
    const newSquares = { [square]: { background: "rgba(90, 75, 129, 0.3)" } };

    // Kotak target valid = tandai dengan { isTarget: true }
    moves.forEach((move) => {
      newSquares[move.to] = { isTarget: true };
    });

    setOptionSquares(newSquares);
  }

  function makeMove(from, to) {
    if (game.game_over() || game.turn() !== userColor) return null;
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from, to, promotion: "q" });
      if (move) {
        setGame(gameCopy);
        setMoveHistory((prev) => [...prev, move.san]);
        setOptionSquares({
          [from]: { background: "rgba(90, 75, 129, 0.3)" },
          [to]: { background: "rgba(255, 230, 0, 0.4)" },
        });
        return move;
      }
    } catch {
      return null;
    }
    return null;
  }

  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setOptionSquares({});
    setSourceSquare("");
  }

  function onSquareClick(square) {
    if (game.game_over()) return;

    // Klik pertama (pilih bidak yang sesuai giliran)
    if (!sourceSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSourceSquare(square);
        highlightMoves(square);
        return;
      }
      return;
    }

    // Klik kedua (coba lakukan move)
    const move = makeMove(sourceSquare, square);

    if (move) {
      setSourceSquare('');
      setOptionSquares({});
      return;
    }

    // Klik di bidak lain (masih sesuai giliran → ganti pilihan)
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSourceSquare(square);
      highlightMoves(square);
      return;
    }

    // Klik tidak valid → reset
    setSourceSquare('');
    setOptionSquares({});
  }

  function flipBoard() {
    setBoardOrientation((prev) => {
      const newOrientation = prev === "white" ? "black" : "white";
      setUserColor(newOrientation === "white" ? "w" : "b");
      return newOrientation;
    });
    resetGame();
  }

  return (
    <div className="app">
      <Header userColor={userColor} />
      <div className="game-container">
        <ChessboardWrapper
          game={game}
          optionSquares={optionSquares}
          boardOrientation={boardOrientation}
          onSquareClick={onSquareClick}
        />
        <div className="game-controls">
          <MoveHistory moveHistory={moveHistory} />
          <GameControls resetGame={resetGame} flipBoard={flipBoard} />
          <GameStatus status={status} turn={turn} />
        </div>
      </div>
    </div>
  );
}

export default App;
