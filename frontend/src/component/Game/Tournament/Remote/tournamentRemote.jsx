import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./tournamentRemote.css"

const TournamentRemote = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const hostName = process.env.REACT_APP_API_HOSTNAME;

  const [tournamentData, setTournamentData] = useState(null);
  const [noTournament, setNoTournament] = useState(null);
  const [tournamentName, setTournamentName] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const isFull = 1;
    const hasAllPlayers = isFull;

    /* hna kahssk thandli o t parssi ila kant kayna ch tournoua bnafss smiya */
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
        fetchTournament();
      } catch (error) {
        handleFetchError(error);
      }
    };

    const fetchTournament = async () => {
      try {
        const access = localStorage.getItem("access");

        const response = await axios.get(`${apiUrl}/tournament`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        setTournamentData(response.data);
      } catch (error) {
        handleFetchError(error);
      }
    };

    const handleFetchError = (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          const refresh = localStorage.getItem("refresh");

          if (refresh) {
            axios
              .post(`${apiUrl}/api/token/refresh/`, { refresh })
              .then((refreshResponse) => {
                const { access: newAccess } = refreshResponse.data;
                localStorage.setItem("access", newAccess);
                fetchUserData(); // Retry fetching user data
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
      const socket = new WebSocket(
        `ws://${hostName}:8000/ws/tournament/${user_id}/`
      );

      socket.onmessage = function (event) {
        const tournament = JSON.parse(event.data);
        setTournamentData((prev) => [tournament, ...prev]);
      };
    }
  }, [user]);

  if (!tournamentData) return <>Loading ...</>
  return( 
    <>
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
            ) : !tournamentData.length ? (
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
                      <h1 className="remote-AddTournamament-formheader">Remote Tournament</h1>
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
            )
            : (
                <>
                </>
            )
        }
    </>
)};

export default TournamentRemote;
