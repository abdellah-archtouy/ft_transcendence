import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Tournament from "./Tournament/tournament";
import TournamentLocal from "./Tournament/Local/tournamentLocal";
import TournamentRemote from "./Tournament/Remote/tournamentRemote";
import Friend from "./Friend/friend";
import Remote from "./Friend/remote";
import LocalGame from "./Friend/local"
import Game from "./main/Game";
import Bot from "./bot/bot";
import GameMode from "./bot/gameMode"
import ManagedRoom from './rooms/managedRoom';

function gameRouting({ error }) {
  return (
    <Routes>
        <Route path="/" element={<Game />} />
        <Route path="bot" element={<Bot />} />
        <Route path="gamemode" element={<GameMode />} />
        <Route path="tournament" element={<Tournament />} />
        <Route path="tournament/local" element={<TournamentLocal error={error}/>} />
        <Route path="tournament/remote" element={<TournamentRemote />} />
        <Route path="friend" element={<Friend />} />
        <Route path="friend/remote" element={<Remote />} />
        <Route path="friend/managedroom" element={<ManagedRoom />} />
        <Route path="friend/local" element={<LocalGame />} />
    </Routes>
  )
}

export default gameRouting