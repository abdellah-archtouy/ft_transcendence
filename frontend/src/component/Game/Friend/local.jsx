import React, { useState } from "react";
// import Room from "../room";
import LoadingPage from "../../loadingPage/loadingPage"
import LocalRoom from "../localRoom"

const Remote = () => {
  const [roomData] = useState("Local");
  if (!roomData) return <LoadingPage />
  return (
    <div>
      <LocalRoom data={["Left", "Right"]} mode={roomData}/>
    </div>
  );
};

export default Remote;
