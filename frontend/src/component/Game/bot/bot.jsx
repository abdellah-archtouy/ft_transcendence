import { useState } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../../loadingPage/loadingPage";
import "../room.css";
import Room from "../room";

const Bot = () => {
  const location = useLocation();
  const { playMode } = location.state || {};
  console.log(playMode)
  const [user] = useState("bot");
  if (!user) return <LoadingPage />;
  return (
    <>
        <Room data={user} />
    </>
  );
};

export default Bot;
