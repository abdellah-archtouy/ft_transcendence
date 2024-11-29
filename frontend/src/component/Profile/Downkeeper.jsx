import React from 'react'
import Downkeeper_icon from './icon/Downkeeper_icon';

function Downkeeper() {
  return (
    <div className='ach-downkeeper achivement'>
        {/* <img src={avatarUrl('media/achievement/bg_Downkeeper.png')} alt="Downkeeper background" /> */}
        <div className='downkeeper_icon ach-icon'>
            <Downkeeper_icon ></Downkeeper_icon>
        </div>
        <div className='ach-info'>
            <h1 className='ach-name'>Downkeeper</h1>
            <p>Clinching victory in 10 matches with no enemy goals </p>
        </div>
    </div>
  )
}

export default Downkeeper