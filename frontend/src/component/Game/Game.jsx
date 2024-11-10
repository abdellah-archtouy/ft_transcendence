import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TournamentVector from "../../icons/Vector1.svg";
import BotVector from "../../icons/Vector2.svg";
import FriendVector from "../../icons/Vector.svg";
import "./Game.css";

const Game = () => {
  const [fade, setFade] = useState(false);
  const [fadeout, setFadeout] = useState(false);
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
      setFade(false);
    }, 2.2 * 1000);
    return () => clearTimeout(timeout);
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
            className={`game_Tournament ${fade ? "fade-in" : ""} ${fadeout ? "fade-out" : ""}`}
            onMouseEnter={hoverPlay}
            onClick={(event) => handleClick(event, '/game/tournament')}
          >
            <h1>Tournament</h1>
            <img src={TournamentVector} alt="" />
          </Link>
        </div>
        <div className="game_second">
          <Link
            className={`game_bot ${fade ? "fade-in" : ""} ${fadeout ? "fade-out" : ""}`}
            onMouseEnter={hoverPlay}
            onClick={(event) => handleClick(event, '/game/gamemode')}
          >
            <h1>Bot</h1>
            <img src={BotVector} alt="" />
          </Link>
          <Link
            className={`game_friend ${fade ? "fade-in" : ""} ${fadeout ? "fade-out" : ""}`}
            onMouseEnter={hoverPlay}
            onClick={(event) => handleClick(event, '/game/friend')}
          >
            <h1>Friends</h1>
            <img src={FriendVector} alt="" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Game;
