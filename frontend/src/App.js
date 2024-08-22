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
import { useState } from "react";
import bg1 from "./icons/bg1.svg";
import bg2 from "./icons/Group.svg";
import LandingPage from "./component/Landing_page/Landing_page";

function App() {
  const [auth, setAuth] = useState(true);
  const location = useLocation();
  const bgImage = auth && {
    background: `url(${bg2}) center bottom / contain no-repeat, url(${bg1})`
  };

  const souldApplyMargin = location.pathname !== "/chat";

  return (
    <div className="App" style={{ ...bgImage }}>
      {" "}
      {/* style={{...bgImage}} */}
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
              <Route exact path="/user/:userId" element={<OthersProfile />} />
            </Routes>
          </div>
        </>
      ) : (
        <LandingPage setAuth={setAuth} />
      )}
    </div>
  );
}

export default App;
