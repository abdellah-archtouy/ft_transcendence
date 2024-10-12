import React, { useEffect, useState, useRef, useCallback } from "react";
import LoadingPage from "../loadingPage/loadingPage";
import axios from "axios";
import "./room.css";
import { useNavigate } from "react-router-dom";

let ima = "/pause.svg";
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
let gamemode;

const Room = ({ data }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [canvas, setCanvas] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [pause, setPause] = useState(false);
  const [winner, setWinner] = useState(null);
  const animationRef = useRef(null);
  const navigate = useNavigate();

  gamemode = data;

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
  
  function pauseGame(e) {
    if (e.key === " " && !winner) {
      handlePause();
    }
  }

  function update() {
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
  }

  function canvasResize() {
    Board = document.getElementById("Rcanvas");
    Board.height = boardHeight;
    Board.width = boardWidth;
  }

  useEffect(() => {
    if (!userData) return;
    const url = `ws://${window.location.hostname}:8000/ws/game/${gamemode}/${userData.id}`;
    WSocket = new WebSocket(url);

    WSocket.onopen = () => {
      console.log("WebSocket connection established");
    };

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
      setWinner(() => {
        return tmp?.winner;
      });
      if (tmp?.stat === "close") {
        navigate(-1);
      }
      tmp?.stat === "countdown"
        ? setCountDown(tmp?.value)
        : setCountDown(() => 0);
    };

    WSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    WSocket.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };

    return () => {
      WSocket.close();
    };
  }, [userData, navigate]);

  useEffect(() => {
    /**************************************/
    /*     hna  remote game katbda        */
    /**************************************/

    const handleFetchError = (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          const refresh = localStorage.getItem('refresh');

          if (refresh) {
            axios.post('http://localhost:8000/api/token/refresh/', { refresh })
              .then(refreshResponse => {
                const { access: newAccess } = refreshResponse.data;
                localStorage.setItem('access', newAccess);
                fetchUserData(); // Retry fetching user data
              })
              .catch(refreshError => {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                console.log("you have captured the error");
                navigate("/");
                // setErrors({ general: 'Session expired. Please log in again.' });
              });
          } else {
            // setErrors({ general: 'No refresh token available. Please log in.' });
          }
        } else {
          // setErrors({ general: 'Error fetching data. Please try again.' });
        }
      } else {
        // setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    };

    const fetchUserData = async () => {
      try {
        const access = localStorage.getItem('access');

        const response = await axios.get('http://localhost:8000/api/users/profile/', {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        console.log(response.data);
        setUserData(response.data);
        // fetchSuggestedFriends(); // Fetch friends after getting user data

      } catch (error) {
        handleFetchError(error);
      }
    }

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!pause) {
      ima = "/pause.svg";
      window.addEventListener("keydown", movePlayer);
      window.addEventListener("keyup", stopPlayer);
      animationRef.current = requestAnimationFrame(update);
    } else {
      ima = "/play.svg";
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

  const gameRender = () => {
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
  };

  useEffect(() => {
    gameRender();
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("keydown", movePlayer);
      window.removeEventListener("keyup", stopPlayer);
      window.removeEventListener("keydown", pauseGame);
    };
  }, [canvas]);

  function image_renaming(name) {
    return `http://${window.location.hostname}:8000` + name;
  }

  useEffect(() => {
    setTimeout(() => {
      if (countDown > 0) setCountDown((e) => e - 1);
    }, 1000);
  }, [countDown]);

  if (!roomData) return <LoadingPage />;
  return (
    <div className="RoomContainer">
      <div className="RoomFirst">
        <div className="userinfo">
          <div className="image">
            <img src={image_renaming(user?.[0]?.avatar)} className="avatar" alt="" />
          </div>
          <div className="Roominfos">
            <span id="infosHeader">{user?.[0]?.username}</span>
            <span id="infostext">{user?.[0]?.goals}</span>
          </div>
        </div>
        <div className="enemyinfo">
          <div className="Roominfos">
            <span id="infosHeader">{user?.[1]?.username}</span>
            <span id="infostext">{user?.[1]?.goals}</span>
          </div>
          <div className="image">
            <img src={image_renaming(user?.[1]?.avatar)} className="avatar" alt="" />
          </div>
        </div>
      </div>
      <div className="RoomSecond">
        {countDown > 0 && <div>{countDown}</div>}
        {winner && (
          <div className="winnerdiplay">
            <div className="win" style={{ position: "" }}>
              <p>Winner is {winner.username}</p>
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
      <div className="mobilebuttons">
        <button className="leftPaddle">
          <img
            src="/GameMobileButton.svg"
            alt=""
            className="GameMobileButton"
          />
        </button>
        <button className="rightPaddle">
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
