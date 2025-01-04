import React, { useEffect, useState } from "react";
import "./Conv.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useError } from "../../App";

// import Delete from './icons/delete';

const Conv = ({ data }) => {
  const [last_message_time, setLast_message_time] = useState("");
  const [status, setStatus] = useState(data?.uid2_info?.stat);
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const queryParam = new URLSearchParams(location.search);
  const { statusSocket } = useError();

  function avatarUrl(name) {
    return `${apiUrl}` + name;
  }

  useEffect(() => {
    const handleStatusUpdate = (event) => {
      try {
        const statdata = JSON.parse(event.data);
        if (data?.conv_username === statdata?.username)
          setStatus(statdata?.stat);
      } catch (error) {
        // console.error("Failed to parse WebSocket message:", error);
      }
    };

    if (statusSocket) {
      statusSocket.addEventListener("message", handleStatusUpdate);
    }
    return () => {
      if (statusSocket) {
        statusSocket.removeEventListener("message", handleStatusUpdate);
      }
    };
  }, [statusSocket]);

  useEffect(() => {
    const date = new Date(data?.last_message_time);
    setLast_message_time(
      date?.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    );
  }, [data]);
  return (
    <div
      className={`conv ${
        queryParam.get("convid") === String(data?.id) ? "selected" : ""
      }`}
    >
      <img src={avatarUrl(data?.uid2_info?.avatar)} alt="user avatar" />
      <div className="user_lastmsg">
        <div className="avatar_on">
          <h3>{data?.uid2_info?.username}</h3>
          <div className={`${status ? "online" : "offline"}`}></div>
        </div>
        {data?.last_message && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              height: "calc(clamp(0.688rem, 0.625vw + 0.438rem, 1rem) - 1px)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              height={"100%"}
              fill="#CDCDCD"
            >
              <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
            </svg>
            <p>{`${String(data?.last_message)?.substring(0, 10)} ${
              String(data?.last_message)?.length > 10 ? "..." : ""
            }`}</p>
          </div>
        )}
      </div>
      <p className="timee">{last_message_time}</p>
    </div>
  );
};

{
  /* 'online' */
}
export default Conv;
