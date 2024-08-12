import React, { useState, useEffect } from 'react';
import './Msg.css';
import Set from './icons/set';
import Imoji from './icons/imoji';
import PlayInv from './icons/play_inv';
import Sent from './icons/sent';
import SenderBox from './sender_box';
import axios from 'axios';

const Msg = ({ userData , convid , conversationdata }) => {
    const [message, setMessage] = useState('');
    const [data, setData] = useState([]);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  
    const [daton, setDaton] = useState(false);

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

    const conversationId = 1;
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
                        <div className='set'>
                            <Set />
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
                        {/* <Imoji /> */}
                        {/* <PlayInv /> */}
                        <button ><PlayInv /></button>
                        <button ><Imoji /></button>
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

{/* <div className={`chat_top_bar ${daton === false ? '' : 'hide'}`}>
                        <div className='icon_name'>
                            <img src={data[0].conversation_info.uid2_info.avatar} alt='avatar' />
                            <h3>{data[0].conversation_info.uid2_info.username}</h3>
                        </div>
                        <div className='set'>
                            <Set />
                        </div>
                    </div>
                    <div className={`conversation ${daton === false ? '' : 'hide'}`}>
                        {data.length === 0 ? (
                            <div className='empty'>
                                <p>Add a person <br/> and start a conversation</p>
                            </div>
                        ) : (
                            data.map((user, index) => (
                                <SenderBox key={index} name={user.user === 1 ? 'sender' : 'receiver'} data={user} />
                            ))
                        )}
                    </div>
                    <div className={`message_bar ${daton === false ? '' : 'hide'}`}>
                        <Imoji />
                        <PlayInv />
                        <form onSubmit={handleSubmit} className="search-container">
                            <textarea className="search-input"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message"
                                required
                            />
                            <button type="submit"><Sent /></button>
                        </form>
                    </div>
                </> */}