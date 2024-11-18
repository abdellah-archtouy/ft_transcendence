
import Baner from './Baner'
import React, { useEffect ,useState } from 'react';
import axios from 'axios';
import './profile.css';

import { useNavigate , useParams } from "react-router-dom";
import Avatar from './Avatar';
import Joker from './Joker';
import Maestro from './Maestro';
import Downkeeper from './Downkeeper';
import The_emperor from './The_emperor';
import Thunder_Strike from './Thunder_Strike';
import PureComponent from './Chartline';
import dayjs from 'dayjs';

const OthersProfile = () => {
  const [userData, setUserData] = useState(null);
  const [banerImg, setBanerImg] = useState();
  const [avatarImg, setavatarImg] = useState();
  const [loading, setLoading] = useState(true);  
  const [errors, setErrors] = useState({});
  const [achievement, setAchievement] = useState([]);

  const navigate = useNavigate();
  const { username } = useParams();

  const [chartData, setChartData] = useState([]);
  const [win24 , setWin24] = useState([]);
  const [loss24 , setLoss24] = useState([]);
  const [win7 , setWin7] = useState([]);
  const [loss7 , setLoss7] = useState([]);
  const [friends, setFriends] = useState([]);
  const [time, setTime] = useState("hour");
  const apiUrl = process.env.REACT_APP_API_URL;



  useEffect(() => {
    const fetchData = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.get(`http://${window.location.hostname}:8000/chat/ouser/data/${username}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access}`,
          },
          withCredentials: true,
        });
    
    
       
        setUserData(response.data); 
        setBanerImg(response.data.cover); 
        setavatarImg(response.data.avatar); 
        setAchievement(response.data.achievement_images);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrors(errors); 
        handleFetchError(error);
      } finally {
        setLoading(false);
      }
    };

    const fetcwin_loss = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.get(`http://${window.location.hostname}:8000/chat/ouser/chart/${username}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access}`,
          },
          withCredentials: true,
        });
    
        setWin24(response.data.last_win_24_hours);
        setLoss24(response.data.last_lose_24_hours);
        setWin7(response.data.this_week_win_summary);
        setLoss7(response.data.this_week_lose_summary);
        fetchSuggestedFriends();
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrors(errors); 
        handleFetchError(error);
      } finally {
        setLoading(false);
      }
    };

    
    const handleFetchError = (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          const refresh = localStorage.getItem("refresh");
          console.log(refresh);
          if (refresh) {
            axios
            .post(`http://${window.location.hostname}:8000/api/token/refresh/`, { refresh })
            .then((refreshResponse) => {
              const { access: newAccess } = refreshResponse.data;
              localStorage.setItem("access", newAccess);
              fetchData(); // Retry fetching user data
              fetcwin_loss();
            })
            .catch((refreshError) => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              console.log("you have captured the error");
              setErrors({ general: "Session expired. Please log in again." });
              window.location.reload();
              navigate("/");
            });
          } else {
            setErrors({
              general: "No refresh token available. Please log in.",
            });
          }
        } else {
          setErrors({ general: "Error fetching data. Please try again." });
        }
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    };
    
    fetchData();
    fetcwin_loss();
  }, [navigate]);
  
  const [rateType, setRateType] = useState('wins');
  const [rateTypet, setRateTypet] = useState('7'); 
  
  useEffect(() => {
    if (rateTypet === '7') {
        setTime("day");
        if (rateType === 'wins') {
          setChartData(win7);
        } else {
          setChartData(loss7);
        }
    } else {  
        setTime("hour");
        if (rateType === 'wins') {
          console.log('win24:', win24);
          setChartData(win24);
        } else {
          console.log('loss24:', loss24);
          setChartData(loss24);
        }
      }
  }, [rateType, rateTypet, win24, loss24, win7, loss7]);
  
  const handleSelectChange = (event) => {
    setRateType(event.target.value);
  };
  const handleSelectChangetime = (event) => {
    setRateTypet(event.target.value);
  };

  const onmessagecklick = async () => {
        const access = localStorage.getItem("access");
        const response = await axios.get(`http://${window.location.hostname}:8000/chat/ouser/getconv/${username}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access}`,
          },
          withCredentials: true,
        });

        console.log('response:', response.data.id);

    navigate(`/chat?username=${username}&convid=${response.data.id}`);
  };

  const fetchSuggestedFriends = async () => {
    try {
      const access = localStorage.getItem("access");
      const response = await axios.get(`${apiUrl}/api/users/suggest_friends/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      setFriends(response.data);
    } catch (error) {
      handleFetchError(error, fetchSuggestedFriends);
    }
  };

  const handleFetchError = (error, retryFunction) => {
    if (error.response && error.response.status === 401) {
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        axios
          .post(`http://${window.location.hostname}:8000/api/token/refresh/`, { refresh })
          .then((refreshResponse) => {
            const { access: newAccess } = refreshResponse.data;
            localStorage.setItem("access", newAccess);
            retryFunction(); // Retry the original function
          })
          .catch((refreshError) => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            setErrors({ general: "Session expired. Please log in again." });
            window.location.reload();
            navigate("/");
          });
      } else {
        setErrors({ general: "No refresh token available. Please log in." });
      }
    } else {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      const access = localStorage.getItem("access");
      await axios.post(
        `http://${window.location.hostname}:8000/api/users/add_friend/`,
        { friend_id: friendId },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setFriends(
        friends.map((friend) =>
          friend.id === friendId ? { ...friend, added: true } : friend
        )
      );
    } catch (error) {
      console.log('friends:', error);
      handleFetchError(error, () => handleAddFriend(friendId));
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <div className='profile_user'>
      {/* Profile */}
      <Baner banerImg={banerImg}></Baner>
      <div className='after-avatar'></div>
      <Avatar avatarImg={avatarImg} ></Avatar>
      <div className='userinfo'>
          <div className='name-status'>
            <h1 className='username'>
              {userData?.username ? userData.username : 'User'}
            </h1>
            <div className='online off'></div>
          </div>
          <div className='add-friend-message'>
            <button onClick={onmessagecklick}>Message</button>
            <button onClick={handleAddFriend}>Add Friend</button>
          </div>
          <p className='bio'>{userData?.bio}</p>
          <div className='win-rank-score'>
            <div>
              {userData?.win}
              <p>Duels Won</p>
            </div>
            <div>
              #{userData?.rank}
              <p>Ranking position</p>
            </div>
            <div>
              {userData?.score}xp
              <p>Score</p>
            </div>
          </div>
      </div>
      <div className='analytics-achievment'>
         <div className='analytics'>
            <h1 >Summary</h1>
            <div className='select-div'>
                <select className='select' onChange={handleSelectChange} value={rateType}>
                  <option value="wins">Wins</option>
                  <option value="lose">Lost</option>
                </select>
                <select className='select' onChange={handleSelectChangetime} value={rateTypet}>
                  <option value="7">This Week</option>
                  <option value="24">This day</option>
                </select>
            </div>
            <div className='chart '>
              <PureComponent chartData={chartData} par1={rateType} par2={time}/>
            </div>
         </div>
         <div className='achievment'>
           <h1>Achievement</h1>
           <div className='elements'>
              {
                achievement?.map((ach, index) => (
                  <div className='element' key={index}>
                    { ach === 'Joker' ? <Joker></Joker> : ach === 'Maestro' ? <Maestro></Maestro> : ach === 'Downkeeper' ? <Downkeeper></Downkeeper> 
                    : ach === 'The_emperor' ? <The_emperor/> : <Thunder_Strike/>}
                </div>
              ))
            }
          </div>
         </div>
      </div>
    </div>
  )
}

export default OthersProfile
