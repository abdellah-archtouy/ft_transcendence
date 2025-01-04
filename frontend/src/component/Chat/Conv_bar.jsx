import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Conv from "./Conv";
import AddBar from "./AddBar";
import Add from "./icons/Vector";
import Vector from "./icons/Vector_1";
import "./Conv_bar.css";
import { WebSocketContext } from "./Chat";
import { useNavigate } from "react-router-dom";

const ConvBar = ({
  userData,
  setconvid,
  selectedConvId,
  setSelectedConvId,
  setConversationdata,
}) => {
  const [conv, setConv] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [on, setOn] = useState(true);
  const [search, setSearch] = useState("");
  const [tmp, setTmp] = useState([]);
  const [isEmptyObject, setisEmptyObject] = useState(true);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const socket = useContext(WebSocketContext);

  useEffect(() => {
    const fetchData = async () => {
      const access = localStorage.getItem("access");
      try {
        const response = await axios.get(`${apiUrl}/api/chat/conv/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        });
        if (response.data && response.data.length > 0) {
          setConv(response.data);
        } else {
          setConv([]);
        }
      } catch (error) {
        setError(error);
        handleFetchError(error, () => fetchData());
        setConv([]);
      } finally {
        setLoading(false);
      }
    };

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
                headers: { Authorization: `Bearer ${newAccess}` },
              }).then((response) => {
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
          console.log({
            general: "No refresh token available. Please log in.",
          });
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.reload();
          navigate("/");
        }
      } else {
        console.log({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (e) => {
      const data = JSON.parse(e.data);
      setConv(data.data);
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const handleClickconv = (conv) => {
    navigate(`/chat?convid=${conv.id}`);
    setConversationdata(conv);
  };

  useEffect(() => {
    if (selectedConvId !== 0) return;
    setconvid(selectedConvId);
    setConversationdata([]);
  }, [selectedConvId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const handleClickAdd = () => {
    setOn(false);
  };

  const handleChange = (e) => {
    setSearch(e);
    if (e === "") {
      setisEmptyObject(true);
    } else {
      setisEmptyObject(false);
    }
    if (e) {
      const searchQuery = e.toLowerCase();
      const result = conv.filter((user) => {
        return (
          user &&
          user.uid2_info.username &&
          user.uid2_info.username.toLowerCase().includes(searchQuery)
        );
      });
      setTmp(result);
    } else {
      setTmp([]);
    }
  };

  const handlesearchclick = (user) => {
    setSearch("");
    setisEmptyObject(true);
    navigate(`/chat?convid=${user.id}`);
    setconvid(user.id);
    setConversationdata(user);
  };

  return (
    <div className="conv_bar">
      <AddBar
        setconvid={setconvid}
        setConversationdata={setConversationdata}
        conv={conv}
        userData={userData}
        setSelectedConvId={setSelectedConvId}
        setConv={setConv}
        on={on}
        setOn={setOn}
        className="Search-bar"
      />
      <div className="top">
        <div className="center_top">
          <h2>Chat</h2>
          <button className="add" onClick={handleClickAdd}>
            <Add />
          </button>
        </div>
      </div>
      <div className="center">
        <div className="search-container">
          <Vector />
          <input
            type="text"
            placeholder="Search..."
            name="search"
            className="search-input"
            value={search}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      </div>
      {isEmptyObject === false ? (
        <div className={`scrol`}>
          {tmp.length === 0 ? (
            <div className="conv-bar-empty">
              <p>
                No conversation <br /> with this name
              </p>
            </div>
          ) : (
            tmp.map((user) => (
              <div
                className="center"
                key={user.id}
                onClick={() => handlesearchclick(user)}
              >
                <Conv data={user} />
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="scrol">
          {conv.length === 0 ? (
            <div className="conv-bar-empty">
              <p>
                Pick a person using '+' and
                <br />
                start a conversation
              </p>
            </div>
          ) : (
            conv.map((user) => (
              <div
                className="center"
                key={user.id}
                onClick={() => handleClickconv(user)}
              >
                <Conv data={user} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ConvBar;
