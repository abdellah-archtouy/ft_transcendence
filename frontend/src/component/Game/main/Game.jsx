import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TournamentVector from "../../../icons/TournamentVector.svg";
import BotVector from "../../../icons/BotVector.svg";
import FriendVector from "../../../icons/FriendVector.svg";
import controles from "./controles.png";
import "./Game.css";

const Game = () => {
  const [fadeout, setFadeout] = useState(false);
  const [controleDis, setControleDis] = useState(true);
  const [target, setTarget] = useState("");
  const [audio] = useState(new Audio("/select1.mp3"));
  const history = useNavigate();

  const hoverPlay = () => {
    if (audio)
      {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0.3;
        audio.play().catch((error) => {
          console.error("Autoplay failed:", error.message);
        });
      }
  };

  const handleClick = (event, route) => {
    event.preventDefault();
    setTarget(route);
    setFadeout(true);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setControleDis(false);
    }, 4000);
    return () => {
      clearTimeout(timeout)
    };
  }, []);

  useEffect(() => {
    if (fadeout) {
      const timeout = setTimeout(() => {
        history(target);
      }, 2 * 1000);
      return () => clearTimeout(timeout);
    }
  }, [fadeout, target, history]);

  return (
    <div className="game">
      <div className="game_container">
        <div className="game_first">
          <Link
            className={`game_Tournament ${fadeout ? "fade-out" : ""}`}
            onMouseEnter={hoverPlay}
            onClick={(event) => handleClick(event, '/game/tournament')}
          >
            <h1>Tournament</h1>
            <img src={TournamentVector} alt="" />
          </Link>
        </div>
        <div className="game_second">
          <Link
            className={`game_bot ${fadeout ? "fade-out" : ""}`}
            onMouseEnter={hoverPlay}
            onClick={(event) => handleClick(event, '/game/gamemode')}
          >
            <h1>Bot</h1>
            <img src={BotVector} alt="" />
          </Link>
          <Link
            className={`game_friend ${fadeout ? "fade-out" : ""}`}
            onMouseEnter={hoverPlay}
            onClick={(event) => handleClick(event, '/game/friend')}
          >
            <h1>1 vs 1</h1>
            <img src={FriendVector} alt="" />
          </Link>
        </div>
      </div>
        <div className={controleDis ? "controls" : "controls fade-out"}>
          <h1>How to play</h1>
          <img src={controles} alt="" />
        </div>
    </div>
  );
};

export default Game;
