import { useState } from 'react'
import LoadingPage from '../loadingPage/loadingPage'
import "./room.css"
import Room from './room'

const Bot = () => {
  const [user, setUser] = useState(() => {
    const d = [
        [{ uid: 0, name: "Bot", goals: 5, avatar: "/botProfile.svg" },
        { uid: 1, name: "GUTS", goals: 0, avatar: "/guts.png" }],
        { playMode: "bot"}
    ];
    return d;
  });
  if (!user) return <LoadingPage />
  return (
    <Room data={user} />
  )
}

export default Bot
