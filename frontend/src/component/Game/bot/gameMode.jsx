import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const GameMode = () => {

  const navigate = useNavigate();

  function updatevalues(speed, errorRate) {
    let d = [
      {
        playMode: "bot",
        ballSpeed: speed,
        botSerious: errorRate,
      },
    ];
    navigate("/game/bot", { state: { values: d } });
  }

  return (
    <>
      <button
        className="easy"
        onClick={() => {
          updatevalues(5, 0.1);
        }}
      >
        <div>Easy</div>
      </button>
      <button
        className="medium"
        onClick={() => {
          updatevalues(7, 0.3);
        }}
      >
        <div>Medium</div>
      </button>
      <button
        className="Hard"
        onClick={() => {
          updatevalues(9, 0.5);
        }}
      >
        <div>Hard</div>
      </button>
    </>
  );
};

export default GameMode;
