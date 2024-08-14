import React, { useState, useEffect } from 'react';
import './Msg.css';
import Set from './icons/set';
import Imoji from './icons/imoji';
import PlayInv from './icons/play_inv';
import Sent from './icons/sent';
import SenderBox from './sender_box';
import axios from 'axios';
import emojiData from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

const Msg = ({ userData , convid , conversationdata }) => {
    const [message, setMessage] = useState('');
    const [data, setData] = useState([]);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  
    const [daton, setDaton] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [imogiclicked, setImogiclicked] = useState(false);

    const fetchData = async () => {  
        try {
            console.log('convid:', convid);
            const response = await axios.get(`http://localhost:8000/api/msg/${convid}/`);  
            setData(response.data);
            setDaton(true);
        } catch (error) {  
            setError(error);
            console.log(error);
            setData([]);
            setDaton(false);
        } finally {  
            setLoading(false);  
        }  
    };  

    console.log('conversationdata:', conversationdata);
    console.log('data:', userData);
    useEffect(() => {
        fetchData();
    }, [convid]);

    const [ws, setWs] = useState(null);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/api/msg/${convid}/`);
        socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        socket.onmessage = (e) => {
            const data1 = JSON.parse(e.data);
            setData(data => [...data, data1]);
            console.log('data:', data);
            console.log('data1:', data1);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        setWs(socket);

        return () => {
            socket.close();
        };
    }, [data, convid]);

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
        // console.log('set clicked');
    }
    const handelemojiclick = () => {
        setImogiclicked(!imogiclicked);

    }

    const addemoji = (emoji) => {
        setMessage(message + emoji.native);
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    const isEmptyObject = Object.keys(conversationdata).length === 0;

    return (
        <div className={`Msg `}> 
            {!isEmptyObject ? (
                <>
                    <div className={`chat_top_bar `}>
                        <div className='icon_name'>
                        {conversationdata.uid1_info.username === userData.username ? (
                            <>
                                <img src={conversationdata.uid2_info.avatar} />
                                <h3>{conversationdata.uid2_info.username}</h3>
                            </>
                        ) : (
                            <>
                            <img src={conversationdata.uid1_info.avatar}/>
                            <h3>{conversationdata.uid1_info.username}</h3>
                            </>
                        )}
                        </div>
                        <div onClick={handelsetclick} className='set'>
                            <Set />
                            <div className={`set_dropdown ${clicked === true ? '' : 'hide'}`}>
                                <ul>
                                    <li>Block</li>
                                    <li>Mute</li>
                                    <li>Close Chat</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className={`conversation`}>
                        {data.length === 0 ? (
                            <div className='empty-conv'>
                                <p>type some thing <br/> to your friend</p>
                            </div>
                        ) : (
                            data.map((user, index) => (
                                <SenderBox key={index} name={user.user === userData.id ? 'sender' : 'receiver'} data={user} />
                            ))
                        )}
                    </div>
                    <div className={`message_bar`}>
                        <button ><PlayInv /></button>
                        <button onClick={handelemojiclick} ><Imoji /></button>
                        <div className={`picker ${imogiclicked === true ? '' : 'hide'}`}>
                            {emojiData && <Picker emojiSize={20} emojiButtonSize={28} onEmojiSelect={addemoji} previewPosition={'none'} data={emojiData} />}
                        </div>
                        <form onSubmit={handleSubmit} className="search-container1">
                            <textarea className="search-input1"
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