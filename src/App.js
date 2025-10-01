import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [optionSquares, setOptionSquares] = useState({});
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveHistory, setMoveHistory] = useState([]);
  const [status, setStatus] = useState('In Progress');
  const [turn, setTurn] = useState('White');
  
  // State untuk melacak warna pengguna dan source square untuk click-to-move
  const [userColor, setUserColor] = useState('w'); // Default: Pengguna Putih
  const [sourceSquare, setSourceSquare] = useState(''); 

  // Tentukan warna AI berdasarkan warna pengguna
  const aiColor = userColor === 'w' ? 'b' : 'w';

  // ✅ 1. Update status game
  const updateGameStatus = useCallback(() => {
    if (game.in_checkmate()) setStatus('Checkmate!');
    else if (game.in_draw()) setStatus('Draw!');
    else if (game.in_check()) setStatus('Check!');
    else if (game.in_stalemate()) setStatus('Stalemate!');
    else setStatus('In Progress');

    setTurn(game.turn() === 'w' ? 'White' : 'Black');
  }, [game]);
  
  // ✅ 2. Logika Gerakan AI (menggunakan useCallback & functional update)
  const makeAIMove = useCallback(() => {
    // Menggunakan setGame dengan functional update (currentGame) untuk mendapatkan state game terbaru.
    setGame(currentGame => {
      // Hentikan jika game selesai atau ini bukan giliran AI
      if (currentGame.game_over() || currentGame.turn() !== aiColor) {
          return currentGame;
      }
      
      const possibleMoves = currentGame.moves({ verbose: true });
      if (possibleMoves.length === 0) return currentGame;

      // Pilih langkah acak
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      const move = possibleMoves[randomIndex];

      // Lakukan langkah pada salinan game yang diperbarui
      const gameCopy = new Chess(currentGame.fen());
      gameCopy.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion ? 'q' : undefined,
      });

      // Update history
      setMoveHistory(prev => [...prev, move.san]);

      // Highlight asal & tujuan AI
      const newSquares = {
        [move.from]: { className: 'highlight-from' },
        [move.to]: { className: 'highlight-to' },
      };
      setOptionSquares(newSquares);

      return gameCopy; // Kembalikan objek game yang baru
    });
  }, [aiColor]);

  // ✅ EFFECT 1: Update Status Game setelah setiap render
  useEffect(() => {
    updateGameStatus();
  }, [game, updateGameStatus]);

  // ✅ EFFECT 2: Kontrol Giliran AI (Dipicu setelah langkah user selesai)
  useEffect(() => {
    // Cek apakah ini giliran AI dan game belum berakhir
    if (game.turn() === aiColor && !game.game_over()) {
      // Beri sedikit delay sebelum AI bergerak
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500); // 500ms delay

      return () => clearTimeout(timer); // Cleanup timer jika state berubah
    }
  }, [game, aiColor, makeAIMove]);

  // --- Fungsi Game Logic ---

  // Highlight kemungkinan gerakan
  function highlightMoves(square) {
    if (game.turn() !== userColor || game.game_over()) return;

    const moves = game.moves({
      square: square,
      verbose: true,
    });

    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares = {};
    newSquares[square] = { className: 'highlight-from' };
    
    moves.forEach((move) => {
      newSquares[move.to] = { className: 'highlight-target' };
    });

    setOptionSquares(newSquares);
  }

  // Eksekusi move
  function makeMove(from, to) {
    if (game.game_over() || game.turn() !== userColor) {
        return null;
    }
    
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from, to, promotion: 'q' });

      if (move) {
        setGame(gameCopy);
        setMoveHistory((prev) => [...prev, move.san]);

        // Highlight asal & tujuan
        const newSquares = {
          [from]: { className: 'highlight-from' },
          [to]: { className: 'highlight-to' },
        };
        setOptionSquares(newSquares);
        
        // Catatan: Pemicu AI kini ditangani oleh useEffect(EFFECT 2).
        return move;
      }
    } catch (error) {
      return null;
    }
    return null;
  }
  
  // Reset game
  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setOptionSquares({});
    setRightClickedSquares({});
    setSourceSquare('');
  }

  // Click-to-Move handler
  function onSquareClick(square) {
    if (game.game_over()) return;

    setRightClickedSquares({});
    
    // Klik pertama (Memilih bidak)
    if (!sourceSquare) {
      const piece = game.get(square);
      if (piece && piece.color === userColor && game.turn() === userColor) {
        setSourceSquare(square);
        highlightMoves(square);
        return;
      }
      return;
    }

    // Klik kedua (Melakukan gerakan)
    const move = makeMove(sourceSquare, square);

    if (move) {
      setSourceSquare(''); 
      setOptionSquares({}); 
      return;
    }

    // Klik di bidak sendiri (Mengganti bidak yang dipilih)
    const piece = game.get(square);
    if (piece && piece.color === userColor && game.turn() === userColor) {
      setSourceSquare(square);
      highlightMoves(square);
      return;
    }
    
    // Klik tidak valid, reset pilihan
    setSourceSquare('');
    setOptionSquares({});
  }

  // Right click handler
  function onSquareRightClick(square) {
    const colour = 'rgba(255, 248, 201, 0.7)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] &&
        rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  }

  // Flip board handler
  function flipBoard() {
    setBoardOrientation(prev => {
        const newOrientation = prev === 'white' ? 'black' : 'white';
        // Pengguna bermain warna di bagian bawah papan
        setUserColor(newOrientation === 'white' ? 'w' : 'b'); 
        return newOrientation;
    });
    resetGame();
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Modern Chess Game</h1>
        <p>Anda bermain sebagai: <span style={{ fontWeight: 'bold', color: userColor === 'w' ? '#5a4b81' : '#333' }}>{userColor === 'w' ? 'Putih' : 'Hitam'}</span></p>
      </header>

      <div className="game-container">
        <div className="chessboard-container">
          <div className="chessboard-wrapper">
            <Chessboard
              id="styled-board"
              position={game.fen()}
              onSquareClick={onSquareClick}
              onSquareRightClick={onSquareRightClick}
              boardOrientation={boardOrientation}
              arePiecesDraggable={false}
              customSquareClasses={{
                ...Object.fromEntries(
                  Object.entries(optionSquares).map(([sq, val]) => [sq, val.className])
                )
              }}
              customSquareStyles={{
                ...Object.fromEntries(
                  Object.entries(rightClickedSquares).map(([sq, val]) => [sq, val])
                )
              }}
              customBoardStyle={{
                borderRadius: '4px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.15)',
                width: '100%',
                height: '100%'
              }}
              customDarkSquareStyle={{ backgroundColor: '#BEADFA' }}
              customLightSquareStyle={{ backgroundColor: '#DFCCFB' }}
            />
          </div>
        </div>

        <div className="game-controls">
          <div className="move-history">
            <h3>Move History</h3>
            <div className="moves-list">
              {moveHistory.length === 0 ? (
                <p className="no-moves">No moves yet</p>
              ) : (
                moveHistory.map((move, index) => (
                  <div key={index} className="move">
                    {index % 2 === 0 ? (
                      <span className="move-number">
                        {Math.floor(index / 2) + 1}.
                      </span>
                    ) : (
                      ''
                    )}
                    <span>{move}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="buttons">
            <button onClick={resetGame} className="btn btn-reset">
              New Game
            </button>
            <button onClick={flipBoard} className="btn btn-flip">
              Flip Board
            </button>
          </div>

          <div className="game-status">
            <h3>Game Status</h3>
            <p className="status-text">{status}</p>
            <p className="turn-text">Giliran: {turn}</p>
            <p className="instruction">
              Klik bidak Anda, lalu klik kotak tujuan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;