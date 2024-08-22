import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Conv from './Conv';
import AddBar from './AddBar';
import Add from './icons/Vector';
import Vector from './icons/Vector_1';
import './Conv_bar.css';
import { WebSocketContext } from './Chat';

const ConvBar = ({ userData , setconvid , selectedConvId , setSelectedConvId, setConversationdata}) => {
  const [conv, setConv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [on, setOn] = useState(true);
  const [search, setSearch] = useState('');
  const [tmp, setTmp] = useState([]);
  const [isEmptyObject, setisEmptyObject] = useState(true);

  const socket = useContext(WebSocketContext);

  // const [selectedConvId, setSelectedConvId] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://${window.location.hostname}:8000/api/conv/${userData.id}/`);
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
    console.log('socket:', socket);
    if (!socket) return;

    
    const handleMessage = (e) => {
      console.log('Message from WebSocket:', e.data);
    };

    socket.addEventListener('message', handleMessage);

    // socket.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   console.log('Message from WebSocket2:', data);
    // };

    // Clean up

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleClickconv = (conv) => {
    setSelectedConvId(conv.id);
    setconvid(conv.id);
    setConversationdata(conv);
  };

  useEffect(() => {
    if (selectedConvId !== 0)
      return;
    setconvid(selectedConvId);
    setConversationdata([]);
  }, [selectedConvId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleClickAdd = () => {
    setOn(false);
  };


  const handleChange = (e) => {
    setSearch(e);
    if (e === '') {
      setisEmptyObject(true);
    }
    else {
      setisEmptyObject(false);
    }
    if (e) {
      const searchQuery = e.toLowerCase();
      // console.log(searchQuery);
      const result = conv.filter((user) => {
        return user && user.uid2_info.username && user.uid2_info.username.toLowerCase().includes(searchQuery);
      });
      // console.log(result);
      setTmp(result);
    } else {
      setTmp([]);
    }
  };

  const handlesearchclick = (user) => {
    setSearch('');
    setisEmptyObject(true);
    setSelectedConvId(user.id);
    setconvid(user.id);
    setConversationdata(user);
  };
  

  return (
    <div className='conv_bar'>
      <AddBar setconvid={setconvid} setConversationdata={setConversationdata} conv={conv} userData={userData} setSelectedConvId={setSelectedConvId} setConv={setConv} on={on} setOn={setOn} className='Search-bar' />
      <div className='top'>
        <div className='center_top'>
          <h2>Chat</h2>
          <button className='add' onClick={handleClickAdd}><Add /></button>
        </div>
      </div>
      <div className='center'>
        <div className="search-container">
          <Vector />
          <input type="text" placeholder="Search..." name="search" className="search-input"
            value={search} onChange={(e) => handleChange(e.target.value)} />
        </div>
      </div>
      {isEmptyObject === false ? (
      <div className={`scrol`}>
          {tmp.length === 0 ? (
            <div className='empty'>
              <p>No conversation <br/> with this name</p>
            </div>
          ) : (
            tmp.map(user => (
              <div
                className='center'
                key={user.id}
                onClick={() => handlesearchclick(user)}
              >
                <Conv data={user} userData={userData} selectedConvId={selectedConvId} />
              </div>
            ))
          )}
      </div>) :(
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
      </div>)}
    </div>
  );
};

export default ConvBar;
