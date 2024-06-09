import React from 'react'
import './Conv.css';
import Delete from './icons/delete'

const Conv = ({data}) => {
  return (
    <div className='conv'>
      <img src={data.profilePicture}></img>
      <h3>{data.username}</h3>
      {/* {data.online ? <p>online</p> : <p></p>} */}
      <Delete/>
    </div>
  )
}

export default Conv