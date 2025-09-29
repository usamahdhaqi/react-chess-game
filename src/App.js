import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';   // ✅ sesuai chess.js v1.x
import './App.css';

function App() {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState('white');
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveHistory, setMoveHistory] = useState([]);
  const [status, setStatus] = useState('In Progress');
  const [turn, setTurn] = useState('White');

  // ✅ update status game (pakai API chess.js v1.x)
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

  // ✅ highlight moves ketika klik bidak
  function getMoveOptions(square) {
    const moves = game.moves({ square, verbose: true });

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares = {};
    moves.forEach((move) => {
      newSquares[move.to] = { className: 'highlight-to' };
    });

    // kotak asal
    newSquares[square] = { className: 'highlight-from' };

    setOptionSquares(newSquares);
    return true;
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
    setOptionSquares({});
  }

  // ✅ reset game
  function resetGame() {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setOptionSquares({});
    setRightClickedSquares({});
    setMoveFrom('');
    setStatus('In Progress');
    setTurn('White');
  }

  // ✅ click-to-move logic
  function onSquareClick(square) {
    setRightClickedSquares({});

    if (!moveFrom) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()[0]) {
        setMoveFrom(square);
        getMoveOptions(square);
      }
    } else {
      const move = makeMove(moveFrom, square);

      if (!move) {
        const piece = game.get(square);
        if (piece && piece.color === game.turn()[0]) {
          setMoveFrom(square);
          getMoveOptions(square);
          return;
        }
        setMoveFrom('');
        setOptionSquares({});
        return;
      }

      setTimeout(makeAIMove, 300);
      setMoveFrom('');
      setOptionSquares({});
    }
  }

  // ✅ eksekusi move
  function makeMove(from, to) {
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({ from, to, promotion: 'q' });

      if (move) {
        setGame(gameCopy);
        setMoveHistory((prev) => [...prev, move.san]);
        return move;
      }
    } catch (error) {
      return null;
    }
    return null;
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
              onSquareClick={onSquareClick}
              onSquareRightClick={onSquareRightClick}
              boardOrientation={boardOrientation}
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
              {!moveFrom
                ? 'Click on your piece to move'
                : 'Click on destination square'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
