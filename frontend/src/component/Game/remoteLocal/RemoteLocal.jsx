import React from "react";
import "./RemoteLocal.css";
import { useNavigate } from "react-router-dom";
import FriendVector from "../../../icons/Vector.svg";
import LoadingPage from "../../loadingPage/loadingPage"

const RemoteLocal = ({header, links}) => {
  const navigate = useNavigate();
  if (!header || links.length == 0)
    return <LoadingPage />
  return (
    <div style={{transform:"all 0.3s ease-in-out"}}>
      <h1 className="Friend-header">
        {header && (
          <>
            {header?.[0]} <br /> {header?.[1]}
          </>
          )}
      </h1>
      <div className="FriendContainer">
        <div className="friend-game-select">
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
