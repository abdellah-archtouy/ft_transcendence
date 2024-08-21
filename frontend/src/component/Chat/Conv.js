import React, { useEffect , useState } from 'react';
import './Conv.css';
// import Delete from './icons/delete';

const Conv = ({ data, userData, selectedConvId }) => {
  const date = new Date(data.last_message_time);
  const [last_message_time, setLast_message_time] = useState(date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'}));

  useEffect(() => {
    setLast_message_time(date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'}));
  }, []);
  
  console.log('last_message_time:', last_message_time);
  return (
    <div className={`conv ${selectedConvId === data.id ? 'selected' : ''}`}>
      {data.uid1_info.username === userData.username ? (
        <>
          <img src={data.uid2_info.avatar} alt='user avatar' />
          <div className='user_lastmsg'>
            <div className='avatar_on'>
              <h3>{data.uid2_info.username}</h3>
              <div className='online'></div>
            </div>
            <p>{`${data.last_message.substring(0, 20)} ${data.last_message.length > 20 ? '...' : ''}`}</p>
          </div>
            <p className='timee'>{last_message_time}</p>
        </>
      ) : (
        <>
          <img src={data.uid1_info.avatar} alt='user avatar'/>
          <div>
            <div className='avatar_on'>
              <h3>{data.uid1_info.username}</h3>
              <div className='online'></div>
            </div>

            <p>{`${data.last_message.substring(0, 20)}`}</p>
          </div>
        </>
      )}
      {/* <Delete /> */}
    </div>
  );
};

export default Conv;
