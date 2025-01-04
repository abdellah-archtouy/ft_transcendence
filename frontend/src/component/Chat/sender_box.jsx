import React from 'react'
import './sender_box.css';
import Arrow from './icons/arrow';
import { useNavigate } from 'react-router-dom';

const Sender_box = ({userData, name, data, roomname}) => {
  const navigate = useNavigate();
  const handleclick = () =>{
    console.log(data);
    console.log(data.invite_room_name);
      navigate(data.invite_room_name);
  }
  return (
    <div className={name}>
        <div className='msg_box'>
        {data.msg_type === 'invite' ? (
          <button onClick={handleclick} className='button-invite'>
            <span>PLAY NOW !!</span>
            <Arrow/>
          </button>
          ):(
            <span>{data.message}</span>
          )}
      </div>
    </div>
  )
}

export default Sender_box