import React, { useEffect, useState, useCallback } from "react";
import "./tournamentLocal.css";
import LocalRoom from "../../rooms/localRoom";
import { useError } from "../../../../App";

const TournamentLocal = () => {
  const [addTournament, setAddTournament] = useState(false);
  const [tournamentComplete, setTournamentComplete] = useState(false);
  const [tournament, setTournament] = useState(false);
  const [isFirstRound, setIsFirstRound] = useState(true);
  const [theWinner, setTheWinner] = useState([]);
  const [pair, setPair] = useState([]);
  const [matchIndex, setMatchIndex] = useState(0);
  const [players, setPlayers] = useState([null, null, null, null]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const { setError } = useError();

  function handleSubmit(e) {
    e.preventDefault();
    const isNotDuplicated = new Set(players).size === players.length;
    const isFull = players.every((player) => player);
    const hasAllPlayers = isFull && isNotDuplicated;
    if (hasAllPlayers) {
      if (Array.isArray(players)) {
        const newpair = players.reduce((matches, _, index, array) => {
          if (index % 2 === 0) matches.push([array[index], array[index + 1]]);
          return matches;
        }, []);
        setPair(newpair);
        setTournament(true);
        setIsFirstRound(true);
      }
    }
    if (!isFull) setError("You must Fill The Form!");
    else if (!isNotDuplicated) setError("Two Players Has The Same Name!");
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlayers((prev) => {
      const newPlayer = [...prev];
      newPlayer[name] = value;
      return newPlayer;
    });
  };

  useEffect(() => {
    if (theWinner.length === 2 && isFirstRound) {
      const finalPair = [[theWinner?.[0], theWinner?.[1]]];
      setTimeout(() => {
        setMatchIndex(0);
        setPair(finalPair);
        setTheWinner([]);
        setIsFirstRound(false);
      }, 3000);
    } else if (theWinner.length === 1 && !isFirstRound) {
      setTournamentComplete(true);
    }
  }, [theWinner, isFirstRound]);

  const handleMatchWinner = useCallback(
    (winner) => {
      setTheWinner((prevWinners) => [...prevWinners, winner]);
      if (isFirstRound)
        if (matchIndex < pair?.length - 1)
          setTimeout(() => {
            setMatchIndex((prevIndex) => prevIndex + 1);
          }, 3000);
    },
    [isFirstRound, matchIndex, pair]
  );

  function reset_all() {
    setAddTournament(false);
    setTournament(false);
    setTheWinner([]);
    setPair([]);
    setMatchIndex(0);
    setPlayers([null, null, null, null]);
    setIsFirstRound(true);
    setTournamentComplete(false);
  }

  if (tournamentComplete) {
    setTimeout(() => {
      reset_all();
    }, 5000);
    return (
      <div className="tournament-complete">
        <h1>Tournament Complete!</h1>
        <div className="winner-display">
          <div className="img-container">
            <img
              className="local-winner-avatar"
              src={`${apiUrl}/media/avatars/default_avatar.png`}
              alt="winner"
            />
          </div>
          <p className="winner-name"> {theWinner[0]} </p>
        </div>
        <button onClick={reset_all}>Start New Tournament</button>
      </div>
    );
  }

  return (
    <>
      {!addTournament && !tournament ? (
        <div className="noTournament-container" key={"noTournament-container"}>
          <h1 className="noTournament-header">Tournament</h1>
          <p className="noTournament-text">
            No Tournament is registered
            <br />
            in the Tournaments
            <br /> <br />
            Create your own here !
          </p>
          <button
            className="notournament-addButton"
            onClick={() => setAddTournament(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              className="addButton_icon"
            >
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
            </svg>
            <p>Add Tournament</p>
          </button>
        </div>
      ) : !tournament ? (
        <div
          className="AddTournament-container"
          key={"AddTournament-container"}
        >
          <h1 className="AddTournamament-header">Local Tournament</h1>
          <div className="AddTournament-formatContainer">
            <form className="AddTournament-form" onSubmit={handleSubmit}>
              <div
                id="AddTournament-cancel"
                onClick={() => setAddTournament(false)}
              >
                cancel
              </div>
              <div className="input-container">
                <h1 className="AddTournamament-formheader">Local Tournament</h1>
                <div>
                  <label>First Player:</label>
                  <input
                    type="text"
                    id="fname"
                    name="0"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label>Second Player:</label>
                  <input
                    type="text"
                    id="sname"
                    name="1"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label>Third Player:</label>
                  <input
                    type="text"
                    id="tname"
                    name="2"
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label>Fourth Player:</label>
                  <input
                    type="text"
                    id="foname"
                    name="3"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="submitTournament">
                <div className="bgcolor"></div>
                <input type="submit" value="Play" id="AddTournament-submit" />
              </div>
            </form>
          </div>
        </div>
      ) : tournament && pair[matchIndex] ? (
        <>
          <LocalRoom
            key={pair[matchIndex].join("_")}
            theWinner={handleMatchWinner}
            data={pair[matchIndex]}
            mode={"TournamentLocal"}
          />
        </>
      ) : null}
    </>
  );
};

export default TournamentLocal;
