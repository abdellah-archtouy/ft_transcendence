import { useState } from "react";
import { useLocation } from "react-router-dom";
import LoadingPage from "../../loadingPage/loadingPage";
import Room from "../rooms/room";

const Bot = () => {
  const location = useLocation();
  const values = location.state?.values; // Safely access the values object
  const mode = values; // Directly get mode from values
  const [user] = useState("bot");
  if (!user) return <LoadingPage />;
  return (
    <>
        <Room data={mode} mode={user} />
    </>
  );
};

export default Bot;
