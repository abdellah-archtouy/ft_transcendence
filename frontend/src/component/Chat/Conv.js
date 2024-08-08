import React, { useState } from 'react';
import './Conv.css';
import Delete from './icons/delete';

const Conv = ({ data, userData, selectedConvId }) => {
  const [selectedConv, setSelectedConv] = useState(null);
  const [chatContent, setChatContent] = useState([]);

  const handleSelect = async (conv) => {
    setSelectedConv(conv.id);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/chat/${conv.id}/`);
      const data = await response.json();
      setChatContent(data);
    } catch (error) {
      console.error('Error fetching chat content:', error);
    }
  };

  return (
    <div className={`conv ${selectedConvId === data.id ? 'selected' : ''}`}>
      {data.uid1_info.username === userData.username ? (
        <>
          <img src={data.uid2_info.avatar} />
          <h3>{data.uid2_info.username}</h3>
        </>
      ) : (
        <>
          <img src={data.uid1_info.avatar}/>
          <h3>{data.uid1_info.username}</h3>
        </>
      )}
      <Delete />
    </div>
  );
};

export default Conv;
