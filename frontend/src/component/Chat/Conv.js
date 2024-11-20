import React, { useEffect , useState } from 'react';
import './Conv.css';
import { useNavigate, useLocation } from "react-router-dom";

// import Delete from './icons/delete';

const Conv = ({ data }) => {
  const [last_message_time, setLast_message_time] = useState('');
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const queryParam = new URLSearchParams(location.search);

  function avatarUrl(name) {
    return `${apiUrl}` + name;
  }
  
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
              <div className='online'></div>
            </div>
            <p>{`${String(data.last_message).substring(0, 10)} ${String(data.last_message).length > 10 ? '...' : ''}`}</p>
          </div>
            <p className='timee'>{last_message_time}</p>
    </div>
  );
};

export default Conv;
