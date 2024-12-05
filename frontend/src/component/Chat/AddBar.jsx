import React from "react";
import { useState, useEffect, useRef } from "react";
import "./AddBar.css";
import Search from "./icons/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import PropTypes from "prop-types";

AddBar.propTypes = {
  conv: PropTypes.array.isRequired,
  setConv: PropTypes.func.isRequired,
  on: PropTypes.bool.isRequired,
  setOn: PropTypes.func.isRequired,
};

function AddBar({
  setconvid,
  setConversationdata,
  conv,
  userData,
  setSelectedConvId,
  setConv,
  on,
  setOn,
}) {
  const [data, setData] = useState([]);
  const [resulte1, setresulte1] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);
  const divRef = useRef(null);

  const host = process.env.REACT_APP_API_HOSTNAME;

  const handleKeyDown = (event) => {
    if (event.key === "Escape" || event.keyCode === 27) {
      setOn(true);
    }
  };
  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setOn(true);
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const access = localStorage.getItem("access");
        const response = await axios.get(`${apiUrl}/chat/users/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        });
        const searchQuery = typeof data === "string" ? data.toLowerCase() : "";
        if (searchQuery === "") {
          setresulte1([]);
          return;
        }
        const users = response.data;
        setresulte1(
          response.data.filter((user) => {
            return (
              data &&
              users &&
              user.user.username.toLowerCase().includes(searchQuery)
            );
          })
        );
      } catch (error) {
        setError(error);
        console.log(error);
        handleFetchError(error, () => fetchData());
      } finally {
        setLoading(false);
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

    if (data) {
      fetchData();
    } else {
      setresulte1([]);
    }
  }, [data]);

  const handleChange = (e) => {
    setData(e);
  };

  useEffect(() => {
    const socket = new WebSocket(`ws://${host}:8000/ws/api/addconv/`);
    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
    socket.onmessage = socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const conv1 = data.conversation;
        const found = conv.find((conv) => conv.id === conv1.id);
        if (found) {
          navigate(`/chat?username=${conv1.conv_username}&convid=${conv1.id}`);
          // setSelectedConvId(conv1.id);
          // setConversationdata(conv1);
          // setconvid(conv1.id);
        } else {
          if (Array.isArray(conv1)) {
            console.log("Updating conversations (array):", conv1);
            setConv((conv) => [...conv1, ...conv]);
            setSelectedConvId(conv1.id);
            setConversationdata(conv1);
            setconvid(conv1.id);
          } else if (conv1 && typeof conv1 === "object") {
            console.log("Updating conversations (object):", conv1);
            setConv((conv) => [conv1, ...conv]);
          } else {
            console.error("Unexpected data format:", conv1);
          }
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    setWs(socket);
  }, []);

  const handleClick = (userId) => () => {
    setOn(true);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const msg = { user: userId, user1: userData.id };
      ws.send(JSON.stringify(msg));
      setData("");
    } else {
      console.log("WebSocket is not ready");
    }
  };
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className={`AddBar ${on === false ? "" : "hide"}`}>
      <div ref={divRef} className="out">
        <div className="SearchBar-container1">
          <div ref={divRef} className="SearchBar">
            <Search className="SearchIcon" />
            <input
              type="text"
              placeholder="Search..."
              name="search"
              className="SearchInput"
              value={data}
              onClick={handleKeyDown}
              onChange={(e) => handleChange(e.target.value)}
            ></input>
          </div>
          <div className="result">
            {resulte1.length === 0 ? (
              <div className="empty">
                <p>
                  Add a person <br />
                  and start a conversation
                </p>
              </div>
            ) : (
              resulte1.map((user) => (
                <button
                  onClick={handleClick(user.user.id)}
                  className="center"
                  key={user.user.id}
                >
                  {user.user.username}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddBar;
