import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import Conv from './Conv';
import AddBar from './AddBar';
import Add from './icons/Vector';
import Vector from './icons/Vector_1';
import './Conv_bar.css';
import { WebSocketContext } from './Chat';
import { useNavigate } from "react-router-dom";


const ConvBar = ({ userData , setconvid , selectedConvId , setSelectedConvId, setConversationdata}) => {
  const [conv, setConv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [on, setOn] = useState(true);
  const [search, setSearch] = useState('');
  const [tmp, setTmp] = useState([]);
  const [isEmptyObject, setisEmptyObject] = useState(true);
  const navigate = useNavigate();
  const socket = useContext(WebSocketContext);

  // const [selectedConvId, setSelectedConvId] = useState(null);

  useEffect(() => {

  const fetchData = async () => {
    
    const access = localStorage.getItem("access");
    try {
      const response = await axios.get(`http://${window.location.hostname}:8000/chat/conv/`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access}`,
        }});
      if (response.data && response.data.length > 0) {
        setConv(response.data);
        // console.log('data:', response.data);
      } else {
        setConv([]);
        console.log('No data found');
      }
    } catch (error) {
      setError(error);
      console.log(error);
      handleFetchError(error);
      setConv([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const refresh = localStorage.getItem("refresh");

        if (refresh) {
          axios
            .post("http://localhost:8000/api/token/refresh/", { refresh })
            .then((refreshResponse) => {
              const { access: newAccess } = refreshResponse.data;
              localStorage.setItem("access", newAccess);
              fetchData(); // Retry fetching user data
            })
            .catch((refreshError) => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              console.log("you have captured the error");
              setErrors({ general: "Session expired. Please log in again." });
              // refreh the page
              window.location.reload();
              navigate("/");
            });
        } else {
          setErrors({
            general: "No refresh token available. Please log in.",
          });
        }
      } else {
        setErrors({ general: "Error fetching data. Please try again." });
      }
    } else {
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
    }
  };

  fetchData();
}, []);

  // console.log('conv:', conv);

  useEffect(() => {
    // console.log('socket:', socket);
    if (!socket) return;

    
    const handleMessage = (e) => {
        const data = JSON.parse(e.data);
        const data1 = data.data[0];
        const existcon = conv.filter((user) => {
          if (user.id === data1.id) {
            return data1;}
        });
        if (existcon.length === 0) {
          return;
        }
        else {
          setConv((conv) => conv.map((user) => {
            if (user.id === data1.id) {
              return data1;
            }
            return user;
          }
          ));
        }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket , conv]);

  const handleClickconv = (conv) => {
    // setSelectedConvId(conv.id);
    console.log('conv:', conv);
    navigate(`/chat?username=${conv.conv_username}&convid=${conv.id}`);
    // setconvid(conv.id);
    setConversationdata(conv);
  };

  useEffect(() => {
    if (selectedConvId !== 0)
      return;
    setconvid(selectedConvId);
    setConversationdata([]);
  }, [selectedConvId]);

  if (loading) return <div>Loading...</div>;
  // if (error) return <div>Error: {error.message}</div>;

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
      const result = conv.filter((user) => {
        return user && user.uid2_info.username && user.uid2_info.username.toLowerCase().includes(searchQuery);
      });
      setTmp(result);
    } else {
      setTmp([]);
    }
  };

  const handlesearchclick = (user) => {
    setSearch('');
    setisEmptyObject(true);
    console.log('user:', user);
    navigate(`/chat?username=${user.conv_username}&convid=${user.id}`);
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
                <Conv data={user}/>
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
              <Conv data={user}/>
            </div>
          ))
        )}
      </div>)}
    </div>
  );
};

export default ConvBar;
