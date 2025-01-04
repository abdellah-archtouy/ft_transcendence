import React, { useState } from "react";
// import Room from "../room";
import LoadingPage from "../../loadingPage/loadingPage"
import LocalRoom from "../rooms/localRoom"

const Remote = () => {
  const [roomData] = useState("Local");
  if (!roomData) return <LoadingPage />
  return (
    <>
      <LocalRoom data={["Left", "Right"]} mode={roomData}/>
    </>
  );
};

export default Remote;
