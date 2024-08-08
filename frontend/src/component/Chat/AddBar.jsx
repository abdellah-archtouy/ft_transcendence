import React from 'react'
import { useState, useEffect } from 'react'
import './AddBar.css'
import Search from './icons/search'
import axios from 'axios'

import PropTypes from 'prop-types';

AddBar.propTypes = {
    conv: PropTypes.array.isRequired,
    setConv: PropTypes.func.isRequired,
    on: PropTypes.bool.isRequired,
    setOn: PropTypes.func.isRequired,
};


function AddBar({conv, setConv, on ,setOn}) {
    const [data, setData] = useState([]);
    const [resulte1, setresulte1] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleKeyDown = (event) => {
        if (event.key === 'Escape' || event.keyCode === 27) {
            setOn(true);
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (data) {
            fetchData();
        } else {
            setresulte1([]);
        }
    }, [data]);
    
    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users/');
            setresulte1(response.data.filter((user) => {
                return data && user && user.username.toLowerCase().includes(data.toLowerCase());
            }));
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    }
    

    const handleChange = (e) => {
        setData(e);
        // fetchData();
    }
    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error.message}</div>;
    const [ws, setWs] = useState(null);
    const handleWebSocketMessage = (e) => {
        const conv1 = JSON.parse(e.data);
        setConv(conv => [...conv1, conv]);
        // console.log('data:', conv);
        // console.log('data1:', conv1);
    };
    const handleClick = (userId) => () => {
      setOn(true);
      if (ws && ws.readyState === WebSocket.OPEN) {
          const msg = { user: userId};
          ws.send(JSON.stringify(msg));
          setData('');
      } else {
          console.log('WebSocket is not ready');
      }
  };
    

    useEffect(() => {
        
        const socket = new WebSocket(`ws://localhost:8000/ws/api/addconv/`);
        socket.onopen = () => {
          console.log('WebSocket connection established');
        };


        socket.onmessage = socket.onmessage = (e) => {
            console.log('WebSocket message received:', e.data);

            try {
                const data = JSON.parse(e.data);
                const conv1 = data.conversation;

                if (Array.isArray(conv1)) {
                    console.log('Updating conversations (array):', conv1);
                    setConv(conv => [...conv1, ...conv]);
                } else if (conv1 && typeof conv1 === 'object') {
                    console.log('Updating conversations (object):', conv1);
                    setConv(conv => [conv1, ...conv]);
                } else {
                    console.error('Unexpected data format:', conv1);
                }
            } catch (error) {
                console.error('Failed to parse WebSocket message:', error);
            }
        };

        socket.onclose = () => {
          console.log('WebSocket connection closed');
        };
    
        setWs(socket);
    
        return () => {
          socket.close();
        };
      },[]);


    
  return (
    <div className={`AddBar ${on === false ? '' : 'hide'}`}>
        <div className='SearchBar-container'>
            <div className='SearchBar'>
                <Search className='SearchIcon'/>
                <input type="text" placeholder="Search..." name="search" className="SearchInput" value={data} onClick={handleKeyDown} onChange={(e) => handleChange(e.target.value)}></input>
            </div>
            <div className='result'>
            {resulte1.length === 0 ? (
                 <div className='empty'>
                <p >Add a person <br/>
                and start a conversation</p>
                </div>
            ) : (
            resulte1.map(user => (
                <button onClick={handleClick(user.id)} className='center' key={user.id}>
                    {user.username}
                </button>
                ))
            )}
            </div>
        </div>
    </div>
  )
}

export default AddBar