import React, { useEffect, useState, useRef } from "react";
import LoadingPage from "../../loadingPage/loadingPage";
import "./room.css";

let Board;
let boardWidth = 1000;
let boardHeight = 550;
let Context;

let leftPaddle = {
  x: 0,
  y: boardHeight / 2 - 50,
  height: 100,
  width: 20,
};

let rightPaddle = {
  x: boardWidth - 20,
  y: boardHeight / 2 - 50,
  height: 100,
  width: 20,
};

let ball = {
  x: boardWidth / 2,
  y: boardHeight / 2,
  height: 20,
  width: 20,
};

let WSocket;
let modedata = null;

const host = process.env.REACT_APP_API_HOSTNAME;
const apiUrl = process.env.REACT_APP_API_URL;

const LocalRoom = ({ theWinner, data, mode }) => {
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);
  const [ima, setIma] = useState("/pause.svg");
  const [roomData, setRoomData] = useState(null);
  const [canvas, setCanvas] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [pause, setPause] = useState(false);
  const [winner, setWinner] = useState(null);
  const animationRef = useRef(null);

  if (data) modedata = data;

  const drawRoundedRect = (ctx, x, y, width, height, radius, opacity) => {
    const scaleX = Board.width / boardWidth;
    const scaleY = Board.height / boardHeight;
    ctx.save();
    ctx.scale(scaleX, scaleY);
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
    ctx.restore();
  }

  function movePlayer(e) {
    const keyMappings = {
      KeyW: true,
      KeyS: true,
      ArrowUp: true,
      ArrowDown: true,
    };

    if (keyMappings[e.code]) {
      WSocket?.send(
        JSON.stringify({
          type: "keypress",
          key: e.code,
        })
      );
    }
  }

  function stopPlayer(e) {
    if (
      e.code === "KeyW" ||
      e.code === "ArrowUp" ||
      e.code === "KeyS" ||
      e.code === "ArrowDown"
    ) {
      WSocket?.send(
        JSON.stringify({
          type: "keydown",
          key: e.code,
        })
      );
    }
  }

  function handlePause() {
    WSocket?.send(
      JSON.stringify({
        type: "keypress",
        key: "Space",
      })
    );
  }

  const pauseGame = (e) => {
    if (e.key === " " && !winner) {
      e.preventDefault(); // Prevent default space bar action
      e.stopPropagation();
      handlePause();
    }
  };

  const update = () => {
    if (pause === false) animationRef.current = requestAnimationFrame(update);
    else cancelAnimationFrame(animationRef.current);
    if (!Context) return;
    Context.clearRect(0, 0, boardWidth, boardHeight);
    Context.fillStyle = "#DFDFDF";
    Context.shadowColor = "rgba(255, 255, 255, 0.25)";
    Context.shadowBlur = 10;
    Context.shadowSpread = 1;
    drawRoundedRect(
      Context,
      leftPaddle?.x,
      leftPaddle?.y,
      leftPaddle?.width,
      leftPaddle?.height,
      5,
      1
    );
    drawRoundedRect(
      Context,
      rightPaddle?.x,
      rightPaddle?.y,
      rightPaddle?.width,
      rightPaddle?.height,
      5,
      1
    );
    drawRoundedRect(
      Context,
      ball?.x,
      ball?.y,
      ball?.width,
      ball?.height,
      10,
      1
    );
  };

  function canvasResize() {
    Board = document.getElementById("Rcanvas");
    Board.height = boardHeight;
    Board.width = boardWidth;
  }

  useEffect(() => {
    function getWSUrl() {
      if (modedata?.length === 2) {
        let username1 = modedata[0];
        let username2 = modedata[1];
        return `wss://${host}/ws/game/Local/${username1}/${username2}`;
      } else return null;
    }

    const url = getWSUrl();
    if (!url) return;
    WSocket = new WebSocket(url);

    WSocket.onmessage = function (e) {
      let tmp = JSON.parse(e.data);
      if (tmp?.ballInfo) ball = tmp?.ballInfo;
      if (tmp?.leftPaddle) leftPaddle = tmp?.leftPaddle;
      if (tmp?.rightPaddle) rightPaddle = tmp?.rightPaddle;
      if (!roomData)
        setRoomData(() => {
          return tmp;
        });

        if (
          tmp?.room_paused !== undefined &&
          tmp?.room_paused !== null
        ) {
          setPause(tmp?.room_paused);
      }

      if (!!tmp?.user1) setPlayer1(tmp?.user1);
      if (!!tmp?.user2) setPlayer2(tmp?.user2);

      if (mode === "TournamentLocal" && tmp?.winner) theWinner(tmp?.winner);
      if (tmp?.winner)
        setWinner(() => {
          return tmp?.winner;
        });
    };

    return () => {
      if (WSocket) WSocket.close();
    };
  }, [mode, theWinner]);

  const handleEvents = () => {
    window.addEventListener("keydown", movePlayer);
    window.addEventListener("keyup", stopPlayer);
  };

  const removeEvents = () => {
    window.removeEventListener("keydown", movePlayer);
    window.removeEventListener("keyup", stopPlayer);
  };

  useEffect(() => {
    if (!pause && !countDown && !winner) {
      setIma("/pause.svg");
      handleEvents();
      animationRef.current = requestAnimationFrame(update);
    } else {
      setIma("/play.svg");
      removeEvents();
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      removeEvents();
      cancelAnimationFrame(animationRef.current);
    };
  }, [pause, winner, countDown]);

  const gameRender = () => {
    if (canvas) {
      canvasResize();
      Context = Board.getContext("2d");
      Context.fillStyle = "#DFDFDF";
      Context.shadowColor = "rgba(255, 255, 255, 0.25)";
      Context.shadowBlur = 10;
      Context.shadowSpread = 1;
      animationRef.current = requestAnimationFrame(update);
    }
  };

  useEffect(() => {
    gameRender();
    window.addEventListener("keydown", pauseGame);
    return () => {
      window.removeEventListener("keydown", pauseGame);
    }
  }, [canvas]);

  function image_renaming(name) {
    return `${apiUrl}` + name;
  }

  useEffect(() => {
    setTimeout(() => {
      if (countDown > 0) setCountDown((e) => e - 1);
    }, 1000);
  }, [countDown]);
  if (!roomData) return <LoadingPage />;
  return (
    <div
      className={
        winner && mode !== "Local" ? "RoomContainer fade-out" : "RoomContainer"
      }
    >
      <div className="RoomFirst">
        <div className="room-userinfo">
          <div className="image">
            <img
              src={image_renaming(player1?.avatar)}
              className="avatar"
              alt=""
            />
          </div>
          <div className="Roominfos">
            <span id="infosHeader">{player1?.username?.substring(0, 9)}</span>
            <span id="infostext">{player1?.goals}</span>
          </div>
        </div>
        <div className="enemyinfo">
          <div className="Roominfos">
            <span id="infosHeader">{player2?.username?.substring(0, 9)}</span>
            <span id="infostext">{player2?.goals}</span>
          </div>
          <div className="image">
            <img
              src={image_renaming(player2?.avatar)}
              className="avatar"
              alt=""
            />
          </div>
        </div>
      </div>
      <div className="RoomSecond">
        {winner && (
          <div className="winnerdiplay">
            <div className="win" style={{ position: "" }}>
              <p>Winner is {winner}</p>
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
            }}
          >
            <img src="/retry.svg" alt="" className="pauseIcons retry" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LocalRoom;
