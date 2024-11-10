import React from "react";
import { useNavigate } from "react-router-dom";
import "./gamemode.css";
const GameMode = () => {
  const navigate = useNavigate();

  function updatevalues(mode) {
    let d = {
        botmode: mode,
      };
    navigate("/game/bot", { state: { values:d } });
  }

  return (
    <>
      <h1 id="game-mode-header">Game Mode</h1>
      <div className="botmode">
        <div className="mode-container">
          <button
            className="botmode-button easy"
            onClick={() => {
              // updatevalues(5, 0.01);
              updatevalues("easy");
            }}
            style={{ backgroundImage: 'url("/easy.png")' }}
            >
            <p>Easy</p>
          </button>
          <button
            className="botmode-button medium"
            onClick={() => {
              // updatevalues(7, 0.05);
              updatevalues("medium");
            }}
            style={{ backgroundImage: 'url("/medium.png")' }}
            >
            <p>Medium</p>
          </button>
          <button
            className="botmode-button Hard"
            onClick={() => {
              // updatevalues(9, 0.1);
              updatevalues("hard");
            }}
            style={{ backgroundImage: 'url("/hard.png")' }}
          >
            <p>Hard</p>
          </button>
        </div>
      </div>
    </>
  );
};

export default GameMode;
