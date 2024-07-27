import React from "react";
import LoadingPage from "../../loadingPage/loadingPage";
import { useState } from "react";
import Room from "../room";
import FriendVector from "../../../icons/Vector.svg";
import "./friend.css";

const Friend = () => {
  const [user] = useState(() => {
    const d = [
      [
        { uid: 0, name: "Left", goals: 0, avatar: "/botProfile.svg" },
        { uid: 1, name: "Right", goals: 0, avatar: "/guts.png" },
      ],
      { playMode: "Friends" },
    ];
    return d;
  });
  if (!user) return <LoadingPage />;
  return (
    <>
      <h1 className="Friend-header">1 V 1 <br /> Game</h1>
      <div className="FriendContainer">
        <div className="PlayLocal">
          <img src={FriendVector} alt="" className="PlayImage" />
        </div>
        <div className="PlayRemote">
          <img src={FriendVector} alt="" className="PlayImage" />
          <p>Remote</p>
        </div>
      </div>
    </>
    // <Room data={user} />
  );
};

export default Friend;
