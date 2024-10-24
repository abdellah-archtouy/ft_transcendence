import React from 'react'
import { useParams } from 'react-router-dom';

const OthersProfile = () => {
  const { username } = useParams();

  const url = username
          ? `http://localhost:8000/api/user/${username}/` // Fetch other user
          : 'http://localhost:8000/api/profile/';
  return (
    <div>{url}</div>
  )
}

export default OthersProfile