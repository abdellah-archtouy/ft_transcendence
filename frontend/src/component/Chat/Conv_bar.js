import Conv from './Conv';
import './Conv_bar.css';
import React, { useEffect ,useState } from 'react';
import Add from './icons/Vector'
import Search from './icons/search'
import Vector_1 from './icons/Vector_1';



const Conv_bar = () => {
  const [value, setValue] = useState("");
    function handleChange(e) {
        setValue(e.target.value);
    }
    const [users, setUsers] = useState([
      {
        id: 1,
        username: 'BELE',
        profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
        online:1
      },
      {
        id: 2,
        username: 'NOOO',
        profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
        online:0
      },
      {
        id: 3,
        username: 'HASSANNNNN',
        profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
        online:0
      },
      {
        id: 1,
        username: 'BELE',
        profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
        online:1
      },
      {
        id: 2,
        username: 'NOOO',
        profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
        online:0
      },
      {
        id: 3,
        username: 'HASSANNNNN',
        profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
        online:0
      },
      {
        id: 1,
        username: 'BELE',
        profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
        online:1
      },
      {
        id: 2,
        username: 'NOOO',
        profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
        online:0
      },
      {
        id: 3,
        username: 'HASSANNNNN',
        profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
        online:0
      },
      {
        id: 1,
        username: 'BELE',
        profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
        online:1
      },
      {
        id: 2,
        username: 'NOOO',
        profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
        online:0
      },
      {
        id: 3,
        username: 'HASSANNNNN',
        profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
        online:0
      },
      {
        id: 1,
        username: 'BELE',
        profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
        online:1
      },
      {
        id: 2,
        username: 'NOOO',
        profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
        online:0
      },
      {
        id: 3,
        username: 'HASSANNNNN',
        profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
        online:0
      },
      {
        id: 4,
        username: 'bob',
        profilePicture: 'https://randomuser.me/api/portraits/men/4.jpg',
        online:1
      }
    ]);
  return (
    <div className='conv_bar'>
      <div className='top'>
        <div className='center_top'>
          <h2>Chat</h2>
          <a className='add'><Add></Add></a>
        </div>
      </div>
      <div className='center'>
        <div className="search-container">
        <Vector_1/>
        <input type="text" onClick={handleChange} placeholder="Search..." name="search" className="search-input"></input>
        </div>
      </div>
      <div className='scrol'>
        {users.length === 0 ? (
          <div className='empty'>
            <p >Add a person <br/>
            and start a conversation</p>
          </div>
        ) : (
          users.map(user => (
            <div className='center' key={user.id}>
              <Conv data={user} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Conv_bar