import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./tournamentRemote.css";
import { useRef } from "react";
import TournamentCard from "./tournamentCard";
import TournamentDisplay from "../Form/tournamentDisplay";

const TournamentRemote = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const hostName = process.env.REACT_APP_API_HOSTNAME;

  const [tournamentData, setTournamentData] = useState([]);
  const [noTournament, setNoTournament] = useState(null);
  const [tournamentSearch, setTournamentSearch] = useState(null);
  const [tournamentName, setTournamentName] = useState(null);
  const [join, setJoin] = useState(false);
  const [cancle, setCancle] = useState(false);
  const [joinCard, setJoinCard] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  let socketRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    setNoTournament(false);
    const isFull = tournamentName ? true : false;
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
    } else {
      console.log("WebSocket is not open");
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
                console.log({
                  general: "Session expired. Please log in again.",
                });
                window.location.reload();
                navigate("/");
              });
          } else {
            console.log({
              general: "No refresh token available. Please log in.",
            });
          }
        } else {
          console.log({ general: "Error fetching data. Please try again." });
        }
      } else {
        console.log({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      const user_id = user.id;
      socketRef.current = new WebSocket(
        `ws://${hostName}:8000/ws/tournament/${user_id}/`
      );

      socketRef.current.onopen = () => {
        console.log("WebSocket connection established");
      };

      socketRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (!data?.error)
          {
            setTournamentData(data);
            setTournamentSearch(data);
            if (data?.joined)
              setJoin(data?.joined);
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
    if (cancle) {
      if (
        cancle &&
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      )
        console.log(joinCard)
        socketRef.current.send(
          JSON.stringify({
            type: "leave",
            name: joinCard,
          })
        );
    }
  }, [cancle]);

  const draggableContentRef = useRef(null);
  const contentItemsRef = useRef([]);

  const handleNextClick = () => {
    // Get the current scroll position of the container
    const currentScrollPosition = draggableContentRef.current.scrollLeft;

    // Find the next content item based on the current scroll position
    for (let i = 1; i < contentItemsRef.current.length; i++) {
      const item = contentItemsRef.current[i];
      if (item.offsetLeft > currentScrollPosition) {
        console.log(item.offsetLeft)
        draggableContentRef.current.scrollTo({
          left: item.offsetLeft,
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
          left: item.offsetLeft,
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
    if (!searchTerm) setTournamentSearch(tournamentData)
  }, [searchTerm, tournamentData])

  if (!tournamentData) return <>Loading ...</>;
  return (
    <div className="tournamentRemote-container">
      {!tournamentData.length && !noTournament ? (
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
      ) : noTournament ? (
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
                {tournamentData.length &&
                  tournamentSearch.map((tournament, index) => (
                    <div
                      key={index}
                      ref={(el) => {contentItemsRef.current[index] = el}}
                      className={`carousel-item`}
                    >
                      <TournamentCard setJoin={setJoinCard} data={tournament}/>
                    </div>
                  ))}
              </div>
            <div className="scroll-buttons">
              <button className="slide-left" onClick={handlePrevClick}/>
              <button className="slide-right" onClick={handleNextClick}/>
            </div>
          </div>
        </div>
      ) : (
        <>
          <TournamentDisplay setCancel={setCancle}/>
        </>
      )}
    </div>
  );
};

export default TournamentRemote;
