// import logo from './logo.svg';
import React, { useEffect ,useState } from 'react';
import './App.css';
import Topbar from './Topbar';
import Conv_bar from './Conv_bar';
import Chat from './chat';

function App() {
  const [className, setClassName] = useState(); 
  const [userData, setUserData] = useState(null);

  useEffect(() => {
      const fetchData = async () => {
          const token = document.cookie.split('=')[1];

          try {
              const response = await fetch('http://127.0.0.1:8000/api/user/', {
                  method: 'GET',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                  }
              });
              const data = await response.json();
              console.log('data:', data);
              console.log('token:cacadcac');
              setUserData(data);
          } catch (error) {
              console.error('Error fetching user data:', error);
          }
      };

      fetchData();
  }, []);

  if (!userData) {
    return <div>Loading...</div>;
  }
  console.log('userData:', userData.username);
  console.log('habhkcdacda');
  return (
    <div className="App">
      {/* <Topbar/> */}
      <div className='chat_container'>
        <Conv_bar userData={userData}/>
        <Chat data={userData}/>
      </div>
    </div>
  );
}

export default App;
