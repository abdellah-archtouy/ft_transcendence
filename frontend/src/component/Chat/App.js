// import logo from './logo.svg';
import React, { useEffect ,useState } from 'react';
import './App.css';
import Topbar from './Topbar';
import Conv_bar from './Conv_bar';
import Chat from './chat';

function App() {
  const [className, setClassName] = useState();
  const user = {
    id: 1,
    username: 'BELE',
    profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
    online: 1
    }
  return (
    <div className="App">
      {/* <Topbar/> */}
      <div className='chat_container'>
        <Conv_bar/>
        <Chat data={user}/>
      </div>
    </div>
  );
}

export default App;
