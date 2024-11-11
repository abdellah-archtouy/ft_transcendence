import React from "react";
import "./RemoteLocal.css";
import { useNavigate } from "react-router-dom";
import FriendVector from "../../../icons/Vector.svg";

const RemoteLocal = ({header, links}) => {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="Friend-header">
        {header.length > 1 ? (
          <>
            {header[0]} <br /> {header[1]}
          </>
          ) : header}
      </h1>
      <div className="FriendContainer">
        <div className="friend-game-select">
          {/*style={{width:"fit-content", height:"fit-content", border:"solid"}}>*/}
          <div
            className="PlayLocal"
            onClick={() => {
              navigate(links[0]);
            }}
          >
            <img src={FriendVector} alt="" className="PlayImage" />
            <p>Local</p>
          </div>
        </div>
        <div className="friend-game-select">
          <div
            className="PlayRemote"
            onClick={() => {
              navigate(links[1]);
            }}
          >
            <img src={FriendVector} alt="" className="PlayImage" />
            <p>Remote</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteLocal;
