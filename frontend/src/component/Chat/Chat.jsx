import React, { useEffect ,useState } from 'react';
import axios from 'axios';
import './Chat.css';
import ConvBar from './Conv_bar';
import Msg from './Msg';
import { createContext } from 'react';
import { useNavigate , useParams , useLocation} from "react-router-dom";

export const WebSocketContext = createContext(null);

const Chat = () => {
  const { username } = useParams();

  // const [className, setClassName] = useState(); 
  const [userData, setUserData] = useState(null);
  const [convid , setconvid] = useState(0);
  const [errors, setErrors] = useState({});
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
          const response = await axios.get(`${apiUrl}/chat/user/`, {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${access}`,
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
            .post(`${apiUrl}/api/token/refresh/`, { refresh })
            .then((refreshResponse) => {
              const { access: newAccess } = refreshResponse.data;
              localStorage.setItem("access", newAccess);
              retryFunction(); // Retry the original function
            })
            .catch((refreshError) => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              setErrors({ general: "Session expired. Please log in again." });
              window.location.reload();
              navigate("/");
            });
        } else {
          setErrors({ general: "No refresh token available. Please log in." });
        }
      } else {
        setErrors({ general: "An unexpected error occurred. Please try again." });
      }
    };
  
    fetchData();
  }, []);


  useEffect(() => {
    // Create WebSocket connection
    const access = localStorage.getItem("access");
    if (userData)
    {
      const ws = new WebSocket(`ws://${host}:8000/ws/api/data/${userData?.id}/`);
  
      ws.onopen = () => {
        console.log('WebSocket connection established');
      };
  
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
      };
  
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
      <div className={`chat_container ${queryParam.get("convid") === null ? 'null' : 'mobile-msg' }`}>
        <ConvBar userData={userData} setconvid={setconvid} selectedConvId={selectedConvId} setSelectedConvId={setSelectedConvId} setConversationdata={setConversationdata}/>
        <Msg userData={userData} convid={convid} setSelectedConvId={setSelectedConvId} conversationdata={conversationdata}/>
      </div>
    </WebSocketContext.Provider>
  );
}

export default Chat;
