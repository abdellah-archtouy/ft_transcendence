import React, {useMemo} from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import searchicon from "../../icons/search.svg";
import { useNavigate } from "react-router-dom";
import "./Leaderboard.css";

const apiUrl = process.env.REACT_APP_API_HOSTNAME;

const Leaderboard = () => {
  const [rows, setRows] = useState([]);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  
  function avatarUrl(name) {
    return `http://${apiUrl}:8000/media/` + name;
  }

  const navigate = useNavigate();
  const stableNavigate = useMemo(
    () =>
      (...args) =>
        navigate(...args),
    [navigate]
  );

  useEffect(() => {
    /**************************************/
    /*     hna  remote game katbda        */
    /**************************************/

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

    const fetchUserData = async () => {
      try {
        const access = localStorage.getItem("access");

        const response = await axios.get(
          `http://${apiUrl}:8000/game/leaderboard`,
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
  }, [search, data, rows]);

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
                      {index === 0 && (
                        <svg
                        width="39"
                        height="37"
                        viewBox="0 0 39 37"
                        fill="#B49E5E"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M24.1977 10.6652C25.0813 10.6541 25.9428 10.1908 26.4276 9.3793C27.1769 8.12515 26.7691 6.50307 25.5163 5.75455C24.2635 5.00602 22.6418 5.41555 21.8925 6.6697C21.4043 7.48688 21.4079 8.45933 21.8168 9.24269L14.6829 13.8054C13.55 14.53 12.0358 14.0257 11.5651 12.7665L8.93159 5.70249C9.4422 5.49162 9.89368 5.12221 10.1988 4.61147C10.9482 3.35733 10.5403 1.73525 9.28752 0.986723C8.0347 0.238197 6.41305 0.647729 5.66373 1.90188C4.91442 3.15603 5.32223 4.7781 6.57505 5.52663C6.58639 5.5334 6.6034 5.54356 6.61473 5.55034L0.681485 21.3649C-0.0374641 23.2763 0.712079 25.4337 2.46943 26.4836L18.1836 35.8724C19.9352 36.919 22.1868 36.5624 23.5384 35.0212L34.653 22.3024C34.6643 22.3092 34.6813 22.3194 34.6927 22.3261C35.9455 23.0746 37.5671 22.6651 38.3165 21.411C39.0658 20.1568 38.658 18.5347 37.4051 17.7862C36.1523 17.0377 34.5307 17.4472 33.7814 18.7014C33.4762 19.2121 33.3649 19.7847 33.4211 20.3343L25.9527 21.3627C24.6207 21.5449 23.4592 20.4504 23.5604 19.1094L24.1977 10.6652Z" />
                      </svg>
                    )}
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
