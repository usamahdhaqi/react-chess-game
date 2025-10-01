import React from "react";

function MoveHistory({ moveHistory }) {
  return (
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
                ""
              )}
              <span>{move}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MoveHistory;
