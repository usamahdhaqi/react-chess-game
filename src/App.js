import React, { useState, useEffect, useCallback } from "react";
import { Chess } from "chess.js";
import "./App.css";

import ChessboardWrapper from "./components/ChessboardWrapper";
import MoveHistory from "./components/MoveHistory";
import GameControls from "./components/GameControls";
import GameStatus from "./components/GameStatus";

// [Cite: 1]
const highlightStyles = {
// ... highlightStyles tetap sama
  from: {
    background: "rgba(60, 40, 100, 0.55)", // asal (ungu gelap)
  },
  target: {
    background: "rgba(120, 100, 180, 0.45)", // target kosong (ungu sedang)
  },
  capture: {
    background: "rgba(200, 50, 50, 0.55)", // target dengan bidak lawan (merah transparan)
  },
  to: {
    background: "rgba(255, 200, 0, 0.55)", // tujuan langkah terakhir (kuning)
  },
};

// =========================================================
// Logika AI sederhana (Peningkatan dari Langkah Acak)
// Kita menggunakan Minimax Depth 0 (hanya mengevaluasi langkah saat ini)
// atau Minimax Depth 1 (melihat 1 langkah ke depan)
// =========================================================
function evaluateBoard(game) {
  let score = 0;
  // Nilai material catur standar
  const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const board = game.board();

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const value = pieceValues[piece.type];
        // Tambah jika bidak putih, kurangi jika bidak hitam
        score += piece.color === 'w' ? value : -value;
      }
    }
  }

  return score;
}

function findBestMove(game, depth) {
  const possibleMoves = game.moves({ verbose: true });
  if (possibleMoves.length === 0) return null;

  // Jika difficulty adalah "easy", gunakan langkah acak
  if (depth === 0) {
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[randomIndex];
  }
  
  // Implementasi AI (Minimax Depth 1) untuk kesulitan Sedang/Sulit
  let bestMove = possibleMoves[0];
  let bestScore = -Infinity; // Untuk Hitam (maksimalkan skor negatif)
  
  if (game.turn() === 'w') {
    bestScore = -Infinity;
  } else {
    // Karena kita selalu bermain sebagai Hitam (aiColor = 'b') dalam fungsi ini,
    // kita mencari skor serendah mungkin (maksimalkan kerugian Putih)
    bestScore = Infinity;
  }

  for (const move of possibleMoves) {
    const tempGame = new Chess(game.fen());
    tempGame.move(move);

    let score = evaluateBoard(tempGame);

    // Jika kedalaman > 0, kita bisa tambahkan evaluasi yang lebih dalam
    // Namun untuk sederhana, kita hanya menggunakan evaluasi material
    
    // Sesuaikan skor berdasarkan giliran
    if (game.turn() === 'b') { // Hitam ingin meminimalkan skor
        if (score < bestScore) {
            bestScore = score;
            bestMove = move;
        }
    } else { // Putih ingin memaksimalkan skor (Tidak perlu diimplementasi karena AI selalu bermain Hitam atau sesuai aiColor)
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
  }

  return bestMove;
}
// =========================================================

function App() {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [optionSquares, setOptionSquares] = useState({});
  const [moveHistory, setMoveHistory] = useState([]);
  const [status, setStatus] = useState("In Progress");
  const [turn, setTurn] = useState("Putih");
  const [userColor, setUserColor] = useState("w");
  const [sourceSquare, setSourceSquare] = useState("");
  
  // STATE BARU untuk tingkat kesulitan (0=Easy, 1=Medium, 2=Hard)
  const [difficulty, setDifficulty] = useState(1);

  const aiColor = userColor === "w" ? "b" : "w";

  // ... updateGameStatus tetap sama
  const updateGameStatus = useCallback(() => {
    if (game.in_checkmate()) setStatus("Checkmate!"); //
    else if (game.in_draw()) setStatus("Draw!"); //
    else if (game.in_check()) setStatus("Check!"); //
    else if (game.in_stalemate()) setStatus("Stalemate!"); //
    else setStatus("In Progress"); //

    setTurn(game.turn() === "w" ? "Putih" : "Hitam"); //
  }, [game]); //

  const makeAIMove = useCallback(() => {
    setGame((currentGame) => {
      if (currentGame.game_over() || currentGame.turn() !== aiColor) {
        return currentGame;
      }

      // Tentukan depth berdasarkan difficulty
      let depth = 0;
      if (difficulty === 1) { // Medium
          depth = 1; 
      } else if (difficulty === 2) { // Hard
          depth = 2; // Hanya sebagai placeholder, membutuhkan AI yang lebih kompleks
      }
      
      // Menggunakan fungsi AI baru
      const move = findBestMove(currentGame, depth); 
      
      if (!move) return currentGame; //

      const gameCopy = new Chess(currentGame.fen());
      gameCopy.move({
        from: move.from, //
        to: move.to, //
        promotion: move.promotion ? "q" : undefined, //
      }); //

      setMoveHistory((prev) => [...prev, move.san]); //

      // Highlight langkah AI
      setOptionSquares({
        [move.from]: highlightStyles.from, //
        [move.to]: highlightStyles.to, //
      }); //

      return gameCopy; //
    }); //
  }, [aiColor, difficulty]); // Tambahkan `difficulty` ke dependencies

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

    const newSquares = { [square]: highlightStyles.from };

    moves.forEach((move) => {
      const targetPiece = game.get(move.to); // cek isi kotak
      if (targetPiece && targetPiece.color !== game.turn()) {
        // kalau ada bidak lawan → highlight merah
        newSquares[move.to] = highlightStyles.capture;
      } else {
        // kotak kosong → highlight ungu biasa
        newSquares[move.to] = highlightStyles.target;
      }
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
          [from]: highlightStyles.from,
          [to]: highlightStyles.to,
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

    if (!sourceSquare) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSourceSquare(square);
        highlightMoves(square);
        return;
      }
      return;
    }

    const move = makeMove(sourceSquare, square);

    if (move) {
      setSourceSquare('');
      setOptionSquares({});
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSourceSquare(square);
      highlightMoves(square);
      return;
    }

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

  // Fungsi baru untuk mengatur tingkat kesulitan
  function handleDifficultyChange(newDifficulty) {
      setDifficulty(newDifficulty);
      resetGame();
  }

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
          <GameStatus status={status} turn={turn} userColor={userColor} />
          {/* Tambahkan prop difficulty dan fungsi penangan ke GameControls */}
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