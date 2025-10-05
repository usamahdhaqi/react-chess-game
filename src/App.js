import React, { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import "./App.css";

import ChessboardWrapper from "./components/ChessboardWrapper";
import MoveHistory from "./components/MoveHistory";
import GameControls from "./components/GameControls";
import GameStatus from "./components/GameStatus";

// =============================
// Highlight Styles
// =============================
const highlightStyles = {
  from: { background: "rgba(60, 40, 100, 0.55)" },
  target: { background: "rgba(120, 100, 180, 0.45)" },
  capture: { background: "rgba(200, 50, 50, 0.55)" },
  to: { background: "rgba(255, 200, 0, 0.55)" },
};

// =============================
// Board Evaluation Function
// =============================
function evaluateBoard(game) {
  const pieceValues = { p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0 };
  let score = 0;
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (!piece) continue;

      const base = pieceValues[piece.type];
      const colorSign = piece.color === "w" ? 1 : -1;
      score += base * colorSign;

      // Positional bonuses (central control)
      const file = String.fromCharCode(97 + j);
      const rank = 8 - i;
      const square = `${file}${rank}`;

      if (["d4", "d5", "e4", "e5"].includes(square)) {
        score += 0.25 * colorSign;
      }
    }
  }

  // Sedikit random supaya tidak kaku
  score += (Math.random() - 0.5) * 0.1;
  return score;
}

// =============================
// Minimax + Alpha-Beta Pruning
// =============================
function minimax(game, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || game.game_over()) {
    return evaluateBoard(game);
  }

  const moves = game.moves({ verbose: true });
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const clone = new Chess(game.fen());
      clone.move(move);
      const evalScore = minimax(clone, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const clone = new Chess(game.fen());
      clone.move(move);
      const evalScore = minimax(clone, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // pruning
    }
    return minEval;
  }
}

// =============================
// Cari Langkah Terbaik untuk AI
// =============================
function findBestMove(game, depth, aiColor) {
  const possibleMoves = game.moves({ verbose: true });
  if (possibleMoves.length === 0) return null;

  let bestMove = null;
  let bestScore = aiColor === "w" ? -Infinity : Infinity;

  for (const move of possibleMoves) {
    const clone = new Chess(game.fen());
    clone.move(move);
    const score = minimax(clone, depth - 1, -Infinity, Infinity, aiColor === "b");

    if (aiColor === "w" && score > bestScore) {
      bestScore = score;
      bestMove = move;
    } else if (aiColor === "b" && score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// =============================
// Komponen Utama
// =============================
function App() {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [optionSquares, setOptionSquares] = useState({});
  const [moveHistory, setMoveHistory] = useState([]);
  const [status, setStatus] = useState("In Progress");
  const [userColor, setUserColor] = useState("w");
  const [sourceSquare, setSourceSquare] = useState("");
  const [difficulty, setDifficulty] = useState(1); // 0=Easy, 1=Medium, 2=Hard

  const aiColor = userColor === "w" ? "b" : "w";

  // =============================
  // Status Checker
  // =============================
  const updateGameStatus = useCallback(() => {
    if (game.in_checkmate()) setStatus("Checkmate!");
    else if (game.in_draw()) setStatus("Draw!");
    else if (game.in_check()) setStatus("Check!");
    else setStatus("In Progress");
  }, [game]);

  // =============================
  // AI Move
  // =============================
  const makeAIMove = useCallback(() => {
    setGame((currentGame) => {
      if (currentGame.game_over() || currentGame.turn() !== aiColor) {
        return currentGame;
      }

      let depth = difficulty === 0 ? 0 : difficulty === 1 ? 1 : 2;
      const move =
        difficulty === 0
          ? currentGame.moves({ verbose: true })[
              Math.floor(Math.random() * currentGame.moves().length)
            ]
          : findBestMove(currentGame, depth, aiColor);

      if (!move) return currentGame;

      const newGame = new Chess(currentGame.fen());
      newGame.move(move);

      setMoveHistory((prev) => [...prev, move.san]);
      setOptionSquares({
        [move.from]: highlightStyles.from,
        [move.to]: highlightStyles.to,
      });

      return newGame;
    });
  }, [aiColor, difficulty]);

  // =============================
  // useEffect hooks
  // =============================
  useEffect(() => {
    updateGameStatus();
  }, [game, updateGameStatus]);

  useEffect(() => {
    if (game.turn() === aiColor && !game.game_over()) {
      const timer = setTimeout(() => makeAIMove(), 600);
      return () => clearTimeout(timer);
    }
  }, [game, aiColor, makeAIMove]);

  // =============================
  // Player Moves
  // =============================
  function highlightMoves(square) {
    if (game.game_over()) return;
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares = { [square]: highlightStyles.from };
    moves.forEach((m) => {
      const targetPiece = game.get(m.to);
      if (targetPiece && targetPiece.color !== game.turn())
        newSquares[m.to] = highlightStyles.capture;
      else newSquares[m.to] = highlightStyles.target;
    });
    setOptionSquares(newSquares);
  }

  function makeMove(from, to) {
    if (game.game_over() || game.turn() !== userColor) return;
    const newGame = new Chess(game.fen());
    const move = newGame.move({ from, to, promotion: "q" });
    if (move) {
      setGame(newGame);
      setMoveHistory((prev) => [...prev, move.san]);
      setOptionSquares({
        [from]: highlightStyles.from,
        [to]: highlightStyles.to,
      });
      setSourceSquare("");
    } else {
      setSourceSquare("");
      setOptionSquares({});
    }
  }

  function onSquareClick(square) {
    if (game.game_over()) return;
    if (!sourceSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSourceSquare(square);
        highlightMoves(square);
      }
      return;
    }
    makeMove(sourceSquare, square);
  }

  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setOptionSquares({});
    setSourceSquare("");
  }

  function flipBoard() {
    setBoardOrientation((prev) => {
      const newOrientation = prev === "white" ? "black" : "white";
      setUserColor(newOrientation === "white" ? "w" : "b");
      return newOrientation;
    });
    resetGame();
  }

  function handleDifficultyChange(newDifficulty) {
    setDifficulty(newDifficulty);
    resetGame();
  }

  // =============================
  // Render
  // =============================
  return (
    <div className="app">
      <header className="app-header">
        <h1>Modern Chess Game</h1>
      </header>
      <div className="game-container">
        <ChessboardWrapper
          game={game}
          optionSquares={optionSquares}
          boardOrientation={boardOrientation}
          onSquareClick={onSquareClick}
        />
        <div className="game-controls">
          <GameStatus status={status} userColor={userColor} />
          <GameControls
            resetGame={resetGame}
            flipBoard={flipBoard}
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
          />
          <MoveHistory moveHistory={moveHistory} />
        </div>
      </div>
    </div>
  );
}

export default App;
