import React, { useEffect ,useState } from 'react';
import axios from 'axios';
import './Chat.css';
import ConvBar from './Conv_bar';
import Msg from './Msg';

const Chat = () => {
  // const [className, setClassName] = useState(); 
  const [userData, setUserData] = useState(null);
  const [convid , setconvid] = useState(0);
  const [conversationdata, setConversationdata] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(0);

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
          console.log('userData:', response.data);
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


  if (!userData) {
    return <div>Loading...</div>;
  }
  console.log('selectedConvId:', selectedConvId);
  return (
    // <div className="App">
      <div className={`chat_container ${selectedConvId === 0 ? 'null' : 'mobile-msg' }`}>
        <ConvBar userData={userData} setconvid={setconvid} selectedConvId={selectedConvId} setSelectedConvId={setSelectedConvId} setConversationdata={setConversationdata}/>
        <Msg userData={userData} convid={convid} setSelectedConvId={setSelectedConvId} conversationdata={conversationdata}/>
      </div>
    // </div>
  );
}

export default Chat;
