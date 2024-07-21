// import React, { useEffect ,useState } from 'react';
import './Chat.css';
import ConvBar from './Conv_bar';
import Msg from './Msg';

const Chat = () => {
  // const [className, setClassName] = useState();
  const user = {
    id: 1,
    username: 'BELE',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
    online: 1
    }
  return (
    <div>
      <div className='chat_container'>
        <ConvBar/>
        <Msg data={user}/>
      </div>
    </div>
  )
}

export default Chat
