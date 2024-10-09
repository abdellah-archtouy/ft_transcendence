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
    console.log(itemOffsetTop);
    coloredDiv.style.transition = `transform 0.3s ease-in-out`;
  };

  function findIndex(element) {
    if (element.path === window.location.pathname) return element;
    return undefined;
  }

  function findElement(element) {
    if (element.activeElement === localStorage.getItem("activeElement"))
      return element;
    return undefined;
  }

  function handleState(state) {
    setSearch(state);
  }

  useEffect(() => {
    window.pathname = location.pathname;
    let Index = array.find(findIndex);
    if (Index === undefined) Index = array.find(findElement);
    if (Index !== undefined && Index.index !== undefined) {
      setActiveElement(Index.activeElement);
      localStorage.setItem("activeElement", Index.activeElement);
      const navItems = document.querySelectorAll(".nav ul li");
      const itemOffsetLeft = navItems[Index.index].offsetLeft;
      const itemOffsetTop = navItems[Index.index].offsetTop;
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
        <div className={navDisplay ? "navigation"  : "activated navigation"}>
          <div className={"nav"}>
            <ul>
              <div className="items"></div>
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
        </div>
      </div>
      {search && <SearchBar onStateChange={handleState} />}
    </>
  );
};

export default Navbar;
