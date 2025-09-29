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

  // ✅ update status game
  const updateGameStatus = useCallback(() => {
    if (game.in_checkmate()) setStatus('Checkmate!');
    else if (game.in_draw()) setStatus('Draw!');
    else if (game.in_check()) setStatus('Check!');
    else if (game.in_stalemate()) setStatus('Stalemate!');
    else setStatus('In Progress');

    setTurn(game.turn() === 'w' ? 'White' : 'Black');
  }, [game]);

  useEffect(() => {
    updateGameStatus();
  }, [game, updateGameStatus]);

  // ✅ eksekusi move
  function makeMove(from, to) {
    try {
      const gameCopy = new Chess(game.fen());
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

        return move;
      }
    } catch (error) {
      return null;
    }
    return null;
  }

  // ✅ AI move sederhana (random)
  function makeAIMove() {
    const possibleMoves = game.moves({ verbose: true });
    if (possibleMoves.length === 0) return;

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
    setStatus('In Progress');
    setTurn('White');
  }

  // ✅ drop handler (simulasi click-to-move)
  function onDrop(sourceSquare, targetSquare) {
    const move = makeMove(sourceSquare, targetSquare);
    if (!move) return false;

    setTimeout(makeAIMove, 300);
    return true;
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
    setBoardOrientation(boardOrientation === 'white' ? 'black' : 'white');
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Modern Chess Game</h1>
        <p>Play against a simple AI opponent</p>
      </header>

      <div className="game-container">
        <div className="chessboard-container">
          <div className="chessboard-wrapper">
            <Chessboard
              id="styled-board"
              position={game.fen()}
              onPieceDrop={onDrop}          // ✅ klik diproses lewat drop
              onSquareRightClick={onSquareRightClick}
              boardOrientation={boardOrientation}
              arePiecesDraggable={false}    // 🚀 drag dimatikan
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
            <p className="turn-text">Turn: {turn}</p>
            <p className="instruction">
              Click a piece, then click a destination square
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
