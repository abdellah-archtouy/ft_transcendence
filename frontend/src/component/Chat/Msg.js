import React, { useState, useEffect } from 'react';
import './Msg.css';
import Set from './icons/set';
import Imoji from './icons/imoji';
import PlayInv from './icons/play_inv';
import Sent from './icons/sent';
import SenderBox from './sender_box';
import axios from 'axios';

const Msg = ({ data1 }) => {
    const [message, setMessage] = useState('');
    const [data, setData] = useState([]);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  
    const [daton, setDaton] = useState(false);

    const fetchData = async () => {  
        try {  
            const response = await axios.get('http://localhost:8000/api/msg/1/');  
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

    useEffect(() => {
        fetchData();
    }, []);

    const conversationId = 1;
    const [ws, setWs] = useState(null);

    useEffect(() => {
        const socket = new WebSocket(`ws://localhost:8000/ws/api/msg/${conversationId}/`);
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
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (ws) {
            const msg = {
                conversation: conversationId,
                user: 1,
                message: message,
                conversation_info: data.length > 0 ? data[data.length - 1].conversation_info : null,
            };
            ws.send(JSON.stringify(msg));
            setMessage('');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className={`Msg `}>
            {data.length > 0 && data[0].conversation_info ? (
                <>
                    <div className={`chat_top_bar ${daton === false ? '' : 'hide'}`}>
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
