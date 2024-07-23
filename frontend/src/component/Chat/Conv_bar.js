import Conv from './Conv';
import './Conv_bar.css';
import React, { useEffect ,useState } from 'react';
import Add from './icons/Vector'
// import Search from './icons/search'
// import SearchBar from '../Navbar/searchBar';
import Vector from './icons/Vector_1';
import axios from 'axios';
import AddBar from './AddBar';


const Conv_bar = () => {

    const [conv, setConv] = useState([]);  
    const [loading, setLoading] = useState(true);  
    const [error, setError] = useState(null);  
    const [on, setOn] = useState(true);

    const fetchData = async () => {  
      try {  
          const response = await axios.get('http://localhost:8000/api/conv/1/');  
          setConv(response.data);  
      } catch (error) {  
          setError(error);  
      } finally {  
          setLoading(false);  
      }  
  };  
  useEffect(() => {
    fetchData();

  }, [])


if (loading) return <div>Loading...</div>;  
if (error) return <div>Error: {error.message}</div>; 

const handelclick = () => {
  setOn(false);
};

  return (
    <div className='conv_bar'>
      <AddBar conv={conv} setConv={setConv} on={on} setOn={setOn} className='Search-bar'/>
      <div className='top'>
        <div className='center_top'>
          <h2>Chat</h2>
          <button className='add' onClick={handelclick}><Add/></button>
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
        {conv.length === 0 ? (
          <div className='empty'>
            <p >Add a person <br/>
            and start a conversation</p>
          </div>
        ) : (
          conv.map(user => (
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
