import React from 'react'

function Avatar(avatarImg) {

    function avatarUrl(name) {
        return `http://${window.location.hostname}:8000` + name;
        }

  return (
    <div className='avatar-profile'>
        <img src={avatarUrl(avatarImg.avatarImg)} alt="avatar img" />
    </div>
  )
}

export default Avatar