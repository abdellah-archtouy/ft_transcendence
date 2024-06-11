import React from 'react'
import './sender_box.css';

const Sender_box = ({name, data}) => {
  return (
    <div className={name}>
        <div className='msg_box'>
        <span>{data.text}</span>
      </div>
    </div>
  )
}

export default Sender_box