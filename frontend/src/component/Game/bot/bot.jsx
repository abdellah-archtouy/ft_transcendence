import { useState } from "react";
import LoadingPage from "../../loadingPage/loadingPage";
import "../room.css";
import Room from "../room";

const Bot = ({ data }) => {
  const [user, setUser] = useState(() => {
    console.log(data);
    const d = [
      [
        { uid: 0, name: "Bot", goals: 0, avatar: "/botProfile.svg" },
        { uid: 1, name: "GUTS", goals: 0, avatar: "/guts.png" },
      ],
      {
        playMode: "bot",
        ballSpeed: data[0].ballSpeed,
        botSerious: data[0].botSerious,
      },
    ];
    return d;
  });
  if (!user) return <LoadingPage />;
  return <Room data={user} />;
};

export default Bot;
