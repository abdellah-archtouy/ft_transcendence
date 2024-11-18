import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import "./index.css";
import Navbar from "./component/Navbar/Navbar";
import GameRouting from "./component/Game/gameRouting";
import Profile from "./component/Profile/Profile";
import OthersProfile from "./component/Profile/OthersProfile";
import Setting from "./component/Setting/Setting";
import Chat from "./component/Chat/Chat";
import Leaderboard from "./component/Leaderboard/Leaderboard";
import Home from "./component/Home/Home";
import { useState, useEffect } from "react";
import bg1 from "./icons/bg1.svg";
import bg2 from "./icons/Group.svg";
import LandingPage from "./component/Landing_page/Landing_page";
import AuthCallBack from "./component/AuthCallBack/AuthCallBack";

import axios from 'axios';
import { Navigate } from 'react-router-dom';


function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('jwt'));
  const [error, setError] = useState(null);
  const location = useLocation();
  const bgImage = auth && {
    background: `url(${bg2}) center bottom / contain no-repeat, url(${bg1})`,
    backgroundSize: `100%, 500px`,
  };

  const souldApplyMargin = location.pathname !== "/chat";


  const validateTokenWithServer = async (token) => {
    try {
      const response = await axios.post(
        `http://${window.location.hostname}:8000/api/users/validate/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("this part has been flaged");
      return response.status === 200;
    } catch (error) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('refresh');
      localStorage.removeItem('access');
      // refreh the page
      window.location.reload();
      Navigate('/');
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      setAuth(true);
    } else {
      setAuth(() => false); // No token found, user is not authenticated
    }
  }, []);

  const handleLogin = (access, refresh) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    setAuth(true);
  };

  useEffect(() => {
    if (error)
      {
        setTimeout(() => {
          setError(null)
        }, 2500)
      }
  },[error])

  const scroll = (location.pathname !== "/" && location.pathname !== "/profile" && location.pathname !== "/user/:username") && {
        height: `100%`
    }

  useEffect(() => {
    if (error)
      {
        setTimeout(() => {
          setError(null)
        }, 4000)
      }
  },[error])

  return (
    <div className={"App"} style={{ ...bgImage, ...scroll }}>
      {" "}
      {/* style={{...bgImage}} */}
      {auth ? (
        <>
          <Navbar />
          <div className="main" style={{ marginBottom: souldApplyMargin ? "clamp(6.875rem, 4.688vw + 5rem, 12.5rem)" : "0px" }}>
          <div className="pop-container">
            <div className={`tournament-popup ${error ? 'appeare' : ''}`}>
                <p className='tournament-popup-p'>{error}</p>
            </div>
          </div>
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/game/*" element={<GameRouting error={setError} />} />
              <Route exact path="/chat" element={<Chat />} />
              <Route exact path="/leaderboard" element={<Leaderboard />} />
              <Route exact path="/setting" element={<Setting error={setError}/>} />
              <Route exact path="/profile" element={<Profile />} />
              <Route exact path="/user/:username" element={<OthersProfile />} />
            </Routes>
          </div>
        </>
      ) : (
        <>
          <Routes>
                <Route path="/api/auth/callback" element={<AuthCallBack setAuth={handleLogin} />} />
                <Route path="*" element={<LandingPage setAuth={handleLogin} />} />
            </Routes>
        </>
      )}
    </div>
  );
}

export default App;
