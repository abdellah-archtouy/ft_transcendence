import React, { useEffect, useState } from "react";
import Room from "../room";
import LoadingPage from "../../loadingPage/loadingPage"
import axios from "axios";

const Remote = () => {
  useEffect(() =>{
    const fetchUserData = async () => {
      try {
        const access = localStorage.getItem('access');

        const response = await axios.get('http://localhost:8000/game/history/', {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        console.log("top5", response.data);
        // fetchSuggestedFriends(); // Fetch friends after getting user data

      } catch (error) {
        console.log(error);
      }
    }
    fetchUserData();
  }, [])
  const [roomData, setRoomData] = useState("Remote");
  if (!roomData) return <LoadingPage />
  return (
    <div>
      <Room data={roomData}/>
    </div>
  );
};

export default Remote;
