import React, { useState, useEffect } from "react";
import Carousel from "./Carousel.jsx";
import Stats from "./Stats.jsx";
import Top_5 from "./Top-5.jsx";
import "./styles/Home.css";
import "./styles/Top-5.css";
import "./styles/Suggestions.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [friends, setFriends] = useState([]);
  const [top5, setTop5] = useState([]);
  const [history, setHistory] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchUserData = async () => {
    try {
      const access = localStorage.getItem("access");
      const response = await axios.get(`${apiUrl}/api/users/profile/`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      setUser(response.data);
      fetchSuggestedFriends();
      fetchTop5();
    } catch (error) {
      handleFetchError(error, fetchUserData);
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

  const fetchTop5 = async () => {
    try {
      const access = localStorage.getItem("access");
      const response = await axios.get(`${apiUrl}/game/top5`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      setTop5(response.data);
      const response1 = await axios.get(`${apiUrl}/game/history`, {
        headers: { Authorization: `Bearer ${access}` },
      });
      setHistory(response1.data);
    } catch (error) {
      handleFetchError(error, fetchTop5);
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

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSeeMore = (e) => {
    e.preventDefault();
    setShowAll(!showAll);
  };

  const matchesToDisplay = showAll ? history : history.slice(0, 3);

  return (
    <div className="home-div">
      <div className="home-dive-welcome">
        <div className="home-div-welcome-text">
          {user ? (
            <>
              <h2 className="home-div-welcome-text-name">
                Hello,{" "}
                {user.username.length > 9
                  ? `${user.username.substring(0, 9)}...`
                  : user.username}
              </h2>
              <p>Welcome back to our game</p>
            </>
          ) : (
            <p>Loading...</p>
          )}
          <button
            className="home-dive-welcome-btn"
            onClick={() => navigate("/game")}
          >
            Play now
          </button>
        </div>
      </div>
      <div className="suggestions">
        <div className="header_element">
          <h2>Suggested for you</h2>
        </div>
        <div className="slide-elements">
          <Carousel friends={friends} handleAddFriend={handleAddFriend} />
        </div>
      </div>
      <div className="stats">
        <div className="last-matches">
          <div className="last-matches-header">
            <h2>Last matches</h2>
            <div>
              <a href="#" onClick={handleSeeMore} className="see-more">
                {showAll ? "see less" : "see more"}
              </a>
            </div>
          </div>
          <div className="last-matches-stats">
            <Stats data={matchesToDisplay} />
          </div>
        </div>
        <div className="top-5">
          <div className="top-5-header">
            <h2>Top 5</h2>
            <div>
              <a
                href="#"
                onClick={() => {
                  navigate("/leaderboard");
                }}
              >
                see more
              </a>
            </div>
          </div>
          <div className="top-5-stats">
            <Top_5 data={top5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;