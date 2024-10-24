import { useEffect, useState, useRef } from "react";
import "./searchBar.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const SearchBar = ({ onStateChange }) => {
  function avatarUrl(name) {
    return `http://${window.location.hostname}:8000/media/` + name;
  }
  const [users, setUsers] = useState([]);

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
  
  function redirecUser(username) {
    setFadeout(true);
    setTimeout(() => {
      navigate(`/user/${username}`)
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
    setUserList(filteredData);
  }, [searchTerm, users]);

  useEffect(() => {
    const handleFetchError = (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          const refresh = localStorage.getItem("refresh");

          if (refresh) {
            axios
              .post("http://localhost:8000/api/token/refresh/", { refresh })
              .then((refreshResponse) => {
                const { access: newAccess } = refreshResponse.data;
                localStorage.setItem("access", newAccess);
                fetchUserData(); // Retry fetching user data
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

    const fetchUserData = async () => {
      try {
        const access = localStorage.getItem("access");

        const response = await axios.get(
          "http://localhost:8000/api/searchbar/",
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        handleFetchError(error);
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
            {(!userList || !userList[0]?.username) && (
              <p className="noSearchResult">No Search Result</p>
            )}
            {userList?.map((user, index) => (
              <div className="user" key={index}>
                <Link
                  className="userInfos"
                  to={`/user/${user.username}`}
                  onClick={(e) => {
                    e.preventDefault();
                    redirecUser(user.username)
                  }}
                >
                  <img src={avatarUrl(user.avatar)} alt="" className="avatar" />
                  <span>{user.username}</span>
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
