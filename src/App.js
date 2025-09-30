import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';   // ✅ sesuai chess.js v1.x
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [optionSquares, setOptionSquares] = useState({});
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveHistory, setMoveHistory] = useState([]);
  const [status, setStatus] = useState('In Progress');
  const [turn, setTurn] = useState('White');
  
  // ✅ State baru: Melacak warna yang dimainkan oleh pengguna ('w' untuk White, 'b' untuk Black)
  const [userColor, setUserColor] = useState('w'); // Default: Pengguna bermain sebagai Putih
  
  // ✅ State untuk Click-to-Move (Deklarasi yang hilang)
  const [sourceSquare, setSourceSquare] = useState(''); // Kotak asal yang dipilih

  // Tentukan warna AI berdasarkan warna pengguna
  const aiColor = userColor === 'w' ? 'b' : 'w';

  // ✅ update status game
  const updateGameStatus = useCallback(() => {
    if (game.in_checkmate()) setStatus('Checkmate!');
    else if (game.in_draw()) setStatus('Draw!');
    else if (game.in_check()) setStatus('Check!');
    else if (game.in_stalemate()) setStatus('Stalemate!');
    else setStatus('In Progress');

    setTurn(game.turn() === 'w' ? 'White' : 'Black');
  }, [game]);

  // ✅ Logika inisial AI move (Jika pengguna bermain Hitam)
  useEffect(() => {
    updateGameStatus();
    
    // Panggil makeAIMove jika ini giliran AI dan belum ada gerakan yang dilakukan (hanya di awal)
    if (userColor === 'b' && game.turn() === 'w' && moveHistory.length === 0 && status === 'In Progress') {
      setTimeout(makeAIMove, 500); // Beri sedikit delay untuk pengalaman yang lebih baik
    }
  }, [game, updateGameStatus, userColor, moveHistory, status]);

  // ✅ Highlight kemungkinan gerakan
  function highlightMoves(square) {
    // Hanya izinkan pengguna menyorot bidak jika itu giliran mereka
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
    newSquares[square] = { className: 'highlight-from' }; // Kotak asal

    // Sorot semua kotak tujuan yang valid (menggunakan highlight-target)
    moves.forEach((move) => {
      newSquares[move.to] = { className: 'highlight-target' };
    });

    setOptionSquares(newSquares);
  }

  // ✅ eksekusi move
  function makeMove(from, to) {
    // Hanya izinkan move jika game belum berakhir dan ini giliran pengguna
    if (game.game_over() || game.turn() !== userColor) {
        return null;
    }
    
    try {
      const gameCopy = new Chess(game.fen());
      // Lakukan gerakan, asumsikan promosi menjadi Ratu ('q')
      const move = gameCopy.move({ from, to, promotion: 'q' });

      if (move) {
        setGame(gameCopy);
        setMoveHistory((prev) => [...prev, move.san]);

        // highlight asal & tujuan
        const newSquares = {
          [from]: { className: 'highlight-from' },
          [to]: { className: 'highlight-to' },
        };
        setOptionSquares(newSquares);
        
        // Panggil AI jika ini giliran AI berikutnya
        if (!gameCopy.game_over() && gameCopy.turn() === aiColor) {
            setTimeout(makeAIMove, 300);
        }

        return move;
      }
    } catch (error) {
      // Gerakan tidak valid
      return null;
    }
    return null;
  }

  // ✅ AI move sederhana (random)
  function makeAIMove() {
    // Hentikan jika game selesai atau ini bukan giliran AI
    if (game.game_over() || game.turn() !== aiColor) {
        return;
    }
    
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

    // Pilih langkah acak
    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    const move = possibleMoves[randomIndex];

    const gameCopy = new Chess(game.fen());
    gameCopy.move({
      from: move.from,
      to: move.to,
      promotion: move.promotion ? 'q' : undefined,
    });

    setGame(gameCopy);
    setMoveHistory((prev) => [...prev, move.san]);

    // highlight asal & tujuan AI
    const newSquares = {
      [move.from]: { className: 'highlight-from' },
      [move.to]: { className: 'highlight-to' },
    };
    setOptionSquares(newSquares);
  }

  // ✅ reset game
  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setOptionSquares({});
    setRightClickedSquares({});
    // Status akan diperbarui oleh useEffect
    // userColor tetap dipertahankan
  }

  // ✅ onSquareClick handler untuk click-to-move
  function onSquareClick(square) {
    // Pastikan game belum berakhir
    if (game.game_over()) return;

    setRightClickedSquares({}); // Hapus highlight klik kanan setiap kali klik baru
    
    // 1. Jika belum ada kotak asal yang dipilih
    if (!sourceSquare) {
      // Pastikan kotak punya bidak dan itu giliran pengguna
      const piece = game.get(square);
      if (piece && piece.color === userColor && game.turn() === userColor) {
        setSourceSquare(square);
        highlightMoves(square);
        return;
      }
      return; // Abaikan klik jika bukan giliran pengguna, atau kotak kosong
    }

    // 2. Jika kotak asal sudah dipilih (ini klik kedua/tujuan)
    const move = makeMove(sourceSquare, square);

    // Jika gerakan berhasil (makeMove sudah memicu AI jika giliran AI berikutnya)
    if (move) {
      setSourceSquare(''); // Reset kotak asal
      setOptionSquares({}); // Hapus sorotan
      return;
    }

    // 3. Jika klik kedua tidak valid, tetapi klik di bidak sendiri
    // Ini berarti pemain ingin mengganti bidak yang akan digerakkan
    const piece = game.get(square);
    if (piece && piece.color === userColor && game.turn() === userColor) {
      setSourceSquare(square);
      highlightMoves(square);
      return;
    }
    
    // 4. Jika klik kedua tidak valid sama sekali (misal, klik di kotak kosong yang bukan target)
    setSourceSquare('');
    setOptionSquares({});
  }

  // ✅ right click mark square
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

  // ✅ flip board
  function flipBoard() {
    // Ganti orientasi papan
    setBoardOrientation(prev => {
        const newOrientation = prev === 'white' ? 'black' : 'white';
        // Pengguna bermain warna di bagian bawah papan
        setUserColor(newOrientation === 'white' ? 'w' : 'b'); 
        return newOrientation;
    });
    // Mulai game baru setelah flip
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
              onSquareClick={onSquareClick}    // ✅ Menggunakan onSquareClick untuk click-to-move
              onSquareRightClick={onSquareRightClick}
              boardOrientation={boardOrientation}
              arePiecesDraggable={false}    // Drag dinonaktifkan
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