import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Chat.css";
import ConvBar from "./Conv_bar";
import Msg from "./Msg";
import { createContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const WebSocketContext = createContext(null);

const Chat = () => {
  const { username } = useParams();
  const apiUrl = process.env.REACT_APP_API_URL;

  // const [className, setClassName] = useState();
  const [userData, setUserData] = useState(null);
  const [convid, setconvid] = useState(0);
  const [errors, setErrors] = useState({});
  const [conversationdata, setConversationdata] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(0);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  console.log("selectedConvId:", selectedConvId);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.get(`${apiUrl}/chat/user/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          withCredentials: true,
        });
        setUserData(response.data);
        //   console.log('userData:', response.data);
      } catch (error) {
        handleFetchError(error, fetchData);
        // if (error.response && error.response.status === 403) {
        //     console.error('403 Forbidden');
        // } else {
        //     console.error('Error fetching user data:', error.response ? error.response.data : error.message);
        // }
      }
    };

    const handleFetchError = (error, retryFunction) => {
      if (error.response && error.response.status === 401) {
        const refresh = localStorage.getItem("refresh");
  
        if (refresh) {
          axios
            .post(`${apiUrl}/api/token/refresh/`, { refresh })
            .then((refreshResponse) => {
              const { access: newAccess } = refreshResponse.data;
              localStorage.setItem("access", newAccess);
              retryFunction();
            })
            .catch((refreshError) => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              console.log({ general: "Session expired. Please log in again." });
              window.location.reload();
              navigate("/");
            });
          } else {
            console.log({ general: "No refresh token available. Please log in." });
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.reload();
            navigate("/");
        }
      } else {
        console.log({ general: "An unexpected error occurred. Please try again." });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Create WebSocket connection
    const access = localStorage.getItem("access");
    const ws = new WebSocket(`ws://${host}:8000/ws/api/data/${access}/`);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  if (!userData) {
    return <div>Loading...</div>;
  }
  // console.log('selectedConvId:', selectedConvId);
  return (
    <WebSocketContext.Provider value={socket}>
      <div
        className={`chat_container ${
          selectedConvId === 0 ? "null" : "mobile-msg"
        }`}
      >
        <ConvBar
          userData={userData}
          setconvid={setconvid}
          selectedConvId={selectedConvId}
          setSelectedConvId={setSelectedConvId}
          setConversationdata={setConversationdata}
        />
        <Msg
          userData={userData}
          convid={convid}
          convname={username}
          setSelectedConvId={setSelectedConvId}
          conversationdata={conversationdata}
        />
      </div>
    </WebSocketContext.Provider>
  );
};

export default Chat;
