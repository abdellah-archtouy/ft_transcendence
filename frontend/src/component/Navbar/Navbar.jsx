import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import logo from "../../icons/logo.svg";
import jarass from "../../icons/jarass.svg";
import searchicon from "../../icons/search.svg";
import burgerMenu from "../../icons/navicons/burgerMenu.svg";
import React, { useEffect, useState } from "react";
import "./navbar.css";
import SearchBar from "./searchBar";

const Navbar = () => {
  const [activeElement, setActiveElement] = useState(null);
  const [search, setSearch] = useState(false);
  const [navDisplay, setNavDisplay] = useState(true);
  const location = useLocation();

  const array = [
    { index: 0, path: "/", activeElement: "Home" },
    { index: 1, path: "/game", activeElement: "Game" },
    { index: 2, path: "/chat", activeElement: "Chat" },
    { index: 3, path: "/leaderboard", activeElement: "Leaderboard" },
    { index: 4, path: "/setting", activeElement: "Setting" },
    { index: 5, path: "/profile", activeElement: "Profile" },
  ];

  const handleClick = (element, index) => {
    setActiveElement(element);
    localStorage.setItem("activeElement", element);

    const navItems = document.querySelectorAll(".nav ul li");
    const itemOffsetLeft = navItems[index].offsetLeft;
    const itemOffsetTop = navItems[index].offsetTop;
    const coloredDiv = document.querySelector(".items");
    coloredDiv.style.transform = `translateX(${
      itemOffsetLeft - coloredDiv.offsetLeft
    }px) translateY(${itemOffsetTop - coloredDiv.offsetTop}px)`;
    coloredDiv.style.transition = `transform 0.3s ease-in-out`;
  };

  function findIndex(element) {
    if (element.path === `/${window.location.pathname.split("/")[1]}`) {
      const active = document.querySelector(".items");
      active.style.display = "block";
      return element;
    }
    return undefined;
  }

  function vanish() {
    const active = document.querySelector(".items");
    const activeElement = document.querySelector("li.active");
    if (active) active.style.display = "none";
    if (activeElement) activeElement.classList.remove("active");
  }

  function handleState(state) {
    setSearch(state);
  }

  useEffect(() => {
    window.pathname = location.pathname;
    let Index = array.find(findIndex);
    if (Index === undefined) vanish();
    if (Index !== undefined && Index.index !== undefined) {
      setActiveElement(Index.activeElement);
      localStorage.setItem("activeElement", Index.activeElement);
      const navItems = document.querySelectorAll(".nav ul li");
      const itemOffsetLeft = navItems[Index.index].offsetLeft;
      const itemOffsetTop = navItems[Index.index].offsetTop;
      navItems[Index.index].classList.add("active")
      const coloredDiv = document.querySelector(".items");
      coloredDiv.style.transform = `translateX(${
        itemOffsetLeft - coloredDiv.offsetLeft
      }px) translateY(${itemOffsetTop - coloredDiv.offsetTop}px)`;
    }
  }, [location.pathname]);

  const navigate = useNavigate();

  return (
    <>
      <div className="navContainer">
        <img
          src={burgerMenu}
          alt=""
          className="hamburger"
          onClick={() =>
            setNavDisplay((value) => {
              return !value;
            })
          }
        />
        <div className="logoContainer">
          <img
            src={logo}
            className="logoImage"
            alt="logo"
            onClick={() => {
              setSearch(false);
              handleClick("Home", 0);
              navigate("/");
            }}
          />
        </div>
        <div className={navDisplay ? "navigation" : "activated navigation"}>
          <div className={"nav"}>
            <div className="items"></div>
            <ul>
              <li className={activeElement === "Home" ? "active" : ""}>
                <Link
                  to="/"
                  onClick={() => {
                    setSearch(false);
                    handleClick("Home", 0);
                  }}
                >
                  <Icon.Home />
                  <span>Home</span>
                </Link>
              </li>
              <li className={activeElement === "Game" ? "active" : ""}>
                <Link
                  to="/game"
                  onClick={() => {
                    setSearch(false);
                    handleClick("Game", 1);
                  }}
                >
                  <Icon.Game />
                  <span>Game</span>
                </Link>
              </li>
              <li className={activeElement === "Chat" ? "active" : ""}>
                <Link
                  to="/chat"
                  onClick={() => {
                    setSearch(false);
                    handleClick("Chat", 2);
                  }}
                >
                  <Icon.Chat />
                  <span>Chat</span>
                </Link>
              </li>
              <li className={activeElement === "Leaderboard" ? "active" : ""}>
                <Link
                  to="/leaderboard"
                  onClick={() => {
                    setSearch(false);
                    handleClick("Leaderboard", 3);
                  }}
                >
                  <Icon.Leaderboard />
                  <span>Leaderboard</span>
                </Link>
              </li>
              <li className={activeElement === "Setting" ? "active" : ""}>
                <Link
                  to="/setting"
                  onClick={() => {
                    setSearch(false);
                    handleClick("Setting", 4);
                    navigate("/setting");
                  }}
                >
                  <Icon.Setting />
                  <span>Setting</span>
                </Link>
              </li>
              <li className={activeElement === "Profile" ? "active" : ""}>
                <Link
                  to="/profile"
                  onClick={() => {
                    setSearch(false);
                    handleClick("Profile", 5);
                  }}
                >
                  <Icon.Profile />
                  <span>Profile</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="button">
          <button
            className="navbutton"
            onClick={() => {
              setSearch(!search);
            }}
          >
            <img src={searchicon} alt="" />
          </button>
          <button className="navbutton">
            <img src={jarass} alt="" />
          </button>
          <button
            className="navbutton"
            onClick={() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              window.location.reload();
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              className="logoutSvg"
              transform="scale(1, -1)"
            >
              <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
            </svg>
          </button>
        </div>
      </div>
      {search && <SearchBar onStateChange={handleState} />}
    </>
  );
};

export default Navbar;
