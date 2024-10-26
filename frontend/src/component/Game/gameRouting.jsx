import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Tournament from "./Tournament/tournament";
import TournamentLocal from "./Tournament/Local/tournamentLocal";
import Friend from "./Friend/friend";
import Remote from "./Friend/remote";
import LocalGame from "./Friend/local"
import Game from "./Game";
import Bot from "./bot/bot";
import GameMode from "./bot/gameMode"

function gameRouting() {
  return (
    <Routes>
        <Route path="/" element={<Game />} />
        <Route path="bot" element={<Bot />} />
        <Route path="gamemode" element={<GameMode />} />
        <Route path="tournament" element={<Tournament />} />
        <Route path="tournament/local" element={<TournamentLocal />} />
        <Route path="friend" element={<Friend />} />
        <Route path="friend/remote" element={<Remote />} />
        <Route path="friend/local" element={<LocalGame />} />
    </Routes>
  )
}

export default gameRouting