import React from "react";

function Header({ userColor }) {
  return (
    <header className="app-header">
      <h1>Modern Chess Game</h1>
      <p>
        Anda bermain sebagai:{" "}
        <span
          style={{
            fontWeight: "bold",
            color: userColor === "w" ? "#5a4b81" : "#333",
          }}
        >
          {userColor === "w" ? "Putih" : "Hitam"}
        </span>
      </p>
    </header>
  );
}

export default Header;
