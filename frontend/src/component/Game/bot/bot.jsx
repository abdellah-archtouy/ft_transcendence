import { useState } from "react";
import { useLocation } from "react-router-dom"
import LoadingPage from "../../loadingPage/loadingPage";
import "../room.css";
import Room from "../room";

const Bot = () => {
  const location = useLocation();
  const {values} = location.state || {};
  const d = [
    [
      { uid: 0, name: "Bot", goals: 0, avatar: "/botProfile.svg" },
      { uid: 1, name: "GUTS", goals: 0, avatar: "/guts.png" },
    ],
    {
      playMode : values[0].playMode,
      ballSpeed : values[0].ballSpeed,
      errorRate : values[0].botSerious
    },
  ];
  
  const [user] = useState(d);
  if (!user) return <LoadingPage />;
  return (
    <>
        <Room data={user} />
    </>
  );
};

export default Bot;
