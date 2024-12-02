import React, { useEffect , useState } from 'react';
import './Conv.css';
import { useNavigate, useLocation } from "react-router-dom";
import { useError } from "../../App";

// import Delete from './icons/delete';

const Conv = ({ data }) => {
  const [last_message_time, setLast_message_time] = useState('');
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
        console.error("Failed to parse WebSocket message:", error);
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
    const date = new Date(data.last_message_time);
    setLast_message_time(date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'}));
  }, [data]);
  return (
    <div className={`conv ${queryParam.get('convid') === String(data.id) ? 'selected' : ''}`}>
          <img src={avatarUrl(data.uid2_info?.avatar)} alt='user avatar' />
          <div className='user_lastmsg'>
            <div className='avatar_on'>
              <h3>{data.uid2_info?.username}</h3>
              <div className={`${status ? 'online' : 'offline'}`}></div>
            </div>
            <p>{`${String(data.last_message).substring(0, 10)} ${String(data.last_message).length > 10 ? '...' : ''}`}</p>
          </div>
            <p className='timee'>{last_message_time}</p>
    </div>
  );
};

{/* 'online' */}
export default Conv;
