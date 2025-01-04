import React from 'react'
import Thunder_Strike_icon from './icon/Thunder_icon';

function Thunder_Strike() {

  return (
    <div className='ach-thunder_strike achivement'>
        <div className='thunder_strike_icon ach-icon'>
            <Thunder_Strike_icon ></Thunder_Strike_icon>
        </div>
        <div className='ach-info'>
            <h1 className='ach-name'>Thunder Strike</h1>
            <p>Awarded for winning the game swiftly securing victory in a short time</p>
        </div>
    </div>
  )
}

export default Thunder_Strike