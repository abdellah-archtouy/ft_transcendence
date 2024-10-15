import React, { useState } from "react";
import Room from "../room";
import LoadingPage from "../../loadingPage/loadingPage"

const Remote = () => {
  const [roomData] = useState("Remote");
  if (!roomData) return <LoadingPage />
  return (
    <div>
      <Room mode={roomData}/>
    </div>
  );
};

export default Remote;
