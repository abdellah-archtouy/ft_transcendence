import React from 'react'
import './baner.css'

function Baner(banerImg) {
    const apiUrl = process.env.REACT_APP_API_URL;

    function avatarUrl(name) {
      return `${apiUrl}` + name;
    }
  return (
    <div className='cover-profile'>
      <img src={avatarUrl(banerImg.banerImg)} alt="cover image" />
    </div>
  )
}

export default Baner