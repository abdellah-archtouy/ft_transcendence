import React from 'react'
import LoadingPage from '../loadingPage/loadingPage'
import { useState } from 'react'
import Room from './room'

const Friend = () => {
  const [user, setUser] = useState(() => {
    const d = [
        [{ uid: 0, name: "Left", goals: 0, avatar: "/botProfile.svg" },
        { uid: 1, name: "Right", goals: 0, avatar: "/guts.png" }],
        { playMode: "Friends"}
    ];
    return d;
  });
  if (!user) return <LoadingPage />
  return (
    <Room data={user} />
  )
}

export default Friend
