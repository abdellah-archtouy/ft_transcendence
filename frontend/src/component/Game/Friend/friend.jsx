import React from "react";
import FriendVector from "../../../icons/Vector.svg";
import "./friend.css";
import { useNavigate } from "react-router-dom";


const Friend = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1 className="Friend-header">1 V 1 <br /> Game</h1>
      <div className="FriendContainer">
        <div className="friend-game-select">{/*style={{width:"fit-content", height:"fit-content", border:"solid"}}>*/}
          <div className="PlayLocal" onClick={() => {navigate('/game/friend/local')}}>
            <img src={FriendVector} alt="" className="PlayImage" />
            <p>Local</p>
          </div>
        </div>
        <div className="friend-game-select">
          <div className="PlayRemote" onClick={() => {navigate('/game/friend/remote')}}>
            <img src={FriendVector} alt="" className="PlayImage" />
            <p>Remote</p>
          </div>
        </div>
      </div>
    </>
    // <Room data={user} />
  );
};

export default Friend;
