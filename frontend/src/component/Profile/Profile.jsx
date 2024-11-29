
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
import LoadingPage from '../loadingPage/loadingPage';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [banerImg, setBanerImg] = useState();
  const [avatarImg, setavatarImg] = useState();
  const [loading, setLoading] = useState(true);  
  const [errors, setErrors] = useState({});
  // const [achievement , setAchievement] = useState([]);
  const [achievement, setAchievement] = useState([]);  // Default to an empty array
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [chartData, setChartData] = useState([]);
  const [win24 , setWin24] = useState([]);
  const [loss24 , setLoss24] = useState([]);
  const [win7 , setWin7] = useState([]);
  const [loss7 , setLoss7] = useState([]);
  const [time, setTime] = useState("hour");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.get(`${apiUrl}/chat/user/data/`, {
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
        handleFetchError(error, fetchData);
      } finally {
        setLoading(false);
      }
    };

    const fetcwin_loss = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.get(`${apiUrl}/chat/user/chart/`, {
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
        // setChartData(response.data.last_win_24_hours);
        // console.log('Full Response win lose:', response);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrors(errors); 
        handleFetchError(error, fetcwin_loss);
      } finally {
        setLoading(false);
      }
    };

    
    const handleFetchError = (error, retryFunction) => {
      if (error.response) {
        if (error.response.status === 401) {
          const refresh = localStorage.getItem("refresh");

          if (refresh) {
            axios
              .post(`${apiUrl}/api/token/refresh/`, { refresh })
              .then((refreshResponse) => {
                const { access: newAccess } = refreshResponse.data;
                localStorage.setItem("access", newAccess);
                retryFunction() // Retry fetching user data
              })
              .catch((refreshError) => {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                console.log("you have captured the error");
                navigate("/");
                console.log({
                  general: "Session expired. Please log in again.",
                });
              });
          } else {
            console.log({
              general: "No refresh token available. Please log in.",
            });
          }
        } else {
          console.log({ general: "Error fetching data. Please try again." });
        }
      } else {
        console.log({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    };
    
    fetchData();
    fetcwin_loss();
  }, [navigate]);
  
  const [rateType, setRateType] = useState('wins'); // default to 'wins'
  const [rateTypet, setRateTypet] = useState('7'); // default to 'wins'
  
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

  if (loading) {
    return <LoadingPage />;
  }
  return (
      //  <OthersProfile/>
    <div className='profile_user'>
      {/* Profile */}
      <Baner banerImg={banerImg}></Baner>
      <div className='after-avatar'></div>
      <Avatar avatarImg={avatarImg} ></Avatar>
      <div className='userinfo'>
          <h1 className='username'>
            {userData?.username ? userData.username : 'User'}
          </h1>
          <p className='bio' style={!userData?.bio ? {display:"none"} : {}}>{userData?.bio}</p>
          <div className='win-rank-score'>
            <div>
              <h4>
                {userData?.win}
              </h4>
              <p>Duels Won</p>
            </div>
            <div>
              <h4>
                #{userData?.rank}
              </h4>
              <p>Ranking position</p>
            </div>
            <div>
              <h4>
                {userData?.score}xp
              </h4>
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
                  <option value="7">Last 7 days</option>
                  <option value="24">Last 24 hours</option>
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
