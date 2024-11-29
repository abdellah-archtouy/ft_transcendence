import React from 'react'
import Joker_icon from './icon/Joker_icon';

function Joker() {

  return (
    <div className='ach-joker achivement'>
        {/* <img src={avatarUrl('media/achievement/bg_joker.png')} alt="joker background" /> */}
        <div className='joker_icon ach-icon'>
            <Joker_icon ></Joker_icon>
        </div>
        <div className='ach-info'>
            <h1 className='ach-name'>Joker</h1>
            <p>Awarded for enduring defeat in 5 consecutive games without giving up</p>
        </div>
    </div>
  )
}

export default Joker