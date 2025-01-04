import React from "react";
import { Route, Routes } from "react-router-dom";
import Tournament from "./Tournament/tournament";
import TournamentLocal from "./Tournament/Local/tournamentLocal";
import TournamentRemote from "./Tournament/Remote/tournamentRemote";
import Friend from "./Friend/friend";
import Remote from "./Friend/remote";
import LocalGame from "./Friend/local";
import Game from "./main/Game";
import Bot from "./bot/bot";
import GameMode from "./bot/gameMode";
import ManagedRoom from "./rooms/managedRoom";

function gameRouting() {
  return (
    <Routes>
      <Route path="/" element={<Game />} />
      <Route path="bot" element={<Bot />} />
      <Route path="gamemode" element={<GameMode />} />
      <Route path="tournament" element={<Tournament />} />
      <Route path="tournament/local" element={<TournamentLocal />} />
      <Route path="tournament/remote" element={<TournamentRemote />} />
      <Route path="friend" element={<Friend />} />
      <Route path="friend/remote" element={<Remote />} />
      <Route path="friend/managedroom/:room" element={<ManagedRoom />} />
      <Route path="friend/local" element={<LocalGame />} />
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
  );
}

export default gameRouting;
