import React from "react";
import RemoteLocal from "../RemoteLocal";


const Friend = () => {
  const links = ["/game/friend/local", "/game/friend/remote"]
  return (
    <div>
      <RemoteLocal header={["1 V 1", "Game"]} links={links}/>
    </div>
  );
};

export default Friend;
