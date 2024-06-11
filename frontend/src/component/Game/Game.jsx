import "./Game.css";
import { Link, useNavigate } from "react-router-dom";
import TournamentVector from "../../icons/Vector1.svg";
import BotVector from "../../icons/Vector2.svg";
import FriendVector from "../../icons/Vector.svg";
import LoadingPage from "../loadingPage/loadingPage"
import { useEffect, useState } from "react";

const Game = () => {
  const [fade, setFade] = useState(false);
  const [fadeout, setFadeout] = useState(false);
  const [target, setTarget] = useState("");
  const [audio] = useState(new Audio("/select1.mp3"));
  const history = useNavigate();

  const hoverPlay = () => {
    audio.volume = 0.3;
    audio.play().catch((error) => {
      console.error("Autoplay failed:", error.message);
    });
  };

  const unhoverPlay = () => {
    audio.pause();
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
    if (fadeout)
    {
      const timeout = setTimeout(() => {
        history(target);
      }, 2 * 1000);
      return () => clearTimeout(timeout);
    }
  }, [fadeout, target, history]);

  return (
    <div className="game">
      <div className="container">
        <div className="first">
            <Link
            className={`Tournament ${fade ? "fade-in" : ""} ${fadeout ? "fade-out" : ""}`}
            to={"/game/tournament"}
            onMouseEnter={hoverPlay}
            onMouseLeave={unhoverPlay}
            onClick={(event) => handleClick(event, '/game/tournament')}
            >
            <h1>Tournament</h1>
            <img src={TournamentVector} alt="" />
            </Link>
        </div>
        <div className="second">
          <Link
            className={`bot ${fade ? "fade-in" : ""} ${fadeout ? "fade-out" : ""}`}
            to={"/game/bot"}
            onMouseEnter={hoverPlay}
            onMouseLeave={unhoverPlay}
            onClick={(event) => handleClick(event, '/game/bot')}
            >
            <h1>Bot</h1>
            <img src={BotVector} alt="" />
          </Link>
          <Link
            className={`friend ${fade ? "fade-in" : ""} ${fadeout ? "fade-out" : ""}`}
            to={"/game/friend"}
            onMouseEnter={hoverPlay}
            onMouseLeave={unhoverPlay}
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
