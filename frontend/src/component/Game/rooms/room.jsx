import React, {
  useEffect,
  useState,
  useRef,
  useCallback
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
let WSocket;

const host = process.env.REACT_APP_API_HOSTNAME;
const apiUrl = process.env.REACT_APP_API_URL;

const Room = ({ data, mode }) => {
  const [roomData, setRoomData] = useState(null);
  const [player1, setPlayer1] = useState(null);
  const [player2, setPlayer2] = useState(null);

  const ball = useRef({
    x: boardWidth / 2,
    y: boardHeight / 2,
    height: 20,
    width: 20,
  });

  const rightPaddle = useRef({
    x: boardWidth - 20,
    y: boardHeight / 2 - 50,
    height: 100,
    width: 20,
  });

  const leftPaddle = useRef({
    x: 0,
    y: boardHeight / 2 - 50,
    height: 100,
    width: 20,
  });

  const [userData, setUserData] = useState(null);
  const [ima, setIma] = useState("/pause.svg");
  const [close, setClose] = useState(false);
  const [canvas, setCanvas] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [pause, setPause] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(false);

  const animationRef = useRef(null);

  const navigate = useNavigate();

  const { setError, error } = useError();

  const [gamemode, setGamemode] = useState(null);

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

  const webSocketMessageHandle = (e) => {
    let tmp = JSON.parse(e.data);
    if (!roomData && tmp)
      setRoomData(tmp);
    if (tmp?.ballInfo)
      ball.current = { ...tmp?.ballInfo };
    if (tmp?.leftPaddle)
      leftPaddle.current = { ...tmp.leftPaddle };
    if (tmp?.rightPaddle)
      rightPaddle.current = { ...tmp.rightPaddle };
    if (tmp?.room_paused !== undefined && tmp?.room_paused !== null)
      setPause(tmp?.room_paused);

    if (tmp?.user1 && tmp?.user2)
      if (tmp?.user1?.username === userData?.username)
        {
          setPlayer1(tmp?.user1);
          setPlayer2(tmp?.user2);
        }
        else
        {
          setPlayer1(tmp?.user2);
          setPlayer2(tmp?.user1);
          setCurrentPlayer(true);
        }

    if (tmp?.winner)
      setWinner(() => {
        return tmp?.winner;
      });

    if (tmp?.stat === "close") {
      setClose(true);
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    }

    if (tmp?.error) {
      setError(tmp?.error);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }

    tmp?.stat === "countdown"
      ? setCountDown(tmp?.value)
      : setCountDown(() => 0);
  }

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
    if (!winner && !countDown)
        WSocket?.send(
          JSON.stringify({
            type: "keypress",
            key: "Space",
          })
        );
  }

  const pauseGame =
    (e) => {
      if (e.key === " " && !winner) {
        e.preventDefault(); // Prevent default space bar action
        e.stopPropagation();
        handlePause();
      }
    }

  const update = useCallback(() => {
    // Cancel any existing animation frame before requesting a new one 
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  
    // Only continue if game is active
    if (pause || !Context) {
      return;
    }
  
    // Clear the entire canvas once per frame
    Context.clearRect(0, 0, boardWidth, boardHeight);
    
    // Cache frequently accessed properties
    const currentLeftPaddle = leftPaddle.current;
    const currentRightPaddle = rightPaddle.current;
    const currentBall = ball.current;
  
    // Set shared styles once
    Context.fillStyle = "#DFDFDF";
    Context.shadowColor = "rgba(255, 255, 255, 0.25)";
    Context.shadowBlur = 10;
    Context.shadowSpread = 1;
  
    // Draw game elements
    drawRoundedRect(
      Context,
      currentLeftPaddle?.x,
      currentLeftPaddle?.y,
      currentLeftPaddle?.width,
      currentLeftPaddle?.height,
      5,
      1
    );
    
    drawRoundedRect(
      Context,
      currentRightPaddle?.x,
      currentRightPaddle?.y,
      currentRightPaddle?.width,
      currentRightPaddle?.height,
      5,
      1
    );
    
    drawRoundedRect(
      Context,
      currentBall?.x,
      currentBall?.y,
      currentBall?.width,
      currentBall?.height,
      10,
      1
    );
  
    // Schedule next frame
    animationRef.current = requestAnimationFrame(update);
  }
  , [pause, Context, leftPaddle, rightPaddle, ball, drawRoundedRect]);

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
        return `wss://${host}/ws/game/Remote/${userData?.["id"]}`;
      else if (gamemode === "bot")
        return `wss://${host}/ws/game/bot/${data?.["botmode"]}/${userData?.["id"]}`;
      else if (gamemode === "friends")
        return `wss://${host}/ws/game/friends/${data?.["room"]}/${userData?.["id"]}`;
      return null;
    }

    if (!userData) return;
    const url = getWSUrl();
    if (url) {
      WSocket = new WebSocket(url);

      WSocket.onmessage = webSocketMessageHandle

      return () => {
        if (WSocket) {
          WSocket.close();
        }
        cancelAnimationFrame(animationRef.current);
      };
    }
  }, [userData]);

  useEffect(() => {
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
            .post(`${apiUrl}/api/users/token/refresh/`, { refresh })
            .then((refreshResponse) => {
              const { access: newAccess } = refreshResponse.data;
              localStorage.setItem("access", newAccess);
              
              fetch(`${apiUrl}/api/users/profile/`, {
                headers: { Authorization: `Bearer ${newAccess}` }
              }).then(response => {
                if (response.ok) {
                  retryFunction();
                } else {
                  console.log("Error fetching user data after token refresh");
                  localStorage.removeItem("access");
                  localStorage.removeItem("refresh");
                  window.location.reload();
                  navigate("/");
                }
              });
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
  }, [mode, userData]);

  useEffect(() => {
    const handleEvents = () => {
      window.addEventListener("keydown", movePlayer);
      window.addEventListener("keyup", stopPlayer);
    };
  
    const removeEvents = () => {
      window.removeEventListener("keydown", movePlayer);
      window.removeEventListener("keyup", stopPlayer);
    };

    if (!pause && !winner && !countDown) {
      setIma(() => "/pause.svg");
      handleEvents()
      animationRef.current = requestAnimationFrame(update);
    } else {
      setIma(() => "/play.svg");
      removeEvents()
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      removeEvents()
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [pause, winner, countDown]);
  
  useEffect(() => {
    if (canvas) {
      canvasResize();
      Context = Board.getContext("2d");
      Context.fillStyle = "#DFDFDF";
      Context.shadowColor = "rgba(255, 255, 255, 0.25)";
      Context.shadowBlur = 10;
      Context.shadowSpread = 1;
      animationRef.current = requestAnimationFrame(update);
    }
    if (!countDown && !winner)
      window.addEventListener("keydown", pauseGame);
    else
      window.removeEventListener("keydown", pauseGame);
    return () => {
      window.removeEventListener("keydown", pauseGame);
    };
  }, [canvas, pauseGame, countDown]);

  function image_renaming(name) {
    return `${apiUrl}` + name;
  }

  useEffect(() => {
    setTimeout(() => {
      if (countDown > 0) setCountDown((e) => e - 1);
    }, 1000);
  }, [countDown]);

  if (!roomData || error) return <LoadingPage />;
  return (
    <div className={close ? "RoomContainer fade-out" : "RoomContainer"}>
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
          style={currentPlayer ? { transform: "scale(-1, 1)" } : {}}
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