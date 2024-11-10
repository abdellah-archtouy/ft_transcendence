import React from 'react'
import Maestro_icon from './icon/Maestro_icon';

function avatarUrl(name) {
    return `http://${window.location.hostname}:8000/` + name;
  }

function Maestro() {
  return (
    <div className='ach-maestro achivement'>
        {/* <img src={avatarUrl('media/achievement/bg_Maestro.png')} alt="Maestro background" /> */}
        <div className='maestro_icon ach-icon'>
            <Maestro_icon ></Maestro_icon>
        </div>
        <div className='ach-info'>
            <h1 className='ach-name'>Maestro</h1>
            <p>Achieved by clinching victory
            in 10 tournament in a row </p>
        </div>
    </div>
  )
}

export default Maestro