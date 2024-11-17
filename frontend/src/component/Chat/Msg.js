import React, { useState, useEffect  , useRef, useContext} from 'react';
import './Msg.css';
import Set from './icons/set';
import Imoji from './icons/imoji';
import PlayInv from './icons/play_inv';
import Sent from './icons/sent';
import SenderBox from './sender_box';
import axios from 'axios';
import emojiData from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import Back from './icons/back';
import {WebSocketContext} from './Chat';
import { useNavigate, useLocation } from "react-router-dom";


const Msg = ({ userData , convid, convname1 , setSelectedConvId , conversationdata }) => {
    const [message, setMessage] = useState('');
    const [data, setData] = useState([]);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  
    const [clicked, setClicked] = useState(false);
    const [imogiclicked, setImogiclicked] = useState(false);
    const messagesEndRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [ws, setWs] = useState(null);
    const navigate = useNavigate();
    const [convname , setConvname] = useState('');
    const [conversationdata1, setConversationdata1] = useState(conversationdata);

    const location = useLocation();
    const socket = useContext(WebSocketContext);

    const queryParam = new URLSearchParams(location.search);
    // queryParam.get('username');
    
    
    useEffect(() => {
        if (!socket) return;
        socket.onmessage = (event) => {

            const  message1 = JSON.parse(event.data);
            const messag = message1.message;
            
            const  parsmsg = JSON.parse(messag);
            if (String(parsmsg.conversation) === queryParam.get('convid')) {
                setData(data => [...data, parsmsg]);
            }
        };
        
        setWs(socket);
    }, [socket, convid]);

    useEffect(() => {
        setConvname(queryParam.get('username'));
        console.log('convid ', queryParam.get('convid'));
    }, [queryParam]);

    
    useEffect(() => {
        const fetchData = async () => {  
            const access = localStorage.getItem("access");
            try {
                if (queryParam.get('username') === null)
                    return;
                const response2 = await axios.get(`http://${window.location.hostname}:8000/chat/conversation/${queryParam.get('convid')}/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access}`,
                    }});
                setConversationdata1(response2.data);
                const response = await axios.get(`http://${window.location.hostname}:8000/chat/msg/${queryParam.get('username')}/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access}`,
                    }});
                setData(response.data);
            } catch (error) {  
                setError(error);
                handleFetchError(error);
                console.log(error);
                setData([]);
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
                      navigate(`/chat?username=${queryParam.get('username')}&convid=${queryParam.get('convid')}`);
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
    }, [convname]);


    

    const handleSubmit = (e) => {
        e.preventDefault();
        if (ws) {
            const msg = {
                conversation: conversationdata.id,
                user: userData.id,
                message: message,
                conversation_info: conversationdata.conversation_info,
            };
            ws.send(JSON.stringify(msg));

            setMessage('');
        }
    };

    const handelsetclick = () => {
        setClicked(!clicked);
    }
    const handelemojiclick = () => {
        setImogiclicked(!imogiclicked);

    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [data]);

    const addemoji = (emoji) => {
        setMessage(message + emoji.native);
    }

    const handelcloseChat = () => {
        queryParam.set('username' , '');
        navigate('/chat');
        setSelectedConvId(0);
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    const isEmptyObject = Object.keys(conversationdata).length === 0;
    function avatarUrl(name) {
        return `http://${window.location.hostname}:8000` + name;
      }
    return (
        <div className={`Msg `}> 
            {queryParam.get('convid') !== null ? (
                <>
                    <div className={`chat_top_bar `}>
                        <div className='icon_name'>
                            <button className='Backbutton' onClick={handelcloseChat}>
                                <Back /> 
                            </button>
                            <>
                                <img src={avatarUrl(conversationdata1?.uid2_info?.avatar)} alt='avatr' />
                                <h3>{conversationdata1?.uid2_info?.username}</h3>
                            </>
                        </div>
                        <div onClick={handelsetclick} className='set'>
                            <button>
                                <Set />
                            </button>
                            <div className={`set_dropdown ${clicked === true ? '' : 'hide'}`}>
                                <ul>
                                    <li>Block</li>
                                    <li>Mute</li>
                                    <li onClick={handelcloseChat}>Close Chat</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div  className={`conversation`}>
                        {data.length === 0 ? (
                            <div className='empty-conv'>
                                <p>type some thing <br/> to your friend</p>
                            </div>
                        ) : (
                            data.map((user, index) => (
                                <SenderBox key={index} name={user.user === userData.id ? 'sender' : 'receiver'} data={user} />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                        <div/>
                    </div>
                    <div className={`message_bar`}>
                        <button ><PlayInv /></button>
                        <button onClick={handelemojiclick} ><Imoji /></button>
                        <div className={`picker ${imogiclicked === true ? '' : 'hide'}`}>
                            {emojiData && <Picker emojiSize={20} emojiButtonSize={28} onEmojiSelect={addemoji} previewPosition={'none'} data={emojiData} />}
                        </div>
                        <form onSubmit={handleSubmit} className="search-container1">
                            <input className="search-input1"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message"
                                required
                            />
                            <button type="submit"><Sent id="sent" /></button>
                        </form>
                    </div>
                </>
            ) : (
                <div className='empty'>
                    <p>Add a person <br/> and start a conversation</p>
                </div>
            )}
        </div>
    );
};

export default Msg;
