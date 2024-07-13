import { useEffect, useState } from "react";
import "./searchBar.css";

const SearchBar = ({ onStateChange }) => {
  const [users, setUsers] = useState([
    {
      id: 1,
      username: "Talal",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      online: 1,
    },
    {
      id: 2,
      username: "Bele",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      online: 0,
    },
    {
      id: 1,
      username: "ayman",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      online: 1,
    },
    {
      id: 2,
      username: "mohamed",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      online: 0,
    },
    {
      id: 1,
      username: "Jake",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      online: 1,
    },
    {
      id: 2,
      username: "GUTS",
      avatar: "https://randomuser.me/api/portraits/women/2.jpg",
      online: 0,
    },
    {
      id: 1,
      username: "7amid",
      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
      online: 1,
    },
  ]);

  const [userList, setUserList] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fadeout, setFadeout] = useState(false);

  function FadingOut() {
    setFadeout(true);
    setTimeout(() => {
      onStateChange(false);
    }, 400);
    document.removeEventListener("keydown", keypress);
  }

  function keypress(e) {
    if (e.key === "Escape") FadingOut();
  }

  useEffect(() => {
    let filteredData = null;
    if (users && isNaN(searchTerm)) {
      filteredData = users.filter((user) =>
        user?.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setUserList(filteredData);
  }, [searchTerm, users]);

  useEffect(() => {
    document.addEventListener("keyup", keypress);
  });

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
            onChange={(input) => {
              setSearchTerm(input.target.value);
            }}
          />
          <button className="nav_search_submit"><img src="/search.svg" alt="" /></button>
        </div>
        <div className="search">
          <div className="users">
            {(!userList || !userList[0]?.username) && (
              <p className="noSearchResult">No Search Result</p>
            )}
            {userList?.map((user, index) => (
              <div className="user" key={index}>
                <div className="userInfos">
                  <img src={user.avatar} alt="" className="avatar" />
                  <span>{user.username}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
