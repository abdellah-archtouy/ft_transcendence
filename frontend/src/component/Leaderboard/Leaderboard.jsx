import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import searchicon from "../../icons/search.svg";
import { useNavigate } from "react-router-dom";
import "./Leaderboard.css";

const apiUrl = process.env.REACT_APP_API_URL;

const Leaderboard = () => {
  const [rows, setRows] = useState([]);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  function avatarUrl(name) {
    return `${apiUrl}/media/` + name;
  }

  const navigate = useNavigate();
  const stableNavigate = useMemo(
    () =>
      (...args) =>
        navigate(...args),
    [navigate]
  );

  useEffect(() => {

    const handleFetchError = (error, retryFunction) => {
      if (error.response && error.response.status === 401) {
        const refresh = localStorage.getItem("refresh");
  
        if (refresh) {
          axios
            .post(`${apiUrl}/api/users/token/refresh/`, { refresh })
            .then((refreshResponse) => {
              const { access: newAccess } = refreshResponse.data;
              localStorage.setItem("access", newAccess);
              
              fetch(`${apiUrl}/api/users/profile/`, {
                headers: { Authorization: `Bearer ${newAccess}` }
              }).then(response => {
                if (response.ok) {
                  retryFunction();
                } else {
                  console.log("Error fetching user data after token refresh");
                  localStorage.removeItem("access");
                  localStorage.removeItem("refresh");
                  window.location.reload();
                  navigate("/");
                }
              });
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

    const fetchUserData = async () => {
      try {
        const access = localStorage.getItem("access");

        const response = await axios.get(
          `${apiUrl}/api/game/leaderboard`,
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );
        setData(response.data);
        setRows(response.data);
      } catch (error) {
        handleFetchError(error, fetchUserData);
      }
    };
    if (!data.length)
      fetchUserData();
  }, [stableNavigate, data]);

  const handleSelectClick = (event) => {
    const value = event.target.value;

    if (value === "by name") {
      // Sort rows by name
      const sortedRows = [...rows].sort((a, b) =>
        a.username.localeCompare(b.username)
      );
      setRows(sortedRows);
    } else if (value === "by rank") {
      // Sort rows by rank
      const sortedRows = [...rows].sort((a, b) => a.rank - b.rank);
      setRows(sortedRows);
    } else {
      // Default: no sorting
      setRows(data);
    }
  };

  const handleInputChange = (event) => {
    setSearch(event.target.value);
  };

  useEffect(() => {
    let filteredData = [...rows];
    setRows([]);
    if (rows && isNaN(search)) {
      filteredData = data.filter((user) =>
        user?.username.toLowerCase().startsWith(search.toLowerCase())
      );
    }
    setRows(filteredData);
    if (!search) setRows(data);
  }, [search, data]);

  return (
    <div className="Leaderboard-container">
      <h1 className="LeaderBoard-header">LeaderBoard</h1>
      <div className="full-board-list">
        <div className="leaderboard_search">
          <div className="Leaderboard-search-container">
            <input
              type="text"
              className="Leaderboard-search-bar"
              onChange={handleInputChange}
              placeholder="Search"
            />
            <img src={searchicon} alt="search" className="searchButton" />
          </div>
          <select className="Leaderboard-sort" onChange={handleSelectClick}>
            <option value="">Sort By</option>
            <option value="by rank">by rank</option>
            <option value="by name">by name</option>
          </select>
        </div>
        <div className="Leaderboard-users-list">
          <ul className="Leaderboard-list">
            <li className="Leaderboard-list-item">
              <div className="Leaderboard-list-item-user">
                <span>avatar</span>
              </div>
              <div className="Leaderboard-list-item-name">
                <span>name</span>
              </div>
              <div className="Leaderboard-list-item-rank">
                <span>#rank</span>
              </div>
              <div className="Leaderboard-list-item-score">
                <span>score</span>
              </div>
              <div className="Leaderboard-list-item-wins">
                <span>n of wins</span>
              </div>
              <div className="Leaderboard-list-item-link">
                <span></span>
              </div>
            </li>
            <div className="item-container">
              {rows.map((row, index) => (
                <li
                  key={index}
                  className={`Leaderboard-list-item`}
                  style={{
                    animationName: "fade-in",
                    animationDuration: `${(index + 1) * 0.5}s`,
                    animationTimingFunction: "ease-in-out",
                    animationFillMode: "forwards",
                  }}
                >
                  <div className="Leaderboard-list-item-user">
                    <img src={avatarUrl(row?.avatar)} alt="user" />
                  </div>
                  <div className="Leaderboard-list-item-name">
                    <span>{row?.username.substring(0, 5)}</span>
                  </div>
                  <div className="Leaderboard-list-item-rank">
                    <span>#{row?.rank}</span>
                  </div>
                  <div className="Leaderboard-list-item-score">
                    <span>{row?.score}xp</span>
                  </div>
                  <div className="Leaderboard-list-item-wins">
                    <span>{row?.matches_won}</span>
                  </div>
                  <div className="Leaderboard-list-item-link">
                    <button
                      onClick={() => stableNavigate(row?.link)}
                      style={{
                        all: "unset",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="LeaderBoard-LinkIcon"
                      >
                        <path d="M352 0c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9L370.7 96 201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L416 141.3l41.4 41.4c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-128c0-17.7-14.3-32-32-32L352 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
