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
import { useError } from "../../../App"

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
let current_player = 0;
let other_player = 1;

const host = process.env.REACT_APP_API_HOSTNAME;
const apiUrl = process.env.REACT_APP_API_URL;
let errors = null

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
  
  const { setError } = useError();

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
          if (!e)
            {
              if (obj[1]?.username === userData?.username)
                {
                  current_player = 1;
                  other_player = 0;
                }
                else
                {
                  current_player = 0;
                  other_player = 1;
                }
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
        if (tmp?.error) {
          setError(tmp?.error);
          errors = tmp?.error;
          setTimeout(() => {
            stableNavigate(-1);
          }, 2000);
        }
        tmp?.stat === "countdown"
          ? setCountDown(tmp?.value)
          : setCountDown(() => 0);
      };

      return () => {
        WSocket.close();
      };
    }
  }, [userData, stableNavigate, data, gamemode, setError]);

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
      if (error.response && error.response.status === 401) {
        const refresh = localStorage.getItem("refresh");
  
        if (refresh) {
          axios
            .post(`${apiUrl}/api/token/refresh/`, { refresh })
            .then((refreshResponse) => {
              const { access: newAccess } = refreshResponse.data;
              localStorage.setItem("access", newAccess);
              retryFunction();
            })
            .catch((refreshError) => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              console.log({ general: "Session expired. Please log in again." });
              window.location.reload();
              navigate("/");
            });
          } else {
            console.log({ general: "No refresh token available. Please log in." });
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.reload();
            navigate("/");
        }
      } else {
        console.log({ general: "An unexpected error occurred. Please try again." });
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

  if (!user || errors) return <LoadingPage />;
  return (
    <div className={close ? "RoomContainer fade-out" : "RoomContainer"}>
      <div className="RoomFirst">
        <div className="room-userinfo">
          <div className="image">
            <img
              src={image_renaming(user?.[current_player]?.avatar)}
              className="avatar"
              alt=""
            />
          </div>
          <div className="Roominfos">
            <span id="infosHeader">{user?.[current_player]?.username?.substring(0, 9)}</span>
            <span id="infostext">{user?.[current_player]?.goals}</span>
          </div>
        </div>
        <div className="enemyinfo">
          <div className="Roominfos">
            <span id="infosHeader">{user?.[other_player]?.username?.substring(0, 9)}</span>
            <span id="infostext">{user?.[other_player]?.goals}</span>
          </div>
          <div className="image">
            <img
              src={image_renaming(user?.[other_player]?.avatar)}
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
        {winner && (
          <div className="winnerdiplay">
            <div className="win" style={{ position: "" }}>
              <p>You {winner === userData.id ? "Win" : "Lose"}</p>
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
          style={userData?.username === user[1]?.username ? {transform:"scale(-1, 1)"} : {}}
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


// import React, {
//   useEffect,
//   useState,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
// import LoadingPage from "../../loadingPage/loadingPage";
// import axios from "axios";
// import "./room.css";
// import { useNavigate } from "react-router-dom";
// import { useError } from "../../../App";
// import isEqual from "lodash/isEqual";

// const boardWidth = 1000;
// const boardHeight = 550;

// let current_player = 0;
// let other_player = 1;

// const host = process.env.REACT_APP_API_HOSTNAME;
// const apiUrl = process.env.REACT_APP_API_URL;
// let errors = null;

// const Room = ({ data, mode }) => {
//   const [user, setUser] = useState(null);
//   const [userData, setUserData] = useState(null);
//   const [ima, setIma] = useState("/pause.svg");
//   const [close, setClose] = useState(false);
//   const [canvas, setCanvas] = useState(false);
//   const [countDown, setCountDown] = useState(0);
//   const [pause, setPause] = useState(false);
//   const [winner, setWinner] = useState(null);

//   const boardRef = useRef(null);
//   const contextRef = useRef(null);
//   const webSocketRef = useRef(null);
//   const animationRef = useRef(null);

//   const player1Ref = useRef({
//     x: 0,
//     y: boardHeight / 2 - 50,
//     height: 100,
//     width: 20,
//     velocityY: 0,
//   });

//   const player2Ref = useRef({
//     x: boardWidth - 20,
//     y: boardHeight / 2 - 50,
//     height: 100,
//     width: 20,
//     velocityY: 0,
//   });

//   const ballRef = useRef({
//     x: boardWidth / 2,
//     y: boardHeight / 2,
//     height: 20,
//     width: 20,
//   });

//   const navigate = useNavigate();
//   const stableNavigate = useMemo(
//     () =>
//       (...args) =>
//         navigate(...args),
//     [navigate]
//   );

//   const { setError } = useError();

//   const [gamemode, setGamemode] = useState(null);

  // const drawRoundedRect = (ctx, player, opacity) => {
  //   const { x = 0, y = 0, width = 0, height = 0 } = player || {};
  //   const scaleX = boardRef?.current?.width / boardWidth;
  //   const scaleY = boardRef?.current?.height / boardHeight;
  //   const scaledwidth = width * scaleX;
  //   const scaledheight = height * scaleY;
  //   const radius = 5 * scaleX;
  //   const scaledX = Math.floor(x) * scaleX;
  //   const scaledY = Math.floor(y) * scaleX;
  //   ctx.beginPath();
  //   ctx.moveTo(scaledX + radius, scaledY);
  //   ctx.lineTo(scaledX + scaledwidth - radius, scaledY);
  //   ctx.arcTo(scaledX + scaledwidth, scaledY, scaledX + scaledwidth, scaledY + radius, radius);
  //   ctx.lineTo(scaledX + scaledwidth, scaledY + scaledheight - radius);
  //   ctx.arcTo(scaledX + scaledwidth, scaledY + scaledheight, scaledX + scaledwidth - radius, scaledY + scaledheight, radius);
  //   ctx.lineTo(scaledX + radius, scaledY + scaledheight);
  //   ctx.arcTo(scaledX, scaledY + scaledheight, scaledX, scaledY + scaledheight - radius, radius);
  //   ctx.lineTo(scaledX, scaledY + radius);
  //   ctx.arcTo(scaledX, scaledY, scaledX + radius, scaledY, radius);
  //   ctx.closePath();
  //   ctx.globalAlpha = opacity;
  //   ctx.fill();
  // };







//   const drawRoundedRect = (ctx, player, opacity) => {
//     const { x = 0, y = 0, width = 0, height = 0 } = player || {};
//     const board = boardRef?.current;
//     if (!board) return;
//     const scaleX = board.width / boardWidth;
//     const scaleY = board.height / boardHeight;
//     const scaledX = Math.floor(x) * scaleX;
//     const scaledY = Math.floor(y) * scaleY; // Fixed scaling on Y as well
//     const scaledWidth = width * scaleX;
//     const scaledHeight = height * scaleY;
//     const radius = 5 * scaleX;
//     ctx.save();
//     ctx.globalAlpha = opacity;
//     ctx.beginPath();
//     ctx.moveTo(scaledX + radius, scaledY);
//     ctx.lineTo(scaledX + scaledWidth - radius, scaledY);
//     ctx.arcTo(
//       scaledX + scaledWidth,
//       scaledY,
//       scaledX + scaledWidth,
//       scaledY + radius,
//       radius
//     );
//     ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight - radius);
//     ctx.arcTo(
//       scaledX + scaledWidth,
//       scaledY + scaledHeight,
//       scaledX + scaledWidth - radius,
//       scaledY + scaledHeight,
//       radius
//     );
//     ctx.lineTo(scaledX + radius, scaledY + scaledHeight);
//     ctx.arcTo(
//       scaledX,
//       scaledY + scaledHeight,
//       scaledX,
//       scaledY + scaledHeight - radius,
//       radius
//     );
//     ctx.lineTo(scaledX, scaledY + radius);
//     ctx.arcTo(scaledX, scaledY, scaledX + radius, scaledY, radius);
//     ctx.closePath();
//     ctx.fill();
//     ctx.restore();
//   };

//   function buttonMovement(event) {
//     if (event === "KeyW") {
//       webSocketRef?.current?.send(
//         JSON.stringify({
//           type: "keypress",
//           key: "KeyW",
//         })
//       );
//     }
//     if (event === "KeyS") {
//       webSocketRef?.current?.send(
//         JSON.stringify({
//           type: "keypress",
//           key: "KeyS",
//         })
//       );
//     }
//     if (event === "Down") {
//       webSocketRef?.current?.send(
//         JSON.stringify({
//           type: "keydown",
//           key: "KeyS",
//         })
//       );
//     }
//   }

//   function movePlayer(e) {
//     if (e.code === "KeyW" || e.code === "ArrowUp") {
//       webSocketRef?.current?.send(
//         JSON.stringify({
//           type: "keypress",
//           key: e.code,
//         })
//       );
//     }
//     if (e.code === "KeyS" || e.code === "ArrowDown") {
//       webSocketRef?.current?.send(
//         JSON.stringify({
//           type: "keypress",
//           key: e.code,
//         })
//       );
//     }
//   }

//   function reset_all() {
//     webSocketRef?.current?.send(
//       JSON.stringify({
//         type: "reset_all",
//         key: "click",
//       })
//     );
//   }

//   function stopPlayer(e) {
//     if (
//       e.code === "KeyW" ||
//       e.code === "ArrowUp" ||
//       e.code === "KeyS" ||
//       e.code === "ArrowDown"
//     ) {
//       webSocketRef?.current?.send(
//         JSON.stringify({
//           type: "keydown",
//           key: e.code,
//         })
//       );
//     }
//   }

//   function handlePause() {
//     webSocketRef?.current?.send(
//       JSON.stringify({
//         type: "keypress",
//         key: "Space",
//       })
//     );
//   }

//   const pauseGame = useCallback(
//     (e) => {
//       if (e.key === " " && !winner) {
//         handlePause();
//       }
//     },
//     [winner]
//   );

//   const update = useCallback(() => {
//     if (pause === false) animationRef.current = requestAnimationFrame(update);
//     else cancelAnimationFrame(animationRef.current);
//     if (!contextRef?.current) return;
//     contextRef.current.clearRect(0, 0, boardWidth, boardHeight);
//     contextRef.current.fillStyle = "#DFDFDF";
//     contextRef.current.shadowColor = "rgba(255, 255, 255, 0.25)";
//     contextRef.current.shadowBlur = 10;
//     contextRef.current.shadowSpread = 1;
//     drawRoundedRect(contextRef?.current, player1Ref?.current, 1);
//     drawRoundedRect(contextRef?.current, player2Ref?.current, 1);
//     drawRoundedRect(contextRef?.current, ballRef?.current, 1);
//   }, [pause]);

//   function canvasResize() {
//     boardRef.current = document.getElementById("Rcanvas");
//     boardRef.current.height = boardHeight;
//     boardRef.current.width = boardWidth;
//   }

//   let leftPaddleRef = useRef();
//   let rightPaddleRef = useRef();

//   const handleLeftPaddleMouseDown = () => {
//     if (leftPaddleRef.current && !pause && !winner) {
//       leftPaddleRef.current.classList.add("active");
//       buttonMovement("KeyW");
//     }
//   };

//   const handleLeftPaddleMouseUp = () => {
//     if (leftPaddleRef.current && !pause && !winner) {
//       leftPaddleRef.current.classList.remove("active");
//       buttonMovement("Down");
//     }
//   };

//   const handleRightPaddleMouseDown = () => {
//     if (rightPaddleRef.current && !pause && !winner) {
//       rightPaddleRef.current.classList.add("active");
//       buttonMovement("KeyS");
//     }
//   };

//   const handleRightPaddleMouseUp = () => {
//     if (rightPaddleRef.current && !pause && !winner) {
//       rightPaddleRef.current.classList.remove("active");
//       buttonMovement("Down");
//     }
//   };

//   useEffect(() => {
//     function getWSUrl() {
//       if (gamemode === "Remote")
//         return `ws://${host}:8000/ws/game/Remote/${userData?.["id"]}`;
//       else if (gamemode === "bot")
//         return `ws://${host}:8000/ws/game/bot/${data?.["botmode"]}/${userData?.["id"]}`;
//       else if (gamemode === "friends")
//         return `ws://${host}:8000/ws/game/friends/${data?.["room"]}/${userData?.["id"]}`;
//       return null;
//     }

//     function handleWebSocketMessage(e) {
//       let tmp = JSON.parse(e.data);

//       if (!isEqual(tmp?.ballInfo, ballRef?.current)) {
//         ballRef.current.x = tmp?.ballInfo?.x;
//         ballRef.current.y = tmp?.ballInfo?.y;
//       }

//       if (!isEqual(tmp?.leftPaddle, player1Ref?.current)) {
//         player1Ref.current.x = tmp?.leftPaddle?.x;
//         player1Ref.current.y = tmp?.leftPaddle?.y;
//       }

//       if (!isEqual(tmp?.rightPaddle, player2Ref?.current)) {
//         player2Ref.current.x = tmp?.rightPaddle?.x;
//         player2Ref.current.y = tmp?.rightPaddle?.y;
//       }

//       setPause(() => {
//         return tmp?.room_paused;
//       });

//       setUser((e) => {
//         let obj = e;
//         if (
//           obj === null ||
//           (obj !== null &&
//             (isEqual(tmp?.user1, obj[0]) || isEqual(tmp?.user2, obj[1])))
//         ) {
//           obj = [{ ...tmp?.user1 }, { ...tmp?.user2 }];
//         }
//         if (!e) {
//           if (obj[1]?.username === userData?.username) {
//             current_player = 1;
//             other_player = 0;
//           } else {
//             current_player = 0;
//             other_player = 1;
//           }
//         }
//         return obj;
//       });

//       if (tmp?.winner !== null) {
//         setWinner(() => {
//           return tmp?.winner;
//         });
//       }
//       if (tmp?.stat === "close") {
//         setClose(true);
//         setTimeout(() => {
//           stableNavigate(-1);
//         }, 1000);
//       }
//       if (tmp?.error) {
//         setError(tmp?.error);
//         errors = tmp?.error;
//         setTimeout(() => {
//           stableNavigate(-1);
//         }, 2000);
//       }
//       tmp?.stat === "countdown"
//         ? setCountDown(tmp?.value)
//         : setCountDown(() => 0);
//     }

//     if (!userData) return;
//     const url = getWSUrl();
//     if (url) {
//       webSocketRef.current = new WebSocket(url);
//       webSocketRef.current.onmessage = handleWebSocketMessage;

//       return () => {
//         webSocketRef?.current?.close();
//       };
//     }
//   }, [userData, stableNavigate, data, gamemode, setError]);

//   useEffect(() => {
//     /**************************************/
//     /*     hna  remote game katbda        */
//     /**************************************/

//     if (mode) setGamemode(mode);

//     const fetchUserData = async () => {
//       try {
//         const access = localStorage.getItem("access");

//         const response = await axios.get(`${apiUrl}/api/users/profile/`, {
//           headers: {
//             Authorization: `Bearer ${access}`,
//           },
//         });
//         setUserData(response.data);
//       } catch (error) {
//         handleFetchError(error, fetchUserData);
//       }
//     };

//     const handleFetchError = (error, retryFunction) => {
//       if (error.response && error.response.status === 401) {
//         const refresh = localStorage.getItem("refresh");

//         if (refresh) {
//           axios
//             .post(`${apiUrl}/api/token/refresh/`, { refresh })
//             .then((refreshResponse) => {
//               const { access: newAccess } = refreshResponse.data;
//               localStorage.setItem("access", newAccess);
//               retryFunction();
//             })
//             .catch((refreshError) => {
//               localStorage.removeItem("access");
//               localStorage.removeItem("refresh");
//               console.log({ general: "Session expired. Please log in again." });
//               window.location.reload();
//               navigate("/");
//             });
//         } else {
//           console.log({
//             general: "No refresh token available. Please log in.",
//           });
//           localStorage.removeItem("access");
//           localStorage.removeItem("refresh");
//           window.location.reload();
//           navigate("/");
//         }
//       } else {
//         console.log({
//           general: "An unexpected error occurred. Please try again.",
//         });
//       }
//     };

//     if (!userData) fetchUserData();
//   }, [stableNavigate, mode, userData]);

//   useEffect(() => {
//     if (!pause) {
//       setIma(() => "/pause.svg");
//       window.addEventListener("keydown", movePlayer);
//       window.addEventListener("keyup", stopPlayer);
//       animationRef.current = requestAnimationFrame(update);
//     } else {
//       setIma(() => "/play.svg");
//       window.removeEventListener("keydown", movePlayer);
//       window.removeEventListener("keyup", stopPlayer);
//       cancelAnimationFrame(animationRef.current);
//     }

//     return () => {
//       cancelAnimationFrame(animationRef.current);
//       window.removeEventListener("keydown", movePlayer);
//       window.removeEventListener("keyup", stopPlayer);
//     };
//   }, [pause, winner, countDown, update]);

//   const gameRender = useCallback(() => {
//     if (canvas) {
//       canvasResize();
//       contextRef.current = boardRef?.current?.getContext("2d");
//       contextRef.current.fillStyle = "#DFDFDF";
//       contextRef.current.shadowColor = "rgba(255, 255, 255, 0.25)";
//       contextRef.current.shadowBlur = 10;
//       contextRef.current.shadowSpread = 1;
//       window.addEventListener("keydown", movePlayer);
//       window.addEventListener("keyup", stopPlayer);
//       window.addEventListener("keydown", pauseGame);
//       animationRef.current = requestAnimationFrame(update);
//     }
//   }, [canvas, update, pauseGame]);

//   useEffect(() => {
//     gameRender();
//     return () => {
//       cancelAnimationFrame(animationRef.current);
//       window.removeEventListener("keydown", movePlayer);
//       window.removeEventListener("keyup", stopPlayer);
//       window.removeEventListener("keydown", pauseGame);
//     };
//   }, [canvas, gameRender, pauseGame]);

//   function image_renaming(name) {
//     return `${apiUrl}` + name;
//   }

//   useEffect(() => {
//     setTimeout(() => {
//       if (countDown > 0) setCountDown((e) => e - 1);
//     }, 999);
//   }, [countDown]);

//   if (!user || errors) return <LoadingPage />;
//   return (
//     <div className={close ? "RoomContainer fade-out" : "RoomContainer"}>
//       <div className="RoomFirst">
//         <div className="room-userinfo">
//           <div className="image">
//             <img
//               src={image_renaming(user?.[current_player]?.avatar)}
//               className="avatar"
//               alt=""
//             />
//           </div>
//           <div className="Roominfos">
//             <span id="infosHeader">
//               {user?.[current_player]?.username?.substring(0, 9)}
//             </span>
//             <span id="infostext">{user?.[current_player]?.goals}</span>
//           </div>
//         </div>
//         <div className="enemyinfo">
//           <div className="Roominfos">
//             <span id="infosHeader">
//               {user?.[other_player]?.username?.substring(0, 9)}
//             </span>
//             <span id="infostext">{user?.[other_player]?.goals}</span>
//           </div>
//           <div className="image">
//             <img
//               src={image_renaming(user?.[other_player]?.avatar)}
//               className="avatar"
//               alt=""
//             />
//           </div>
//         </div>
//       </div>
//       <div className="RoomSecond">
//         {countDown > 0 && (
//           <div className="RoomCountDown">
//             <p>{countDown}</p>
//           </div>
//         )}
//         {winner && (
//           <div className="winnerdiplay">
//             <div className="win" style={{ position: "" }}>
//               <p>You {winner === userData.id ? "Win" : "Lose"}</p>
//             </div>
//           </div>
//         )}

//         {pause && !winner && (
//           <div className="pauseDisplay">
//             <p>Pause</p>
//           </div>
//         )}

//         <canvas
//           id="Rcanvas"
//           style={
//             userData?.username === user[1]?.username
//               ? { transform: "scale(-1, 1)" }
//               : {}
//           }
//           ref={(c) => {
//             if (c) setCanvas(true);
//           }}
//         />
//       </div>
//       <div className="buttons">
//         {!winner && (
//           <button
//             className="pause otherIcons"
//             onClick={() => {
//               handlePause();
//             }}
//           >
//             <img src={ima} alt="" className="pauseIcons" />
//           </button>
//         )}
//         {pause && gamemode !== "Remote" && gamemode !== "friends" && (
//           <button
//             className="pause"
//             title="pause"
//             onClick={() => {
//               reset_all();
//             }}
//           >
//             <img src="/retry.svg" alt="" className="pauseIcons retry" />
//           </button>
//         )}
//       </div>
//       <div className="mobilebuttons">
//         <button
//           ref={leftPaddleRef}
//           className="leftPaddle"
//           onTouchStart={handleLeftPaddleMouseDown}
//           onTouchEnd={handleLeftPaddleMouseUp}
//           onMouseDown={handleLeftPaddleMouseDown}
//           onMouseUp={handleLeftPaddleMouseUp}
//         >
//           <img
//             src="/GameMobileButton.svg"
//             alt=""
//             className="GameMobileButton"
//           />
//         </button>
//         <button
//           ref={rightPaddleRef}
//           className="rightPaddle"
//           onTouchStart={handleRightPaddleMouseDown}
//           onTouchEnd={handleRightPaddleMouseUp}
//           onMouseDown={handleRightPaddleMouseDown}
//           onMouseUp={handleRightPaddleMouseUp}
//         >
//           <img
//             src="/GameMobileButton.svg"
//             alt=""
//             className="GameMobileButton"
//           />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Room;
