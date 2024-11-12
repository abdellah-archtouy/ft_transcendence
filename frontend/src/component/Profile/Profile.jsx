
import Baner from './Baner'
import React, { useEffect ,useState } from 'react';
import axios from 'axios';
import './profile.css';
// import { createContext } from 'react';
import { useNavigate } from "react-router-dom";
import Avatar from './Avatar';
import Joker from './Joker';
import Maestro from './Maestro';
import Downkeeper from './Downkeeper';
import The_emperor from './The_emperor';
import Thunder_Strike from './Thunder_Strike';
import PureComponent from './Chartline';
import dayjs from 'dayjs';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [banerImg, setBanerImg] = useState();
  const [avatarImg, setavatarImg] = useState();
  const [loading, setLoading] = useState(true);  
  const [errors, setErrors] = useState({});
  // const [achievement , setAchievement] = useState([]);
  const [achievement, setAchievement] = useState([]);  // Default to an empty array

  const navigate = useNavigate();

  const [chartData, setChartData] = useState([]);
  const [win , setWin] = useState([]);
  const [loss , setLoss] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.get(`http://${window.location.hostname}:8000/chat/user/data/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access}`,
          },
          withCredentials: true,
        });
    
        // console.log('Full Response:', response); 
    
       
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
        const response = await axios.get(`http://${window.location.hostname}:8000/chat/user/chart/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access}`,
          },
          withCredentials: true,
        });
    
        setWin(response.data.last_win_24_hours);
        setLoss(response.data.last_lose_24_hours);
        setChartData(response.data.last_win_24_hours);
        // console.log('Full Response win lose:', response);
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
              // refreh the page
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
  
  
  
  
  const [rateType, setRateType] = useState('wins'); // default to 'wins'
  const [rateTypet, setRateTypet] = useState('7day'); // default to 'wins'
  
  useEffect(() => {
    if (rateType === 'wins') {
      setChartData(win);
    } else {
      setChartData(loss);
    }
  }, [rateType]);
  
  const handleSelectChange = (event) => {
    setRateType(event.target.value);
  };
  const handleSelectChangetime = (event) => {
    setRateTypet(event.target.value);
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
              {userData.username ? userData.username : 'User'}
            </h1>
            <div className='online'></div>
          </div>
          <p className='bio'>{userData.bio}</p>
          <div className='win-rank-score'>
            <div>
              {userData.win}
              <p>Duels Won</p>
            </div>
            <div>
              #{userData.rank}
              <p>Ranking position</p>
            </div>
            <div>
              {userData.score}xp
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
                  <option value="7">last 7 days</option>
                  <option value="24">last 24 hour</option>
                </select>
            </div>
            <div className='chart '>
              <PureComponent chartData={chartData} par={rateType}/>
            </div>
         </div>
         <div className='achievment'>
           <h1>Achievement</h1>
           <div className='elements'>
              {
                achievement.map((ach, index) => (
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

export default Profile
