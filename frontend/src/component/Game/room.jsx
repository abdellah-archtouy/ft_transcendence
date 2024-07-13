import React, { useEffect, useState, useRef } from "react";
import LoadingPage from "../loadingPage/loadingPage";
import "./room.css";
import WinnerDisplay from "./winnerDisplay";

let ima = "/pause.svg";
let Board;
let boardWidth = 1000;
let boardHeight = 550;
let Context;
let PlayerH = 100;
let PlayerW = 20;
let playerV = 0;

let player1 = {
  x: 0,
  y: boardHeight / 2 - 50,
  height: PlayerH,
  width: PlayerW,
  velocityY: playerV,
};

let player2 = {
  x: boardWidth - PlayerW,
  y: boardHeight / 2 - 50,
  height: PlayerH,
  width: PlayerW,
  velocityY: playerV,
};

let ballheight = 20;
let ballwidth = 20;
let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  height: ballheight,
  width: ballwidth,
  velocityX: -2,
  velocityY: 2,
  speed: 5,
};

const Room = ({ data }) => {
  const [user, setUser] = useState(data[0]);
  const [canvas, setCanvas] = useState(false);
  const [goals, setGoals] = useState(0);
  const [pause, setPause] = useState(false);
  const [winner, setWinner] = useState(null);
  const animationRef = useRef(null);

  function resetAll() {
    boardWidth = 1000;
    boardHeight = 550;
    PlayerH = 100;
    PlayerW = 20;
    playerV = 0;
    ballheight = 20;
    ballwidth = 20;

    player1.x = 0;
    player1.y = boardHeight / 2 - 50;
    player1.height = PlayerH;
    player1.width = PlayerW;
    player1.velocityY = playerV;

    player2.x = boardWidth - PlayerW;
    player2.y = boardHeight / 2 - 50;
    player2.height = PlayerH;
    player2.width = PlayerW;
    player2.velocityY = playerV;

    ball.x = boardWidth / 2;
    ball.y = boardHeight / 2;
    ball.height = ballheight;
    ball.width = ballwidth;
    ball.velocityX = -2;
    ball.velocityY = 2;
    if (isNaN(data)) ball.speed = data[1].ballSpeed;
    else ball.speed = 5;
  }

  const drawRoundedRect = (ctx, x, y, width, height, radius, opacity) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.globalAlpha = opacity;
    ctx.fill();
  };

  function movePlayer(e) {
    if (e.code === "KeyW") player1.velocityY = -5;
    if (e.code === "KeyS") player1.velocityY = 5;
    if (data[1].playMode !== "bot") {
      if (e.code === "ArrowUp") player2.velocityY = -5;
      if (e.code === "ArrowDown") player2.velocityY = 5;
    }
  }

  function stopPlayer(e) {
    if (e.code === "KeyW") player1.velocityY = 0;
    if (e.code === "KeyS") player1.velocityY = 0;
    if (data[1].playMode !== "bot") {
      if (e.code === "ArrowUp") player2.velocityY = 0;
      if (e.code === "ArrowDown") player2.velocityY = 0;
    }
  }

  function collision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  function velocityChange() {
    if (collision(ball, player1)) {
      let collidePoint =
        (ball.y - (player1.y + player1.height / 2)) / (player1.height / 2);
      let angle = collidePoint * (Math.PI / 4);
      let direction = ball.x < boardWidth / 2 ? 1 : -1;
      ball.velocityX = ball.speed * Math.cos(angle) * direction;
      ball.velocityY = ball.speed * Math.sin(angle) * direction;
      if (ball.speed < 10) ball.speed += 0.1;
    }
    if (collision(ball, player2)) {
      let collidePoint =
        (ball.y - (player2.y + player2.height / 2)) / (player2.height / 2);
      let angle = collidePoint * (-Math.PI / 4);
      let direction = ball.x < boardWidth / 2 ? 1 : -1;
      ball.velocityX = ball.speed * Math.cos(angle) * direction;
      ball.velocityY = ball.speed * Math.sin(angle) * direction;
      if (ball.speed < 10) ball.speed += 0.1;
    }
  }

  function pickMode() {
    if (data[1].playMode === "bot") ball.speed = data[1].ballSpeed;
  }

  function updateValues() {
    if (ball.x + ball.width < 0 || ball.x > boardWidth) {
      let x = 1;
      if (ball.x + ball.width < 0) {
        user[0].goals = user[0].goals + 1;
        x = 1;
      }
      if (ball.x > boardWidth) {
        user[1].goals = user[1].goals + 1;
        x = -1;
      }
      ball.velocityX =
        ball.speed * Math.cos(((3 * Math.PI) / 4) * (0.4 * x)) * (1 * x);
      ball.velocityY =
        ball.speed * Math.sin(((3 * Math.PI) / 4) * (0.4 * x)) * (1 * x);
      let theWinner = user.find((user) => user.goals === 6);
      if (theWinner) {
        setWinner(theWinner);
        handlePause();
      }
      setGoals((value) => {
        value++;
        return value;
      });
      ball.x = boardWidth / 2;
      ball.y = boardHeight / 2;
    }
  }

  function update() {
    if (pause === false) animationRef.current = requestAnimationFrame(update);
    else cancelAnimationFrame(animationRef.current);
    Context.clearRect(0, 0, boardWidth, boardHeight);
    Context.fillStyle = "#DFDFDF";
    Context.shadowColor = "rgba(255, 255, 255, 0.25)";
    Context.shadowBlur = 10;
    Context.shadowSpread = 1;
    drawRoundedRect(
      Context,
      player1.x,
      player1.y,
      player1.width,
      player1.height,
      5,
      1
    );
    drawRoundedRect(
      Context,
      player2.x,
      player2.y,
      player2.width,
      player2.height,
      5,
      1
    );
    drawRoundedRect(Context, ball.x, ball.y, ball.width, ball.height, 10, 1);

    let newPosition = player1.y + player1.velocityY;
    if (newPosition > 0 && newPosition < boardHeight - player1.height)
      player1.y += player1.velocityY;

    if (data[1].playMode === "bot")
      newPosition =
        player2.y +
        (ball.y - (player2.y + player2.height / 2)) * data[1].errorRate;
    else newPosition = player2.y + player2.velocityY;
    if (newPosition > 0 && newPosition < boardHeight - player2.height)
      player2.y = newPosition;
    ball.y += ball.velocityY;
    ball.x += ball.velocityX;
    if (boardHeight - 10 < ball.y + ball.height) {
      if (ball.velocityY > 0) ball.velocityY *= -1;
    }
    if (ball.y < 10) {
      if (ball.velocityY < 0) ball.velocityY *= -1;
    }
    velocityChange();
    updateValues();
  }

  const gameRender = () => {
    if (canvas) {
      pickMode();
      Board = document.getElementById("Rcanvas");
      Board.height = boardHeight;
      Board.width = boardWidth;
      Context = Board.getContext("2d"); // used to draw on board
      Context.fillStyle = "#DFDFDF";
      Context.shadowColor = "rgba(255, 255, 255, 0.25)";
      Context.shadowBlur = 10;
      Context.shadowSpread = 1;
      drawRoundedRect(
        Context,
        player1.x,
        player1.y,
        player1.width,
        player1.height,
        5,
        1
      );
      drawRoundedRect(
        Context,
        player2.x,
        player2.y,
        player2.width,
        player2.height,
        5,
        1
      );
      drawRoundedRect(Context, ball.x, ball.y, ball.width, ball.height, 10, 1);
      window.addEventListener("keydown", movePlayer);
      window.addEventListener("keyup", stopPlayer);
      window.addEventListener("keydown", pauseGame);
      animationRef.current = requestAnimationFrame(update);
    }
  };

  useEffect(() => {
    gameRender();
    resetAll();
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", movePlayer);
      window.removeEventListener("keyup", stopPlayer);
      window.removeEventListener("keydown", pauseGame);
    };
  }, [canvas]);
  
  function handlePause() {
      setPause((value) => {
        const newVal = !value;
        ima = (newVal ? "/play.svg" : "/pause.svg");
        return (newVal);
      });
  }

  function pauseGame(e) {
    if (e.key === " " && !winner) {
      handlePause()
    }
  }

  useEffect(() => {
    if (!pause) {
      window.addEventListener("keydown", movePlayer);
      window.addEventListener("keyup", stopPlayer);
      animationRef.current = requestAnimationFrame(update);
    } else {
      window.removeEventListener("keydown", movePlayer);
      window.removeEventListener("keydown", pauseGame);
      window.removeEventListener("keyup", stopPlayer);
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", movePlayer);
      window.removeEventListener("keydown", pauseGame);
      window.removeEventListener("keyup", stopPlayer);
    };
  }, [pause, winner]);

  useEffect(() => {
    if (user) {
      let users = user;
      setUser(users);
    }
  }, [goals]);

  if (!user) return <LoadingPage />;
  return (
    <div className="RoomContainer">
      <>
        <div className="RoomFirst">
          <div className="userinfo">
            <div className="image">
              <img src={user[1].avatar} className="avatar" alt="" />
            </div>
            <div className="infos">
              <h1>{user[1].name}</h1>
              <p>{user[1].goals}</p>
            </div>
          </div>
          <div className="enemyinfo">
            <div className="infos">
              <h1>{user[0].name}</h1>
              <p>{user[0].goals}</p>
            </div>
            <div className="image">
              <img src={user[0].avatar} className="avatar" alt="" />
            </div>
          </div>
        </div>
        <div className="RoomSecond">
          {winner && (
            <div className="winnerdiplay">
              <div className="win" style={{ position: "relative" }}>
                <WinnerDisplay user={winner} />
              </div>
            </div>
          )}

          {pause && !winner && (
            <div className="pauseDisplay">
              <p>Pause</p>
            </div>
          )}

          <canvas
            id="Rcanvas"
            ref={(c) => {
              if (c) setCanvas(true);
            }}
          />
        </div>
        <div className="buttons">
          {!winner && (
            <button
              className="pause otherIcons"
              onClick={() => {
                handlePause();
              }}
            >
              <img src={ima} alt="" className="pauseIcons" />
            </button>
          )}
          {pause && (
            <button
              className="pause"
              title="pause"
              onClick={() => {
                handlePause();
                setWinner("");
                resetAll();
                user[0].goals = 0;
                user[1].goals = 0;
                setGoals((goals) => {
                  goals++;
                  return goals;
                });
              }}
            >
              <img src="/retry.svg" alt="" className="pauseIcons retry" />
            </button>
          )}
        </div>
      </>
    </div>
  );
};

export default Room;
