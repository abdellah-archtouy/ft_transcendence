import React, { useEffect , useState } from 'react';
import './Conv.css';
// import Delete from './icons/delete';

const Conv = ({ data, userData, selectedConvId }) => {
  const [last_message_time, setLast_message_time] = useState('');

  function avatarUrl(name) {
    return `http://${window.location.hostname}:8000` + name;
  }
  
  useEffect(() => {
    const date = new Date(data.last_message_time);
    setLast_message_time(date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'}));
  }, [data]);
  return (
    <div className={`conv ${selectedConvId === data.id ? 'selected' : ''}`}>
      {data.uid1_info.username === userData.username ? (
        <>
          <img src={avatarUrl(data.uid2_info.avatar)} alt='user avatar' />
          <div className='user_lastmsg'>
            <div className='avatar_on'>
              <h3>{data.uid2_info.username}</h3>
              <div className='online'></div>
            </div>
            <p>{`${data.last_message.substring(0, 10)} ${data.last_message.length > 10 ? '...' : ''}`}</p>
          </div>
            <p className='timee'>{last_message_time}</p>
        </>
      ) : (
        <>
          <img src={avatarUrl(data.uid1_info.avatar)} alt='user avatar'/>
          <div>
            <div className='avatar_on'>
              <h3>{data.uid1_info.username}</h3>
              <div className='online'></div>
            </div>

            <p>{`${data.last_message.substring(0, 10)} ${data.last_message.length > 10 ? '...' : ''}`}</p>
          </div>
            <p className='timee'>{last_message_time}</p>
        </>
      )}
      {/* <Delete /> */}
    </div>
  );
};

export default Conv;
