import { useEffect, useState, useRef } from "react";
import "./searchBar.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SearchBar = ({ onStateChange }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  function avatarUrl(name) {
    return `${apiUrl}/media/` + name;
  }
  const [users, setUsers] = useState([]);
  const [rows, setRows] = useState([]);

  const [userList, setUserList] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fadeout, setFadeout] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  function keypress(e) {
    if (e.key === "Escape") FadingOut();
  }

  function FadingOut() {
    setFadeout(true);
    setTimeout(() => {
      onStateChange(false);
    }, 400);
    document.removeEventListener("keydown", keypress);
  }

  function redirecUser(id) {
    setFadeout(true);
    setTimeout(() => {
      navigate(`/user/${id}`);
      onStateChange(false);
    }, 400);
    document.removeEventListener("keydown", keypress);
  }

  useEffect(() => {
    let filteredData = null;
    if (users && isNaN(searchTerm)) {
      filteredData = users.filter((user) =>
        user?.username.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
    }
    setRows(filteredData);
    if (!filteredData) setRows(users);
  }, [searchTerm, users, rows]);

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

        const response = await axios.get(`${apiUrl}/api/users/searchbar/`, {
          headers: {
            Authorization: `Bearer ${access}`,
          },
        });
        setUsers(response.data);
        setRows(response.data);
      } catch (error) {
        handleFetchError(error, fetchUserData);
      }
    };

    inputRef.current.focus();
    fetchUserData();
    document.addEventListener("keyup", keypress);
    return () => {
      document.removeEventListener("keyup", keypress);
    };
  }, []);

  return (
    <>
      <div
        className={`SearchBar ${fadeout ? "fadeout" : ""}`}
        onClick={FadingOut}
      ></div>
      <div className={`searchContent ${fadeout ? "fadeout" : ""}`}>
        <div className="search">
          <input
            type="text"
            className="input"
            placeholder="search"
            ref={inputRef}
            onChange={(input) => {
              setSearchTerm(input.target.value);
            }}
          />
          <button className="nav_search_submit">
            <img src="/search.svg" alt="" />
          </button>
        </div>
        <div className="search">
          <div className="users">
            {(!rows || !rows[0]?.username) && (
              <p className="noSearchResult">No Search Result</p>
            )}
            {rows?.map((user, index) => (
              <div className="user" key={index}>
                <Link
                  className="userInfos"
                  onClick={(e) => {
                    e.preventDefault();
                    redirecUser(user?.id);
                  }}
                >
                  <img src={avatarUrl(user?.avatar)} alt="" className="avatar" />
                  <span>{user?.username}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
