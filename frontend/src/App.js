import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import "./index.css";
import Navbar from "./component/Navbar/Navbar";
import GameRouting from "./component/Game/gameRouting";
import Profile from "./component/Profile/Profile";
import OthersProfile from "./component/Profile/othersProfile";
import Setting from "./component/Setting/Setting";
import Chat from "./component/Chat/Chat";
import Leaderboard from "./component/Leaderboard/Leaderboard";
import Home from "./component/Home/Home";
import { useState, useEffect, useContext, createContext } from "react";
import bg1 from "./icons/bg1.svg";
import bg2 from "./icons/Group.svg";
import LandingPage from "./component/Landing_page/Landing_page";
import AuthCallBack from "./component/AuthCallBack/AuthCallBack";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;
const hostName = process.env.REACT_APP_API_HOSTNAME;

export const ErrorContext = createContext();

export const useError = () => useContext(ErrorContext);

function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem("access"));
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [statusSocket, setStatusSocket] = useState(null);
  const [loggedOut, setLoggedOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const bgImage = auth && {
    background: `url(${bg2}) center bottom / contain no-repeat, url(${bg1})`,
    backgroundSize: `100%, 500px`,
  };

  const souldApplyMargin =
    location.pathname === "/" ||
    (window.innerWidth > 640 && location.pathname !== "/chat");

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setAuth(true);
    } else {
      setAuth(() => false);
    }
  }, []);

  const handleLogin = (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
    setAuth(true);
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  }, [error]);

  useEffect(() => {
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
                headers: { Authorization: `Bearer ${newAccess}` },
              }).then((response) => {
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
          console.log({
            general: "No refresh token available. Please log in.",
          });
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.reload();
          navigate("/");
        }
      } else {
        console.log({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    };

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

    if (!userData && auth) fetchUserData();
  }, [navigate, auth]);

  useEffect(() => {
    if (userData && auth) {
      const user_id = userData.id;
      const statusSocket = new WebSocket(
        `wss://${hostName}/ws/stat/${user_id}/`
      );
      statusSocket.onopen = () => {
        console.log("Connected to status socket");
      };
      statusSocket.onclose = () => {
        console.log("disconnected to status socket");
      };
      setStatusSocket(statusSocket);
    }
  }, [userData, auth]);

  useEffect(() => {
    const logOut = async () => {
      try {
        const refresh = localStorage.getItem("refresh");
        const access = localStorage.getItem("access");

        if (refresh && access) {
          const response = await axios.post(
            `${apiUrl}/api/users/logout/`,
            { refresh_token: refresh },
            {
              headers: {
                Authorization: `Bearer ${access}`,
              },
            }
          );
          console.log("Response:", response.data.message);
        }

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.reload();
      } catch (error) {
        console.log("Error:", error);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.reload();
      }
    };
    if (loggedOut) logOut();
  }, [loggedOut]);

  return (
    <div className={"App"} style={{ ...bgImage }}>
      {auth ? (
        <>
          <Navbar setLoggedOut={setLoggedOut} />
          <ErrorContext.Provider value={{ error, setError, statusSocket }}>
            <div
              className="main"
              style={{
                marginBottom: souldApplyMargin
                  ? "clamp(6.875rem, 4.688vw + 5rem, 12.5rem)"
                  : "0px",
              }}
            >
              <div className="pop-container">
                <div className={`tournament-popup ${error ? "appeare" : ""}`}>
                  <p className="tournament-popup-p">{error}</p>
                </div>
              </div>
              <Routes>
                <Route exact path="/" element={<Home />} />
                <Route exact path="/game/*" element={<GameRouting />} />
                <Route exact path="/chat" element={<Chat />} />
                <Route exact path="/leaderboard" element={<Leaderboard />} />
                <Route exact path="/setting" element={<Setting />} />
                <Route exact path="/profile" element={<Profile />} />
                <Route exact path="/user/:uid" element={<OthersProfile />} />
                <Route
                  path="*"
                  element={
                    <div className="page-404">
                      <div className="page-404-container">
                        <h1 className="page-404-container-h1">404</h1>
                        <div style={{ display: "inline-block", flex: "1,1" }}>
                          <h2
                            style={{
                              fontSize: "14px",
                              fontWeight: "400",
                              lineHeight: "28px",
                            }}
                          >
                            Page Not Found
                          </h2>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </div>
          </ErrorContext.Provider>
        </>
      ) : (
        <>
          <Routes>
            <Route
              path="/auth/callback/"
              element={<AuthCallBack setAuth={handleLogin} />}
            />
            <Route path="*" element={<LandingPage setAuth={handleLogin} />} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
