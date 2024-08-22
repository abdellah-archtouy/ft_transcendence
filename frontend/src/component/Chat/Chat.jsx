import React, { useEffect ,useState } from 'react';
import axios from 'axios';
import './Chat.css';
import ConvBar from './Conv_bar';
import Msg from './Msg';
import { createContext } from 'react';

export const WebSocketContext = createContext(null);

const Chat = () => {
  // const [className, setClassName] = useState(); 
  const [userData, setUserData] = useState(null);
  const [convid , setconvid] = useState(0);
  const [conversationdata, setConversationdata] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(0);
  const [socket, setSocket] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('token');
  
      try {
          const response = await axios.get(`http://${window.location.hostname}:8000/api/user/`, {
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
              },
              withCredentials: true,
          });
          setUserData(response.data);
          // console.log('userData:', response.data);
      } catch (error) {
          if (error.response && error.response.status === 403) {
              console.error('403 Forbidden');
          } else {
              console.error('Error fetching user data:', error.response ? error.response.data : error.message);
          }
      }
    };
  
  
    fetchData();
  }, []);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/ws/api/data/${selectedConvId}/`);

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
  }, []);


  if (!userData) {
    return <div>Loading...</div>;
  }
  // console.log('selectedConvId:', selectedConvId);
  return (
    <WebSocketContext.Provider value={socket}>
      <div className={`chat_container ${selectedConvId === 0 ? 'null' : 'mobile-msg' }`}>
        <ConvBar userData={userData} setconvid={setconvid} selectedConvId={selectedConvId} setSelectedConvId={setSelectedConvId} setConversationdata={setConversationdata}/>
        <Msg userData={userData} convid={convid} setSelectedConvId={setSelectedConvId} conversationdata={conversationdata}/>
      </div>
    </WebSocketContext.Provider>
  );
}

export default Chat;
