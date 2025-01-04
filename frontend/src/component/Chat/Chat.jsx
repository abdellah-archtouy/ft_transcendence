import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Chat.css";
import ConvBar from "./Conv_bar";
import Msg from "./Msg";
import { createContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const WebSocketContext = createContext(null);

const Chat = () => {

  const [userData, setUserData] = useState(null);
  const [convid, setconvid] = useState(0);
  const [conversationdata, setConversationdata] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const host = process.env.REACT_APP_API_HOSTNAME;
  const location = useLocation();

  const queryParam = new URLSearchParams(location.search);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.get(`${apiUrl}/api/chat/user/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          withCredentials: true,
        });
        setUserData(response.data);
      } catch (error) {
        handleFetchError(error, () => fetchData());
      }
    };

    const handleFetchError = (error, retryFunction) => {
      if (error.response && error.response.status === 401) {
        const refresh = localStorage.getItem("refresh");
  
        if (refresh) {
          axios
            .post(`${apiUrl}/api/users/token/refresh/`, { refresh })
            .then((refreshResponse) => {
              const { access: newAccess } = refreshResponse.data;
              localStorage.setItem("access", newAccess);
              
              fetch(`${apiUrl}/api/users/profile/`, {
                headers: { Authorization: `Bearer ${newAccess}` }
              }).then(response => {
                if (response.ok) {
                  retryFunction();
                } else {
                  console.log("Error fetching user data after token refresh");
                  localStorage.removeItem("access");
                  localStorage.removeItem("refresh");
                  window.location.reload();
                  navigate("/");
                }
              });
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
    if (userData) {
      const ws = new WebSocket(
        `wss://${host}/ws/api/data/${userData?.id}/`
      );

      setSocket(ws);

      return () => {
        ws.close();
      };
    }
  }, [userData]);

  if (!userData) {
    return <div>Loading...</div>;
  }
  return (
    <WebSocketContext.Provider value={socket}>
      <div
        className={`chat_container ${queryParam.get("convid") === null ? "null" : "mobile-msg"
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
          setSelectedConvId={setSelectedConvId}
          conversationdata={conversationdata}
        />
      </div>
    </WebSocketContext.Provider>
  );
};

export default Chat;
