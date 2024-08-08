import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Conv from './Conv';
import AddBar from './AddBar';
import Add from './icons/Vector';
import Vector from './icons/Vector_1';
import './Conv_bar.css';

const ConvBar = ({ userData , setconvid , setConversationdata}) => {
  const [conv, setConv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [on, setOn] = useState(true);
  const [selectedConvId, setSelectedConvId] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/conv/${userData.id}/`);
      if (response.data && response.data.length > 0) {
        setConv(response.data);
      } else {
        setConv([]);
        console.log('No data found');
      }
    } catch (error) {
      setError(error);
      console.log(error);
      setConv([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClickconv = (conv) => {
    setSelectedConvId(conv.id);
    setconvid(conv.id);
    setConversationdata(conv);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleClickAdd = () => {
    setOn(false);
  };

  return (
    <div className='conv_bar'>
      <AddBar conv={conv} setConv={setConv} on={on} setOn={setOn} className='Search-bar' />
      <div className='top'>
        <div className='center_top'>
          <h2>Chat</h2>
          <button className='add' onClick={handleClickAdd}><Add /></button>
        </div>
      </div>
      <div className='center'>
        <div className="search-container">
          <Vector />
          <input type="text" placeholder="Search..." name="search" className="search-input" />
        </div>
      </div>
      <div className='scrol'>
        {conv.length === 0 ? (
          <div className='empty'>
            <p>Add a person <br /> and start a conversation</p>
          </div>
        ) : (
          conv.map(user => (
            <div
              className='center'
              key={user.id}
              onClick={() => handleClickconv(user)}
            >
              <Conv data={user} userData={userData} selectedConvId={selectedConvId} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConvBar;
