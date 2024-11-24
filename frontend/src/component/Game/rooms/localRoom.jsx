import React, { useEffect, useState, useRef, useCallback } from "react";
import LoadingPage from "../../loadingPage/loadingPage";
import "./room.css";

let Board;
let boardWidth = 1000;
let boardHeight = 550;
let Context;

let player1 = {
  x: 0,
  y: boardHeight / 2 - 50,
  height: 100,
  width: 20,
};

let player2 = {
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
  const [user, setUser] = useState(null);
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
    width *= scaleX;
    height *= scaleY;
    radius *= scaleX;
    x *= scaleX;
    y *= scaleY;
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
    if (e.code === "KeyW") {
      WSocket?.send(
        JSON.stringify({
          type: "keypress",
          key: e.code,
        })
      );
    }
    if (e.code === "KeyS") {
      WSocket?.send(
        JSON.stringify({
          type: "keypress",
          key: e.code,
        })
      );
    }
    if (e.code === "ArrowUp") {
      WSocket?.send(
        JSON.stringify({
          type: "keypress",
          key: e.code,
        })
      );
    }
    if (e.code === "ArrowDown") {
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

  const pauseGame = useCallback(
    (e) => {
      if (e.key === " " && !winner) {
        handlePause();
      }
    },
    [winner]
  );

  const update = useCallback(() => {
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
      player1?.x,
      player1?.y,
      player1?.width,
      player1?.height,
      5,
      1
    );
    drawRoundedRect(
      Context,
      player2?.x,
      player2?.y,
      player2?.width,
      player2?.height,
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
  }, [pause]);

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
        return `ws://${host}:8000/ws/game/Local/${username1}/${username2}`;
      } else return null;
    }

    const url = getWSUrl();
    if (!url) return;
    WSocket = new WebSocket(url);

    function compaireObjects(a, b) {
      if (
        a !== undefined &&
        b !== undefined &&
        JSON.stringify(b) !== JSON.stringify(a)
      )
        return true;
      return false;
    }

    WSocket.onmessage = function (e) {
      let tmp = JSON.parse(e.data);
      if (compaireObjects(tmp?.ballInfo, ball)) ball = tmp?.ballInfo;
      if (compaireObjects(tmp?.leftPaddle, player1)) player1 = tmp?.leftPaddle;
      if (compaireObjects(tmp?.rightPaddle, player2))
        player2 = tmp?.rightPaddle;
      setRoomData(() => {
        return tmp;
      });
      setPause(() => {
        return tmp?.room_paused;
      });
      setUser((e) => {
        let obj = e;
        if (
          obj === null ||
          (obj !== null &&
            (compaireObjects(tmp?.user1, obj[0]) ||
              compaireObjects(tmp?.user2, obj[1])))
        )
          obj = [{ ...tmp?.user1 }, { ...tmp?.user2 }];
        return obj;
      });
      if (mode === "TournamentLocal" && tmp?.winner) theWinner(tmp?.winner);
      if (tmp?.winner !== null)
        setWinner(() => {
          return tmp?.winner;
        });
    };

    return () => {
      if (WSocket) WSocket.close();
    };
  }, [mode, theWinner]);

  useEffect(() => {
    if (!pause) {
      setIma("/pause.svg");
      window.addEventListener("keydown", movePlayer);
      window.addEventListener("keyup", stopPlayer);
      animationRef.current = requestAnimationFrame(update);
    } else {
      setIma("/play.svg");
      window.removeEventListener("keydown", movePlayer);
      window.removeEventListener("keyup", stopPlayer);
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", movePlayer);
      window.removeEventListener("keyup", stopPlayer);
    };
  }, [pause, winner, update]);

  const gameRender = useCallback(() => {
    if (canvas) {
      canvasResize();
      Context = Board.getContext("2d");
      Context.fillStyle = "#DFDFDF";
      Context.shadowColor = "rgba(255, 255, 255, 0.25)";
      Context.shadowBlur = 10;
      Context.shadowSpread = 1;
      window.addEventListener("keydown", movePlayer);
      window.addEventListener("keyup", stopPlayer);
      window.addEventListener("keydown", pauseGame);
      animationRef.current = requestAnimationFrame(update);
    }
  }, [canvas, update, pauseGame]);

  useEffect(() => {
    gameRender();
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", movePlayer);
      window.removeEventListener("keyup", stopPlayer);
      window.removeEventListener("keydown", pauseGame);
    };
  }, [canvas, pauseGame, gameRender]);

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
    <div className={winner && mode !== "Local" ? "RoomContainer fade-out" : "RoomContainer"}>
      <div className="RoomFirst">
        <div className="room-userinfo">
          <div className="image">
            <img
              src={image_renaming(user?.[0]?.avatar)}
              className="avatar"
              alt=""
            />
          </div>
          <div className="Roominfos">
            <span id="infosHeader">{user?.[0]?.username.substring(0, 9)}</span>
            <span id="infostext">{user?.[0]?.goals}</span>
          </div>
        </div>
        <div className="enemyinfo">
          <div className="Roominfos">
            <span id="infosHeader">{user?.[1]?.username.substring(0, 9)}</span>
            <span id="infostext">{user?.[1]?.goals}</span>
          </div>
          <div className="image">
            <img
              src={image_renaming(user?.[1]?.avatar)}
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
