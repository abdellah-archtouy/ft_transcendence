import React, { useEffect, useState } from 'react';
import './Msg.css';
import Set from './icons/set'
import Imoji from './icons/imoji';
import Play_inv from './icons/play_inv'
import Sent from './icons/sent'
import Add1 from './icons/add1'
import conversationData from './conversation.json';
import Sender_box from './sender_box';

const Chat = ({ data }) => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        setMessages(conversationData.messages);
    }, []);

    return (
        <div className='Msg'>
            <div className='chat_top_bar'>
                <div className='icon_name'>
                    <img src={data.profilePicture}></img>
                    <h3>{data.username}</h3>
                </div>
                <div className='set'>
                    <Set></Set>
                </div>
            </div>
            <div className='conversation'>

                {messages.length === 0 ? (
                    <div className='empty'>
                        <p >Add a person <br />
                            and start a conversation</p>
                    </div>
                ) : (
                    messages.map(user => (
                        <Sender_box name={user.senderId === 1 ? ('sender') : ('reciver')} data={user} />
                    ))
                )}

            </div>
            <div className='message_bar'>
                {/* <Add1/> */}
                <Imoji />
                <Play_inv />
                <div className="search-container">
                    <input type="text" placeholder="Enter your message" name="search" className="search-input"></input>
                </div>
                <Sent />
            </div>
        </div>
    )
}

export default Chat