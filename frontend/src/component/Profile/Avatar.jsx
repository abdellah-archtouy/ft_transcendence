import React from 'react'

function Avatar(avatarImg) {
  const apiUrl = process.env.REACT_APP_API_URL;

    function avatarUrl(name) {
        return `${apiUrl}` + name;
        }

  return (
    <div className='avatar-profile'>
        <img src={avatarUrl(avatarImg.avatarImg)} alt="avatar img" />
    </div>
  )
}

export default Avatar