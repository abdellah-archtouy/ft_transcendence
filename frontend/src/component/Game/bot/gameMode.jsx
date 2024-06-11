import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Bot from "./bot";
import LoadingPage from "./../../loadingPage/loadingPage";

const GameMode = () => {
  function updatevalues(speed, botSeriousness) {
    let d = [
      {ballSpeed: speed,
      botSerious: botSeriousness}
    ];
    return d;
  }

  const [ballSpeed, setBallSpeed] = useState(updatevalues(5, 0.1));
  const [clicked, setClicked] = useState(false);

  function updateState() {
    setClicked(!clicked);
  }

  async function testFetch() {
    try {
      console.log('Attempting to fetch data from /ping...');
      const response = await fetch("http://localhost:8000/ping", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Data received:', data);
      } else {
        console.error('Fetch error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    testFetch()
  }, []);

  if(!ballSpeed) return <LoadingPage />;
  return (
    <>
      <button className="easy" onClick={() => {
        updateState();
        setBallSpeed(updatevalues(5, 0.1));
      }}>
        <div>Easy</div>
      </button>
      <button className="medium" onClick={() => {
        updateState();
        setBallSpeed(updatevalues(7, 0.3));
      }}>
        <div>Medium</div>
      </button>
      <button className="Hard" onClick={() => {
        updateState();
        setBallSpeed(updatevalues(9, 0.5));
      }}>
        <div>Hard</div>
      </button>
      {clicked && <Bot data={ballSpeed}/>}
    </>
  );
}

export default GameMode;