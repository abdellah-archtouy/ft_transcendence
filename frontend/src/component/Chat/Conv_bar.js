import Conv from './Conv';
import './Conv_bar.css';
import React, { useEffect ,useState } from 'react';
import Add from './icons/Vector'
// import Search from './icons/search'
import Vector from './icons/Vector_1';
import axios from 'axios';


const Conv_bar = () => {
  // const [value, setValue] = useState("");
  //   function handleChange(e) {
  //       setValue(e.target.value);
  //   }
    const [data, setData] = useState([]);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  

    const fetchData = async () => {  
      try {  
          const response = await axios.get('http://localhost:8000/api/conv/1/');  
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

if (loading) return <div>Loading...</div>;  
if (error) return <div>Error: {error.message}</div>;  

    

  return (
    <div className='conv_bar'>
      <div className='top'>
        <div className='center_top'>
          <h2>Chat</h2>
          <span className='add'><Add></Add></span>
        </div>
      </div>
      <div className='center'>
        <div class="search-container">
        <Vector></Vector>
        {/* onClick={handleChange} */}
        <input type="text" placeholder="Search..." name="search" class="search-input"></input>
        </div>
      </div>
      <div className='scrol'>
        {data.length === 0 ? (
          <div className='empty'>
            <p >Add a person <br/>
            and start a conversation</p>
          </div>
        ) : (
          data.map(user => (
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

// const [users, setUsers] = useState([
//   {
//     id: 1,
//     username: 'BELE',
//     profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
//     online:1
//   },
//   {
//     id: 2,
//     username: 'NOOO',
//     profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
//     online:0
//   },
//   {
//     id: 3,
//     username: 'HASSANNNNN',
//     profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
//     online:0
//   },
//   {
//     id: 1,
//     username: 'BELE',
//     profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
//     online:1
//   },
//   {
//     id: 2,
//     username: 'NOOO',
//     profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
//     online:0
//   },
//   {
//     id: 3,
//     username: 'HASSANNNNN',
//     profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
//     online:0
//   },
//   {
//     id: 1,
//     username: 'BELE',
//     profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
//     online:1
//   },
//   {
//     id: 2,
//     username: 'NOOO',
//     profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
//     online:0
//   },
//   {
//     id: 3,
//     username: 'HASSANNNNN',
//     profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
//     online:0
//   },
//   {
//     id: 1,
//     username: 'BELE',
//     profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
//     online:1
//   },
//   {
//     id: 2,
//     username: 'NOOO',
//     profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
//     online:0
//   },
//   {
//     id: 3,
//     username: 'HASSANNNNN',
//     profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
//     online:0
//   },
//   {
//     id: 1,
//     username: 'BELE',
//     profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
//     online:1
//   },
//   {
//     id: 2,
//     username: 'NOOO',
//     profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
//     online:0
//   },
//   {
//     id: 3,
//     username: 'HASSANNNNN',
//     profilePicture: 'https://randomuser.me/api/portraits/women/3.jpg',
//     online:0
//   },
//   {
//     id: 4,
//     username: 'bob',
//     profilePicture: 'https://randomuser.me/api/portraits/men/4.jpg',
//     online:1
//   }
// ]);