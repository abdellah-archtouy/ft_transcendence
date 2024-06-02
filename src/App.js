import {Routes, Route } from "react-router-dom";
import './App.css';
import './index.css';
import Navbar from "./component/Navbar/Navbar"
import Game from "./component/Game/Game"
import Bot from "./component/Game/bot"
import Tournament from "./component/Game/tournament"
import Friend from "./component/Game/friend"
import Profile from "./component/Profile/Profile"
import Setting from "./component/Setting/Setting"
import Chat from "./component/Chat/Chat"
import Leaderboard from "./component/Leaderboard/Leaderboard"
import Home from "./component/Home/Home"

function App() {
  return (
    <div className="App">
        <Navbar />
      <div className="main">
        <Routes>
          <Route exact path="/" element={<Home />}/>
          <Route exact path="/game" element={<Game />}/>
          <Route exact path="/game/bot" element={<Bot />}/>
          <Route exact path="/game/tournament" element={<Tournament />}/>
          <Route exact path="/game/friend" element={<Friend />}/>
          <Route exact path="/chat" element={<Chat />}/>
          <Route exact path="/leaderboard" element={<Leaderboard />}/>
          <Route exact path="/setting" element={<Setting />}/>
          <Route exact path="/profile" element={<Profile />}/>
        </Routes>
      </div>
    </div>
  );
};

export default App;