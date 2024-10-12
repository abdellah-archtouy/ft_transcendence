import React, { useState, useEffect } from 'react';
import Carousel from './Carousel.jsx';
import Stats from './Stats.jsx';
import Top_5 from './Top-5.jsx';
import './styles/Home.css';
import './styles/Top-5.css';
import './styles/Suggestions.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const Home = () => {
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const access = localStorage.getItem('access');

        const response = await axios.get('http://localhost:8000/api/users/profile/', {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        console.log(response.data);
        setUser(response.data);
        fetchSuggestedFriends(); // Fetch friends after getting user data

      } catch (error) {
        handleFetchError(error);
      }
    };

    const fetchSuggestedFriends = async () => {
      try {
        const access = localStorage.getItem('access');

        const response = await axios.get('http://localhost:8000/api/users/suggest_friends/', {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        
        setFriends(response.data); // Set the suggested friends

      } catch (error) {
        handleFetchError(error);
      }
    };

    const handleFetchError = (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          const refresh = localStorage.getItem('refresh');

          if (refresh) {
            axios.post('http://localhost:8000/api/token/refresh/', { refresh })
              .then(refreshResponse => {
                const { access: newAccess } = refreshResponse.data;
                localStorage.setItem('access', newAccess);
                fetchUserData(); // Retry fetching user data
              })
              .catch(refreshError => {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');
                console.log("you have captured the error");
                setErrors({ general: 'Session expired. Please log in again.' });
              });
          } else {
            setErrors({ general: 'No refresh token available. Please log in.' });
          }
        } else {
          setErrors({ general: 'Error fetching data. Please try again.' });
        }
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    };

    fetchUserData(); // Initial fetch for user data
  }, []);


  let handleAddFriend = () => {
    console.log('Friend added');
  }


  return (
    <div className='home-div'>
      <div className="home-dive-welcome">
        {user ? (
                    <>
                        <h2>Hello, {user.username}</h2>
                        <p>Welcome back to our game</p>
                    </>
                ) : (
                    <p>Loading...</p>
                )}
        <button className='home-dive-welcome-btn' onClick={() => navigate('/game')}>Play now</button>
      </div>
      <div className="suggestions">
        <div className='header_element'>
          <h2>Suggested for you</h2>
        </div>
        <div className="slide-elements">
          <Carousel friends={friends} handleAddFriend={handleAddFriend} />
        </div>
      </div>
      {/* <div className="stats">
        <div className="last-matches">
          <div className='last-matches-header'>
            <h2>Last Three matches</h2>
            <div>
              <a href="">see more</a>
            </div>
          </div>
          <div className="last-matches-stats">
            <Stats />
          </div>
        </div>
        <div className="top-5">
          <div className='top-5-header'>
            <h2>Top 5</h2>
            <div>
              <a href="">see more</a>
            </div>
          </div>
          <div className="top-5-stats">
            <Top_5 />
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Home;