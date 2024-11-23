import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import LoadingPage from "../../loadingPage/loadingPage";
import axios from "axios";
import "./room.css";
import { useNavigate } from "react-router-dom";

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

const host = process.env.REACT_APP_API_HOSTNAME;
const apiUrl = process.env.REACT_APP_API_URL;

const Room = ({ data, mode }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [ima, setIma] = useState("/pause.svg");
  const [close, setClose] = useState(false);
  const [canvas, setCanvas] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [pause, setPause] = useState(false);
  const [winner, setWinner] = useState(null);

  const animationRef = useRef(null);

  const navigate = useNavigate();
  const stableNavigate = useMemo(
    () =>
      (...args) =>
        navigate(...args),
    [navigate]
  );

  /* setting the bot mode, i used state for that */
  const [gamemode, setGamemode] = useState(null);

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

  function buttonMovement(event) {
    if (event === "KeyW") {
      WSocket?.send(
        JSON.stringify({
          type: "keypress",
          key: "KeyW",
        })
      );
    }
    if (event === "KeyS") {
      WSocket?.send(
        JSON.stringify({
          type: "keypress",
          key: "KeyS",
        })
      );
    }
    if (event === "Down") {
      WSocket?.send(
        JSON.stringify({
          type: "keydown",
          key: "KeyS",
        })
      );
    }
  }

  function movePlayer(e) {
    if (e.code === "KeyW" || e.code === "ArrowUp") {
      WSocket?.send(
        JSON.stringify({
          type: "keypress",
          key: e.code,
        })
      );
    }
    if (e.code === "KeyS" || e.code === "ArrowDown") {
      WSocket?.send(
        JSON.stringify({
          type: "keypress",
          key: e.code,
        })
      );
    }
  }

  function reset_all() {
    WSocket?.send(
      JSON.stringify({
        type: "reset_all",
        key: "click",
      })
    );
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

  let leftPaddleRef = useRef();
  let rightPaddleRef = useRef();

  const handleLeftPaddleMouseDown = () => {
    if (leftPaddleRef.current && !pause && !winner) {
      leftPaddleRef.current.classList.add("active");
      buttonMovement("KeyW");
    }
  };

  const handleLeftPaddleMouseUp = () => {
    if (leftPaddleRef.current && !pause && !winner) {
      leftPaddleRef.current.classList.remove("active");
      buttonMovement("Down");
    }
  };

  const handleRightPaddleMouseDown = () => {
    if (rightPaddleRef.current && !pause && !winner) {
      rightPaddleRef.current.classList.add("active");
      buttonMovement("KeyS");
    }
  };

  const handleRightPaddleMouseUp = () => {
    if (rightPaddleRef.current && !pause && !winner) {
      rightPaddleRef.current.classList.remove("active");
      buttonMovement("Down");
    }
  };

  useEffect(() => {
    function getWSUrl() {
      if (gamemode === "Remote")
        return `ws://${host}:8000/ws/game/Remote/${userData?.["id"]}`;
      else if (gamemode === "bot")
        return `ws://${host}:8000/ws/game/bot/${data?.["botmode"]}/${userData?.["id"]}`;
      else if (gamemode === "friends")
        return `ws://${host}:8000/ws/game/friends/${data?.["room"]}/${userData?.["id"]}`;
      return null;
    }

    if (!userData) return;
    const url = getWSUrl();
    if (url) {
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
        if (compaireObjects(tmp?.leftPaddle, player1))
          player1 = tmp?.leftPaddle;
        if (compaireObjects(tmp?.rightPaddle, player2))
          player2 = tmp?.rightPaddle;
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
          ) {
            obj = [{ ...tmp?.user1 }, { ...tmp?.user2 }];
          }
          return obj;
        });
        if (tmp?.winner !== null)
          {
            setWinner(() => {
              return tmp?.winner;
            });
          }
        if (tmp?.stat === "close") {
          setClose(true);
          setTimeout(() => {
            stableNavigate(-1);
          }, 1000);
        }
        tmp?.stat === "countdown"
          ? setCountDown(tmp?.value)
          : setCountDown(() => 0);
      };

      return () => {
        WSocket.close();
      };
    }
  }, [userData, stableNavigate, data, gamemode]);

  useEffect(() => {
    /**************************************/
    /*     hna  remote game katbda        */
    /**************************************/

    if (mode) setGamemode(mode);

    const fetchUserData = async () => {
      try {
        const access = localStorage.getItem("access");

        const response = await axios.get(`${apiUrl}/api/users/profile/`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        setUserData(response.data);
      } catch (error) {
        handleFetchError(error, fetchUserData);
      }
    };

    const handleFetchError = (error, retryFunction) => {
      if (error.response) {
        if (error.response.status === 401) {
          const refresh = localStorage.getItem("refresh");

          if (refresh) {
            axios
              .post(`${apiUrl}/api/token/refresh/`, { refresh })
              .then((refreshResponse) => {
                const { access: newAccess } = refreshResponse.data;
                localStorage.setItem("access", newAccess);
                retryFunction(); // Retry fetching user data
              })
              .catch((refreshError) => {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                console.log("you have captured the error");
                stableNavigate("/");
                console.log({
                  general: "Session expired. Please log in again.",
                });
              });
          }
        }
      } else {
        console.log({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    };
    if (!userData) fetchUserData();
  }, [stableNavigate, mode, userData]);

  useEffect(() => {
    if (!pause) {
      setIma(() => "/pause.svg");
      window.addEventListener("keydown", movePlayer);
      window.addEventListener("keyup", stopPlayer);
      animationRef.current = requestAnimationFrame(update);
    } else {
      setIma(() => "/play.svg");
      window.removeEventListener("keydown", movePlayer);
      window.removeEventListener("keyup", stopPlayer);
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", movePlayer);
      window.removeEventListener("keyup", stopPlayer);
    };
  }, [pause, winner, countDown, update]);

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
  }, [canvas, gameRender, pauseGame]);

  function image_renaming(name) {
    return `${apiUrl}` + name;
  }

  useEffect(() => {
    setTimeout(() => {
      if (countDown > 0) setCountDown((e) => e - 1);
    }, 999);
  }, [countDown]);

  if (!user) return <LoadingPage />;
  return (
    <div className={close ? "RoomContainer fade-out" : "RoomContainer"}>
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
            <span id="infosHeader">{user?.[0]?.username?.substring(0, 9)}</span>
            <span id="infostext">{user?.[0]?.goals}</span>
          </div>
        </div>
        <div className="enemyinfo">
          <div className="Roominfos">
            <span id="infosHeader">{user?.[1]?.username?.substring(0, 9)}</span>
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
        {countDown > 0 && (
          <div className="RoomCountDown">
            <p>{countDown}</p>
          </div>
        )}
        {winner !== null && (
          <div className="winnerdiplay">
            <div className="win" style={{ position: "" }}>
              <p>You {winner === userData.id ? "Won" : "Lose"}</p>
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
        {pause && gamemode !== "Remote" && gamemode !== "friends" && (
          <button
            className="pause"
            title="pause"
            onClick={() => {
              reset_all();
            }}
          >
            <img src="/retry.svg" alt="" className="pauseIcons retry" />
          </button>
        )}
      </div>
      <div className="mobilebuttons">
        <button
          ref={leftPaddleRef}
          className="leftPaddle"
          onTouchStart={handleLeftPaddleMouseDown}
          onTouchEnd={handleLeftPaddleMouseUp}
          onMouseDown={handleLeftPaddleMouseDown}
          onMouseUp={handleLeftPaddleMouseUp}
        >
          <img
            src="/GameMobileButton.svg"
            alt=""
            className="GameMobileButton"
          />
        </button>
        <button
          ref={rightPaddleRef}
          className="rightPaddle"
          onTouchStart={handleRightPaddleMouseDown}
          onTouchEnd={handleRightPaddleMouseUp}
          onMouseDown={handleRightPaddleMouseDown}
          onMouseUp={handleRightPaddleMouseUp}
        >
          <img
            src="/GameMobileButton.svg"
            alt=""
            className="GameMobileButton"
          />
        </button>
      </div>
    </div>
  );
};

export default Room;
