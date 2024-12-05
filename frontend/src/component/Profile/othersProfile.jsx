import Baner from "./Baner";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";

import { useNavigate, useParams } from "react-router-dom";
import Avatar from "./Avatar";
import Joker from "./Joker";
import Maestro from "./Maestro";
import Downkeeper from "./Downkeeper";
import The_emperor from "./The_emperor";
import Thunder_Strike from "./Thunder_Strike";
import PureComponent from "./Chartline";
import { useError } from "../../App";
import LoadingPage from "../loadingPage/loadingPage";

const hostName = process.env.REACT_APP_API_HOSTNAME;

const OthersProfile = () => {
  const [userData, setUserData] = useState(null);
  const [banerImg, setBanerImg] = useState();
  const [avatarImg, setavatarImg] = useState();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(false);
  const [errors, setErrors] = useState({});
  const [achievement, setAchievement] = useState([]);

  const navigate = useNavigate();
  const { username } = useParams();
  const [isNotFriend, setIsNotFriend] = useState(true);
  const [isFriend, setIsFriend] = useState(true);

  const [chartData, setChartData] = useState([]);
  const [win24, setWin24] = useState([]);
  const [loss24, setLoss24] = useState([]);
  const [win7, setWin7] = useState([]);
  const [loss7, setLoss7] = useState([]);
  const [friends, setFriends] = useState([]);
  const [time, setTime] = useState("hour");
  const { setError, statusSocket } = useError();

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const access = localStorage.getItem("access");
        const response2 = await axios.get(`${apiUrl}/chat/user/data/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          withCredentials: true,
        });
        const response = await axios.get(
          `${apiUrl}/chat/ouser/data/${username}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access}`,
            },
            withCredentials: true,
          }
        );

        if (response.data.id === response2.data.id) {
          navigate("/profile");
          return;
        }
        setUserData(response.data);
        setBanerImg(response.data.cover);
        setavatarImg(response.data.avatar);
        setAchievement(response.data.achievement_images);
      } catch (error) {
        if (error.status === 400) {
          setError(error.response.data.error);
          navigate(-1);
        }
        handleFetchError(error, () => fetchData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  useEffect(() => {
    const fetcwin_loss = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.get(
          `${apiUrl}/chat/ouser/chart/${username}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access}`,
            },
            withCredentials: true,
          }
        );

        setWin24(response.data.last_win_24_hours);
        setLoss24(response.data.last_lose_24_hours);
        setWin7(response.data.this_week_win_summary);
        setLoss7(response.data.this_week_lose_summary);
        fetchSuggestedFriends();
      } catch (error) {
        setErrors(errors);
        handleFetchError(error, () => fetcwin_loss());
      } finally {
        setLoading(false);
      }
    };
    if (userData) {
      fetcwin_loss();
      setStatus(userData?.stat);
    }
  }, [userData]);

  useEffect(() => {
    const handleStatusUpdate = (event) => {
      try {
        const data = JSON.parse(event.data); // Parse the incoming message
        if (data?.username === userData?.username) {
          setStatus(() => data?.stat); // Update the status if the username matches
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        setError("Failed to update status.");
      }
    };

    if (statusSocket) {
      statusSocket.addEventListener("message", handleStatusUpdate);
    }

    return () => {
      if (statusSocket) {
        statusSocket.removeEventListener("message", handleStatusUpdate);
      }
    };
  }, [statusSocket, userData, setError]);

  const [rateType, setRateType] = useState("wins");
  const [rateTypet, setRateTypet] = useState("7");

  useEffect(() => {
    if (rateTypet === "7") {
      setTime("day");
      if (rateType === "wins") {
        setChartData(win7);
      } else {
        setChartData(loss7);
      }
    } else {
      setTime("hour");
      if (rateType === "wins") {
        setChartData(win24);
      } else {
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
    try {
      const access = localStorage.getItem("access");
      const response = await axios.get(
        `${apiUrl}/chat/ouser/getconv/${username}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          withCredentials: true,
        }
      );
      navigate(`/chat?username=${username}&convid=${response.data.id}`);
    } catch (error) {
      setErrors(errors);
      handleFetchError(error, () => onmessagecklick());
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    const fetchfriendreq = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.get(
          `${apiUrl}/chat/ouser/friendreq/${username}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access}`,
            },
            withCredentials: true,
          }
        );
        if (response.data.accept === false) {
          setIsNotFriend(false);
          setIsFriend(false);
        } else if (response.data.request === true) {
          setIsNotFriend(true);
          setIsFriend(false);
        }
      } catch (error) {
        if (error.response.status === 404) {
          setIsNotFriend(true);
          setIsFriend(false);
        } else handleFetchError(error, () => fetchfriendreq());
      } finally {
        setLoading(false);
      }
    };
    fetchfriendreq();
  }, [friends]);

  const handleFetchError = (error, retryFunction) => {
    if (error.response && error.response.status === 401) {
      const refresh = localStorage.getItem("refresh");

      if (refresh) {
        axios
          .post(`${apiUrl}/api/token/refresh/`, { refresh })
          .then((refreshResponse) => {
            const { access: newAccess } = refreshResponse.data;
            localStorage.setItem("access", newAccess);
            retryFunction();
          })
          .catch((refreshError) => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            console.log({ general: "Session expired. Please log in again." });
            window.location.reload();
            navigate("/");
          });
        } else {
          console.log({ general: "No refresh token available. Please log in." });
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.reload();
          navigate("/");
      }
    } else {
      console.log({ general: "An unexpected error occurred. Please try again." });
    }
  };

  const handleAddFriend = async (friendId) => {
    try {
      const access = localStorage.getItem("access");
      await axios.post(
        `${apiUrl}/api/users/add_friend/`,
        { friend_id: friendId },
        { headers: { Authorization: `Bearer ${access}` } }
      );
      setFriends(
        friends.map((friend) =>
          friend.id === friendId ? { ...friend, added: true } : friend
        )
      );
    } catch (error) {
      handleFetchError(error, () => handleAddFriend(friendId));
    }
  };

  if (!userData) {
    return <LoadingPage />;
  }

  if (loading) {
    return <LoadingPage />;
  }
  return (
    <div className="profile_user" key={username}>
      <Baner banerImg={banerImg}></Baner>
      <div className="after-avatar"></div>
      <Avatar avatarImg={avatarImg}></Avatar>
      <div className="userinfo">
        <div className="user-status">
          <div className="username-container">
            <h1 className="username">
              {userData?.username ? userData.username : "User"}
            </h1>
          </div>
          <div
            className="status"
            style={
              status === true
                ? { backgroundColor: "#62A460" }
                : { backgroundColor: "#A46060" }
            }
          ></div>
        </div>
        <div className="add-friend-message">
          {isFriend ? (
            <button className="" onClick={onmessagecklick}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z" />
              </svg>
              Message
            </button>
          ) : (
            <>
              {isNotFriend === false ? (
                <div className="request">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z" />
                  </svg>
                </div>
              ) : (
                <button
                  className=""
                  onClick={() => handleAddFriend(userData.id)}
                >
                  Add Friend
                </button>
              )}
            </>
          )}
        </div>
        <p className="bio" style={!userData?.bio ? { display: "none" } : {}}>
          {userData?.bio}
        </p>
        <div className="win-rank-score">
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
      <div className="analytics-achievment">
        <div className="analytics">
          <h1>Summary</h1>
          <div className="select-div">
            <select
              className="select"
              onChange={handleSelectChange}
              value={rateType}
            >
              <option value="wins">Wins</option>
              <option value="lose">Lost</option>
            </select>
            <select
              className="select"
              onChange={handleSelectChangetime}
              value={rateTypet}
            >
              <option value="7">This Week</option>
              <option value="24">This day</option>
            </select>
          </div>
          <div className="chart ">
            <PureComponent chartData={chartData} par1={rateType} par2={time} />
          </div>
        </div>
        <div className="achievment">
          <h1>Achievement</h1>
          <div className="elements">
            {achievement?.map((ach, index) => (
              <div className="element" key={index}>
                {ach === "Joker" ? (
                  <Joker></Joker>
                ) : ach === "Maestro" ? (
                  <Maestro></Maestro>
                ) : ach === "Downkeeper" ? (
                  <Downkeeper></Downkeeper>
                ) : ach === "The_emperor" ? (
                  <The_emperor />
                ) : (
                  <Thunder_Strike />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OthersProfile;
