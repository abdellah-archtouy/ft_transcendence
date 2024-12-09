import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useRef } from "react";
import TournamentCard from "./tournamentCard";
// import TournamentDisplay from "../Form/tournamentDisplay";
import { useError } from "../../../../App";
import LoadingPage from "../../../loadingPage/loadingPage";
import "./tournamentRemote.css";
import "./../Form/tournamentDisplay.css";

const hostName = process.env.REACT_APP_API_HOSTNAME;
const apiUrl = process.env.REACT_APP_API_URL;

const TournamentRemote = () => {
  const [tournamentData, setTournamentData] = useState([]);
  const [noTournament, setNoTournament] = useState(null);
  const [tournamentSearch, setTournamentSearch] = useState(null);
  const [tournamentName, setTournamentName] = useState(null);
  const [join, setJoin] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [joinCard, setJoinCard] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const stableNavigate = useMemo(
    () =>
      (...args) =>
        navigate(...args),
    [navigate]
  );

  let socketRef = useRef(null);

  const { setError } = useError();

  const [round1, setRound1] = useState(Array(4).fill(null));
  const [round2, setRound2] = useState(Array(4).fill(null));
  const [winner, setWinner] = useState(null);

  function image_renaming(name) {
    return `${apiUrl}` + name;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setNoTournament(false);
    const isFull = tournamentName ? true : false;
    if (!isFull) {
      setError("The Tournament must have a name");
      return;
    }
    if (!tournamentName.match(/^[0-9a-z]+$/)) {
      setError("The tournament name can only include letters and numbers.");
      return;
    }
    if (
      isFull &&
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      setJoinCard(tournamentName);
      socketRef.current?.send(
        JSON.stringify({
          type: "create",
          name: tournamentName,
        })
      );
    }
  }

  const handleChange = (e) => {
    const { value } = e.target;
    setTournamentName(value);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const access = localStorage.getItem("access");

        const response = await axios.get(`${apiUrl}/api/users/profile/`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });

        setUser(response.data);
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

    if (!user) fetchUserData();
  }, [stableNavigate, user]);

  useEffect(() => {
    if (user) {
      const user_id = user.id;
      socketRef.current = new WebSocket(
        `wss://${hostName}:8000/ws/tournament/${user_id}/`
      );

      socketRef.current.onopen = () => {
        console.log("WebSocket connection established");
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data?.error) {
          setTournamentData(data?.tournaments_data);
          setTournamentSearch(data?.tournaments_data);
          if (data?.tournament_users) {
            setTournamentData(data?.tournament_users);
            setRound1(() => {
              const filledArray = Array(4).fill(null);
              if (
                data?.tournament_users?.["round1"] &&
                Array.isArray(data?.tournament_users?.["round1"])
              )
                data?.tournament_users?.["round1"]
                  .slice(0, 4)
                  .forEach((player, index) => {
                    if (index < 4) filledArray[index] = player;
                  });
              return filledArray;
            });

            setRound2(() => {
              const filledArray = Array(4).fill(null);
              if (
                data?.tournament_users?.["round2"] &&
                Array.isArray(data?.tournament_users?.["round2"])
              )
                data?.tournament_users?.["round2"]
                  .slice(0, 4)
                  .forEach((player, index) => {
                    if (index < 4) filledArray[index] = player;
                  });
              return filledArray;
            });

            setWinner(() =>
              data?.tournament_users?.["winner"] !== undefined
                ? data?.tournament_users?.["winner"]
                : null
            );
          }

          if (data?.joined !== undefined) setJoin(() => data?.joined);
        }
        if (data?.error) {
          console.log(data?.error);
        }
      };

      socketRef.current.onclose = () => {
        console.log("WebSocket connection closed");
      };

      return () => {
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    if (joinCard) {
      if (
        joinCard &&
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      )
        socketRef.current.send(
          JSON.stringify({
            type: "join",
            name: joinCard,
          })
        );
    }
  }, [joinCard]);

  useEffect(() => {
    if (cancel) {
      if (
        cancel &&
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      )
        socketRef.current.send(
          JSON.stringify({
            type: "leave",
            name: joinCard,
          })
        );
      setJoinCard(null);
      setCancel((prev) => !prev);
    }
  }, [cancel, joinCard]);

  const draggableContentRef = useRef(null);
  const contentItemsRef = useRef([]);

  const handleNextClick = () => {
    // Get the current scroll position of the container
    const currentScrollPosition = draggableContentRef.current.scrollLeft;

    // Find the next content item based on the current scroll position
    for (let i = 1; i < contentItemsRef.current.length; i++) {
      const item = contentItemsRef.current[i];
      if (item.offsetLeft - 10 > currentScrollPosition) {
        let offset = item.offsetLeft - 10;
        draggableContentRef.current.scrollTo({
          left: offset,
          behavior: "smooth", // Smooth scroll to the next item
        });
        break;
      }
    }
  };

  const handlePrevClick = () => {
    // Get the current scroll position of the container
    const currentScrollPosition = draggableContentRef.current.scrollLeft;

    // Find the next content item based on the current scroll position
    for (let i = contentItemsRef.current.length - 1; i >= 0; i--) {
      const item = contentItemsRef.current[i];
      if (item.offsetLeft < currentScrollPosition) {
        draggableContentRef.current.scrollTo({
          left: item.offsetLeft - 10,
          behavior: "smooth", // Smooth scroll to the next item
        });
        break;
      }
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let filteredData = null;
    if (tournamentData && isNaN(searchTerm)) {
      filteredData = tournamentData.filter((tournament) =>
        tournament?.name.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
    }
    setTournamentSearch(filteredData);
    if (!searchTerm) setTournamentSearch(tournamentData);
  }, [searchTerm, tournamentData]);

  if (!tournamentData) return <LoadingPage />;
  return (
    <div className="tournamentRemote-container">
      {!join && !tournamentData.length && !noTournament ? (
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
            onClick={() => setNoTournament(true)}
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
      ) : !join && noTournament ? (
        <div
          className="remote-AddTournament-container"
          key={"AddTournament-container"}
        >
          <h1 className="remote-AddTournamament-header">Remote Tournament</h1>
          <div className="remote-AddTournament-formatContainer">
            <form className="remote-AddTournament-form" onSubmit={handleSubmit}>
              <div
                id="AddTournament-cancel"
                onClick={() => setNoTournament(false)}
              >
                cancel
              </div>
              <div className="remote-input-container">
                <h1 className="remote-AddTournamament-formheader">
                  Remote Tournament
                </h1>
                <div>
                  <label>Tournament Name:</label>
                  <input
                    type="text"
                    id="fname"
                    name="0"
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="remote-submitTournament">
                <div className="remote-bgcolor"></div>
                <input type="submit" value="Play" id="AddTournament-submit" />
              </div>
            </form>
          </div>
        </div>
      ) : !join ? (
        <div className="Tournament-display">
          <h1 className="noTournament-header">Tournament</h1>
          <input
            type="text"
            name="searchbar"
            className="tournament-search"
            placeholder="tournament name"
            onChange={(input) => {
              setSearchTerm(input.target.value);
            }}
          />
          <div className="cards-item">
            <div className="tournament-on-hold">
              <h3>Tournaments on hold:</h3>
              <button
                className="tournament-display-addButton"
                onClick={() => setNoTournament(true)}
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
            <div className="tournament-cards" ref={draggableContentRef}>
              {tournamentData?.length &&
                tournamentSearch?.map((tournament, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      contentItemsRef.current[index] = el;
                    }}
                    className={`carousel-item`}
                  >
                    <TournamentCard setJoin={setJoinCard} data={tournament} />
                  </div>
                ))}
            </div>
            <div className="scroll-buttons">
              <button className="slide-left" onClick={handlePrevClick} />
              <button className="slide-right" onClick={handleNextClick} />
            </div>
          </div>
        </div>
      ) : null}
      {join && (
        <>
          <div className="tournament-display-container">
            <h1 className="tournament-display-header">Tournament</h1>
            {!round1?.every((player) => player) && (
              <button className="close-Button" onClick={() => setCancel(true)}>
                <svg
                  width={"100%"}
                  height={"100%"}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 384 512"
                >
                  <path
                    className="close-Button-icon"
                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                  />
                </svg>
                {/* Cancel */}
              </button>
            )}
            <div className="tournament-display">
              <div className="tournament-winner player-card">
                <svg
                  width="39"
                  height="37"
                  viewBox="0 0 39 37"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="crown"
                >
                  <path d="M24.1977 10.6652C25.0813 10.6541 25.9428 10.1908 26.4276 9.3793C27.1769 8.12515 26.7691 6.50307 25.5163 5.75455C24.2635 5.00602 22.6418 5.41555 21.8925 6.6697C21.4043 7.48688 21.4079 8.45933 21.8168 9.24269L14.6829 13.8054C13.55 14.53 12.0358 14.0257 11.5651 12.7665L8.93159 5.70249C9.4422 5.49162 9.89368 5.12221 10.1988 4.61147C10.9482 3.35733 10.5403 1.73525 9.28752 0.986723C8.0347 0.238197 6.41305 0.647729 5.66373 1.90188C4.91442 3.15603 5.32223 4.7781 6.57505 5.52663C6.58639 5.5334 6.6034 5.54356 6.61473 5.55034L0.681485 21.3649C-0.0374641 23.2763 0.712079 25.4337 2.46943 26.4836L18.1836 35.8724C19.9352 36.919 22.1868 36.5624 23.5384 35.0212L34.653 22.3024C34.6643 22.3092 34.6813 22.3194 34.6927 22.3261C35.9455 23.0746 37.5671 22.6651 38.3165 21.411C39.0658 20.1568 38.658 18.5347 37.4051 17.7862C36.1523 17.0377 34.5307 17.4472 33.7814 18.7014C33.4762 19.2121 33.3649 19.7847 33.4211 20.3343L25.9527 21.3627C24.6207 21.5449 23.4592 20.4504 23.5604 19.1094L24.1977 10.6652Z" />
                </svg>
                <svg
                  width="39"
                  height="37"
                  viewBox="0 0 39 37"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="crown-absolute"
                >
                  <path d="M24.1977 10.6652C25.0813 10.6541 25.9428 10.1908 26.4276 9.3793C27.1769 8.12515 26.7691 6.50307 25.5163 5.75455C24.2635 5.00602 22.6418 5.41555 21.8925 6.6697C21.4043 7.48688 21.4079 8.45933 21.8168 9.24269L14.6829 13.8054C13.55 14.53 12.0358 14.0257 11.5651 12.7665L8.93159 5.70249C9.4422 5.49162 9.89368 5.12221 10.1988 4.61147C10.9482 3.35733 10.5403 1.73525 9.28752 0.986723C8.0347 0.238197 6.41305 0.647729 5.66373 1.90188C4.91442 3.15603 5.32223 4.7781 6.57505 5.52663C6.58639 5.5334 6.6034 5.54356 6.61473 5.55034L0.681485 21.3649C-0.0374641 23.2763 0.712079 25.4337 2.46943 26.4836L18.1836 35.8724C19.9352 36.919 22.1868 36.5624 23.5384 35.0212L34.653 22.3024C34.6643 22.3092 34.6813 22.3194 34.6927 22.3261C35.9455 23.0746 37.5671 22.6651 38.3165 21.411C39.0658 20.1568 38.658 18.5347 37.4051 17.7862C36.1523 17.0377 34.5307 17.4472 33.7814 18.7014C33.4762 19.2121 33.3649 19.7847 33.4211 20.3343L25.9527 21.3627C24.6207 21.5449 23.4592 20.4504 23.5604 19.1094L24.1977 10.6652Z" />
                </svg>
                  <img
                    src={image_renaming(winner)}
                    className={`playercard-img ${winner ? "displayed" : "fade-out"}`}
                    alt=""
                    />
                {
                !winner && (
                  <p style={{animation:"fade-in 0.5s ease-in-out"}}>?</p>
                )}
              </div>

              {/* Round 2 */}
              <div className="round round-2">
                {round2?.map(
                  (player, index) =>
                    index < 2 && (
                      <div key={index} className="player-card">
                        <img
                          src={image_renaming(player)}
                          className={`playercard-img ${player ? "displayed" : "fade-out"}`}
                          alt=""
                          />
                        {!player && (
                          <p style={{animation:"fade-in 0.5s ease-in-out"}}>?</p>
                        )}
                      </div>
                    )
                )}
              </div>

              {/* Round 1 */}
              <div className="round round-1">
                {round1?.map((player, index) => (
                  <div key={index} className="player-card">
                    <img
                      src={image_renaming(player)}
                      className={`playercard-img ${player ? "displayed" : "fade-out"}`}
                      alt=""
                      />
                    {!player && (
                      <p style={{animation:"fade-in 0.5s ease-in-out"}}>?</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TournamentRemote;
