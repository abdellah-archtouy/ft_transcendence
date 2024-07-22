import React, { useState , useEffect} from 'react';
import './Msg.css';
import Set from './icons/set'
import Imoji from './icons/imoji';
import PlayInv from './icons/play_inv'
import Sent from './icons/sent'
// import ReconnectingWebSocket from 'reconnecting-websocket';
import SenderBox from './sender_box';
import axios from 'axios';


const Chat = ({data1}) => {
    // const [messages, setMessages] = useState([]);
    
    const [message, setMessage] = useState('');
    const [data, setData] = useState([]);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  
    const fetchData = async () => {  
      try {  
          const response = await axios.get('http://localhost:8000/api/msg/1/');  
          setData(response.data);  
      } catch (error) {  
          setError(error);
      } finally {  
          setLoading(false);  
      }  
    };  

    useEffect(() => {
        fetchData();// Empty dependency array means this runs once when the component mounts  

    }, [])

    const conversationId = 1
    
    const [ws, setWs] = useState(null);
    useEffect(() => {
        
        const socket = new WebSocket(`ws://localhost:8000/ws/api/msg/${conversationId}/`);
        socket.onopen = () => {
          console.log('WebSocket connection established');
        };

    
        socket.onmessage = (e) => {
          const data1 = JSON.parse(e.data);
          setData(data => [...data, data1]);
          console.log('data:', data)
          console.log('data1:', data1)
        };
    
        socket.onclose = () => {
          console.log('WebSocket connection closed');
        };
    
        setWs(socket);
    
        return () => {
          socket.close();
        };
      }, [data]);

    if (loading) return <div>Loading...</div>;  
    if (error) return <div>Error: {error.message}</div>;  


    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (ws) {
            const msg = {
                conversation: conversationId,
                user: 1,
                message: message,
                conversation_info: data[data.length - 1].conversation_info,
            };
            ws.send(JSON.stringify(msg));
            setMessage('');
        }
    };
    
    return (
        <div className='Msg'>
        <div className='chat_top_bar'>
            <div className='icon_name'>
                <img src={data[0].conversation_info.uid2_info.avatar} alt='avatar'></img>
                <h3>{data[0].conversation_info.uid2_info.username}</h3>
            </div>
            <div className='set'>
                <Set></Set>
            </div>
        </div>
        <div className='conversation'>
            
            {data.length === 0 ? (
                <div className='empty'>
                <p >Add a person <br/>
                and start a conversation</p>
            </div>
            ) : (
                data.map(user => (
                    <SenderBox name={user.user === 1 ? ('sender') : ('reciver')} data={user}/>
                ))
            )}
            
        </div>
        <div className='message_bar'>
            {/* <Add1/> */}
            <Imoji/>
            <PlayInv/>
            {/* <div class="search-container">
                <input type="text"  placeholder="Enter your message" name="search" class="search-input"></input>
                </div>
            <Sent/> */}
            <form onSubmit={handleSubmit} class="search-container">
                <textarea class="search-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message"
                    required
                    />
            {/* <Sent className="button" type="submit"/> */}
            <button type="submit"><Sent></Sent></button>
            </form>
        </div>
    </div>
  )
}

// const handleSubmit = async (event) => {
//     event.preventDefault();
//     const data1 = {
//         conversation: 1,
//         user: 1,
//         message: message,
//         time: new Date().toISOString(),
//     }
//     axios.post('http://localhost:8000/api/post/msg/', data1, {
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     })
//     .then(response => {
//     console.log(response.data);
//     setMessage('');
//     })
//     .catch(error => {
//     if (error.response) {
//         console.error('Error response data:', error.response.data);
//         console.error('Error response status:', error.response.status);
//         console.error('Error response headers:', error.response.headers);
//     } else if (error.request) {
//         console.error('Error request:', error.request);
//     } else {
//         console.error('Error message:', error.message);
//     }
//     });

//   };
export default Chat