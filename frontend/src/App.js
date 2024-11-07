import { Routes, Route, useLocation } from "react-router-dom";
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
import { useState, useEffect } from "react";
import bg1 from "./icons/bg1.svg";
import bg2 from "./icons/Group.svg";
import LandingPage from "./component/Landing_page/Landing_page";
import axios from 'axios';
import { Navigate } from 'react-router-dom';


function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('jwt'));
  // const [scroll, setScroll] = useState(false);
  const location = useLocation();
  const bgImage = auth && {
    background: `url(${bg2}) center bottom / contain no-repeat, url(${bg1}) repeat`,
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

  const scroll = (location.pathname !== "/" && location.pathname !== "/profile") && {
    height: `100%`
  }
  return (
    <div className={"App"} style={{ ...bgImage, ...scroll }}>
      {auth ? (
        <>
          <Navbar />
          <div className="main" style={{ marginBottom: souldApplyMargin ? "clamp(6.875rem, 4.688vw + 5rem, 12.5rem)" : "0px" }}>
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/game/*" element={<GameRouting />} />
              <Route exact path="/chat" element={<Chat />} />
              <Route exact path="/leaderboard" element={<Leaderboard />} />
              <Route exact path="/setting" element={<Setting />} />
              <Route exact path="/profile" element={<Profile />} />
              <Route exact path="/user/:username" element={<OthersProfile />} />
            </Routes>
          </div>
        </>
      ) : (
        <LandingPage setAuth={handleLogin} />
      )}
    </div>
  );
}

export default App;
