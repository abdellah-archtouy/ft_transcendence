import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Tournament from "./tournament";
import Friend from "./Friend/friend";
import Game from "./Game";
import Bot from "./bot/bot";
import GameMode from "./bot/gameMode"

function gameRouting() {
  return (
    <Routes>
        <Route exact path="/" element={<Game />} />
        <Route exact path="bot" element={<Bot />} />
        <Route exact path="gamemode" element={<GameMode />} />
        <Route exact path="tournament" element={<Tournament />} />
        <Route exact path="friend" element={<Friend />} />
    </Routes>
  )
}

export default gameRouting