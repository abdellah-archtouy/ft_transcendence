import React from 'react'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./allusers.css";


const Leaderboard = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_HOSTNAME;
  const [rows, setRows] = useState([]);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");


  function avatarUrl(name) {
    // console.log(name);
    return `http://${apiUrl}:8000/media/` + name;
  }

  useEffect(() => {
    /**************************************/
    /*     hna  remote game katbda        */
    /**************************************/

    const handleFetchError = (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          const refresh = localStorage.getItem("refresh");

          if (refresh) {
            axios
              .post(`${apiUrl}/api/token/refresh/`, { refresh })
              .then((refreshResponse) => {
                const { access: newAccess } = refreshResponse.data;
                localStorage.setItem("access", newAccess);
                fetchUserData(); // Retry fetching user data
              })
              .catch((refreshError) => {
                localStorage.removeItem("access");
                localStorage.removeItem("refresh");
                console.log("you have captured the error");
                console.log({ general: "Session expired. Please log in again." });
                // refreh the page
                window.location.reload();
                navigate("/");
              });
          } else {
            console.log({ general: 'No refresh token available. Please log in.' });
          }
        } else {
          console.log({ general: 'Error fetching data. Please try again.' });
        }
      } else {
        console.log({ general: 'An unexpected error occurred. Please try again.' });
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
        handleFetchError(error);
      }
    };

    fetchUserData();
  }, []);

  const handleSelectClick = (event) => {
    const value = event.target.value;

    if (value === "by name") {
      // Sort rows by name
      const sortedRows = [...rows].sort((a, b) => a.username.localeCompare(b.username));
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
    console.log(event.target.value);
  };

  useEffect(() => {
    console.log(search);
  }, [search])

  return (
    <div className="leaderboard-container">
      <div className="full-board-list">
      <div className="leaderboard_search">
        <input type="text" className="Leaderboard-search-bar" onChange={handleInputChange}/>
        <select className="Leaderboard-sort" onChange={handleSelectClick}>
            <option value="">Sort By</option>
            <option value="by rank" >by rank</option>
            <option value="by name" >by name</option>
        </select>
      </div>
      <div className="Leaderboard-users-list">
        <ul className="Leaderboard-list">
          <li className="Leaderboard-list-item">
            <div className="Leaderboard-list-item-user">
              <p>avatar</p>
            </div>
            <div className="Leaderboard-list-item-name">
              <p>name</p>
            </div>
            <div className="Leaderboard-list-item-rank">
              <p>#rank</p>
            </div>
            <div className="Leaderboard-list-item-score">
              <p>score</p>
            </div>
            <div className="Leaderboard-list-item-wins">
              <p>n of wins</p>
            </div>
            <div className="Leaderboard-list-item-link">
              <p></p>
            </div>
          </li>
          <div className="item-container">

          {rows.map((row, index) => (
            <li key={index} className="Leaderboard-list-item">
              <div className="Leaderboard-list-item-user">
                <img src={avatarUrl(row.avatar)} alt="user" />
              </div>
              <div className="Leaderboard-list-item-name">
                <p>{row.username.substring(0, 9).toUpperCase()}</p>
              </div>
              <div className="Leaderboard-list-item-rank">
                <p>#{row.rank}</p>
              </div>
              <div className="Leaderboard-list-item-score">
                <p>{row.score}xp</p>
              </div>
              <div className="Leaderboard-list-item-wins">
                <p>{row.matches_won}</p>
              </div>
              <div className="Leaderboard-list-item-link">
                <a href="">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                    >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                  </svg>
                </a>
              </div>
            </li>
          ))}
          </div>
        </ul>
      </div>
    </div>
    </div>
  )
}

export default Leaderboard
