import React from 'react'
import './baner.css'

function Baner(banerImg) {

    function avatarUrl(name) {
      return `http://${window.location.hostname}:8000` + name;
    }
  return (
    <div className='cover-profile'>
      <img src={avatarUrl(banerImg.banerImg)} alt="cover image" />
    </div>
  )
}

export default Baner