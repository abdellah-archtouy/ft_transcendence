import "./Game.css"
import { Link } from "react-router-dom";
import TournamentVector from '../../icons/Vector1.svg'
import BotVector from '../../icons/Vector2.svg'
import FriendVector from '../../icons/Vector.svg'
import { useEffect, useState } from "react";

const Game = () => {
    const [fade, setFade] = useState(false);
    const [audio] = useState(new Audio('/select1.mp3'));

    const hoverPlay = () => {
        audio.volume = 0.3;
        audio.play().catch(error => {
            console.error('Autoplay failed:', error.message);
        });
    };
    
    const unhoverPlay = () => {
        audio.pause();
    };
    
    useEffect(() => {
        // let au = new Audio('/start.mp3')
        // au.volume = 0.4;
        // au.play().catch(error => {
        //     console.error('Autoplay failed:', error.message);
        // });
        setFade(true);
        const timeout = setTimeout(() => {
            setFade(false);
        }, 2.2 * 1000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="game">
            <div className="container">
                <Link   className={fade ? "Tournament fade-in" : "Tournament"}
                        to={"/game/tournament"}
                        onMouseEnter={hoverPlay}
                        onMouseLeave={unhoverPlay}>
                    <h1>Tournament</h1>
                    <img src={TournamentVector} alt="" />
                </Link>
                <div className="second">
                    <Link   className={fade ? "bot fade-in" : "bot"} to={"/game/bot"}
                            onMouseEnter={hoverPlay}
                            onMouseLeave={unhoverPlay}>
                        <h1>Bot</h1>
                        <img src={BotVector} alt="" />
                    </Link>
                    <Link   className={fade ? "friend fade-in" : "friend"}
                            to={"/game/friend"}
                            onMouseEnter={hoverPlay}
                            onMouseLeave={unhoverPlay}>
                        <h1>Friends</h1>
                        <img src={FriendVector} alt="" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Game