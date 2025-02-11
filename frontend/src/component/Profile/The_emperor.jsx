import React from 'react'
import The_emperor_icon from './icon/The_emperor_icon';


function The_emperor() {

  return (
    <div className='ach-the_emperor achivement'>
        <div className='the_emperor_icon ach-icon'>
            <The_emperor_icon ></The_emperor_icon>
        </div>
        <div className='ach-info'>
            <h1 className='ach-name'>The Emperor</h1>
            <p>Achieved by ruling the top of the leaderboard, showcasing unmatched skill</p>
        </div>
    </div>
  )
}

export default The_emperor