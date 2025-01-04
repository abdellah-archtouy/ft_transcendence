import React, { useState, useEffect, useRef, useContext } from "react";
import "./Msg.css";
import Set from "./icons/set";
import Imoji from "./icons/imoji";
import PlayInv from "./icons/play_inv";
import Sent from "./icons/sent";
import SenderBox from "./sender_box";
import axios from "axios";
import emojiData from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import Back from "./icons/back";
import { WebSocketContext } from "./Chat";
import { useNavigate, useLocation } from "react-router-dom";
import { useError } from "../../App";

const Msg = ({
  userData,
  convid,
  convname1,
  setSelectedConvId,
  conversationdata,
}) => {
  const [message, setMessage] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrors] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [imogiclicked, setImogiclicked] = useState(false);
  const [mute, setMute] = useState(false);
  const [Block, setBlock] = useState(false);
  const messagesEndRef = useRef(null);
  const [ws, setWs] = useState(null);
  const [friendBlock, setFriendBlock] = useState([]);
  const navigate = useNavigate();
  const [convname, setConvname] = useState("");
  const [conversationdata1, setConversationdata1] = useState(conversationdata);
  const location = useLocation();
  const socket = useContext(WebSocketContext);
  const queryParam = new URLSearchParams(location.search);
  const divRef = useRef(null);
  const MuteBlk = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const [romeName, setRomeName] = useState("");
  const { setError } = useError();

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      const message1 = JSON.parse(event.data);
      const messag = message1.message;
      const parsmsg = JSON.parse(messag);
      if (parsmsg.conversation == queryParam.get("convid")) {
        setData((data) => [...data, parsmsg]);
      }
    };

    setWs(socket);
  }, [socket, convid, queryParam]);

  useEffect(() => {
    setConvname(queryParam.get("convid"));
  }, [queryParam]);

  useEffect(() => {
    const fetchData = async () => {
      const access = localStorage.getItem("access");
      try {
        if (queryParam.get("convid") === null) return;
        const response2 = await axios.get(
          `${apiUrl}/api/chat/conversation/${queryParam.get("convid")}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access}`,
            },
          }
        );
        setConversationdata1(response2.data);
        const response = await axios.get(
          `${apiUrl}/api/chat/msg/${response2.data.uid2_info.id}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${access}`,
            },
          }
        );
        setData(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          handleFetchError(error, () => fetchData());
        }
        else {
          setError(error.response.data.error);
          navigate("/chat");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [convname]);

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

  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setImogiclicked(false);
    }
    if (MuteBlk.current && !MuteBlk.current.contains(event.target)) {
      setClicked(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const postnewroom = async (friendId) => {
    const access = localStorage.getItem("access");
    try {
      const response = await axios.get(`${apiUrl}/api/chat/game/${friendId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });
      setRomeName(response.data);
    } catch (error) {
      handleFetchError(error, () => postnewroom(friendId));
    } finally {
      setLoading(false);
    }
  };

  function isMessageValide(message) {
    if (message.trim() === "")
      return true;
    else if (message.length > 1000)
    {
        setError("Message too long, only 1000 characters");
        return(true);
    }
    return false;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const access = localStorage.getItem("access");
      if (conversationdata1.uid2_info.id === null) return;
      try {
      const response2 = await axios.get(
        `${apiUrl}/api/chat/mute/get/${conversationdata1.uid2_info.id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        }
      );
      if (response2.data.data.block === true) {
      setError("You are blocked by the user");
      setMessage("");
      return;
    } else if (Block === true) {
      setError("You are blocked the user");
      setMessage("");
      return;
    }
    if (ws && !isMessageValide(message)) {
      const msg = {
        conversation: conversationdata1.id,
        user: userData.id,
        message: message,
        msg_type: "message",
        conversation_info: conversationdata1.conversation_info,
      };
      ws.send(JSON.stringify(msg));

      setMessage("");
    }
    else
      setMessage("");
    } catch (error) {
      handleFetchError(error, () => handleSubmit(e));
    } finally {
      setLoading(false);
    }
  };

  const handelinvite = async () => {
    if (conversationdata1.length === 0) return;
    if (conversationdata1.uid2_info?.id === null) return;

    const access = localStorage.getItem("access");
    try {
      const response2 = await axios.get(
        `${apiUrl}/api/chat/mute/get/${conversationdata1.uid2_info?.id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        }
      );
      const response = await axios.get(`${apiUrl}/api/chat/game/${conversationdata1.uid2_info?.id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
      });
      if (response2.data.data.block === true) {
        setError("You are blocked by the user");
        setMessage("");
        return;
      } else if (Block === true) {
        setError("You are blocked the user");
        setMessage("");
        return;
      }
      await postnewroom(conversationdata1.uid2_info.id);
      if (ws) {
        const msg = {
          conversation: conversationdata1.id,
          user: userData.id,
          message: response.data,
          msg_type: "invite",
          conversation_info: conversationdata1.conversation_info,
          invite_room_name: response.data,
        };
        ws.send(JSON.stringify(msg));
        setMessage("");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleFetchError(error, () => handelinvite());
      }
      else {
        setError(error.response.data.error);
        navigate("/chat");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(conversationdata1?.uid2_info?.id)
      fetchmute();
  }, [conversationdata1])

  const fetchmute = async () => {
    try {
      const access = localStorage.getItem("access");
      if (conversationdata1.uid2_info.id === null) return;
      const response2 = await axios.get(
        `${apiUrl}/api/chat/mute/get/${conversationdata1.uid2_info.id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        }
      );
      setFriendBlock(response2.data.data);
      if (response2.data.data1.mute === true) {
        setMute(true);
      }
      if (response2.data.data1.block === true) {
        setBlock(true);
      }
    } catch (error) {
      handleFetchError(error, () => fetchmute());
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handelmute = async () => {
    const access = localStorage.getItem("access");
    try {
      if (conversationdata1.uid2_info.id === null) return;
      const response = await axios.get(
        `${apiUrl}/api/chat/mute/${conversationdata1.uid2_info.id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        }
      );
      if (mute === true) {
        setMute(false);
      } else setMute(true);
    } catch (error) {
      handleFetchError(error, () => handelmute());
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  const handelblock = async () => {
    const access = localStorage.getItem("access");
    try {
      if (conversationdata1.uid2_info.id === null) return;
      const response = await axios.get(
        `${apiUrl}/api/chat/block/${conversationdata1.uid2_info.id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
        }
      );
      if (Block === true) {
        setBlock(false);
      } else setBlock(true);
    } catch (error) {
      handleFetchError(error, () => handelmute());
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  const handelsetclick = () => {
    setClicked(!clicked);
  };
  const handelemojiclick = () => {
    setImogiclicked(!imogiclicked);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [data]);

  const addemoji = (emoji) => {
    setMessage(message + emoji.native);
  };

  const handelcloseChat = () => {
    queryParam.set("username", "");
    navigate("/chat");
    setSelectedConvId(0);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  function avatarUrl(name) {
    return `${apiUrl}` + name;
  }
  return (
    <div className={`Msg `}>
      {queryParam.get("convid") !== null ? (
        <>
          <div className={`chat_top_bar `}>
            <div className="icon_name">
              <button className="Backbutton" onClick={handelcloseChat}>
                <Back />
              </button>
              <>
                <img
                  onClick={() => [
                    navigate(`/user/${conversationdata1?.uid2_info?.id}`),
                  ]}
                  style={{ cursor: "pointer" }}
                  src={avatarUrl(conversationdata1?.uid2_info?.avatar)}
                  alt="avatr"
                />
                <h3>{conversationdata1?.uid2_info?.username}</h3>
              </>
            </div>
            <div
              onClick={handelsetclick}
              className={`set ${
                conversationdata1.uid2_info?.username === "Tournament" ? "hide" : "null"
              }`}
            >
              <button>
                <Set />
              </button>
              <div
                ref={MuteBlk}
                className={`set_dropdown ${clicked === true ? "" : "hide"}`}
              >
                <ul>
                  {Block === true ? (
                    <li onClick={handelblock}>Unblock</li>
                  ) : (
                    <li onClick={handelblock}>Block</li>
                  )}
                  {mute === true ? (
                    <li onClick={handelmute}>Unmute</li>
                  ) : (
                    <li onClick={handelmute}>Mute</li>
                  )}

                  <li onClick={handelcloseChat}>Close Chat</li>
                </ul>
              </div>
            </div>
          </div>
          <div className={`conversation`}>
            {data.length === 0 ? (
              <div className="empty-conv">
                <p>
                  type some thing <br /> to your friend
                </p>
              </div>
            ) : (
              data.map((user, index) => (
                <SenderBox
                  key={index}
                  userData={userData}
                  name={user.user === userData.id ? "sender" : "receiver"}
                  data={user}
                  roomname={romeName}
                />
              ))
            )}
            <div ref={messagesEndRef} />
            <div />
          </div>
          <div
            className={` message_bar ${
              conversationdata1.uid2_info?.username === "Tournament" ? "hide" : "null"
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                handelinvite();
              }}
            >
              <PlayInv />
            </button>
            <button onClick={handelemojiclick}>
              <Imoji />
            </button>
            <div
              ref={divRef}
              className={`picker ${imogiclicked === true ? "" : "hide"}`}
            >
              {emojiData && (
                <Picker
                  emojiSize={20}
                  emojiButtonSize={28}
                  onEmojiSelect={addemoji}
                  previewPosition={"none"}
                  data={emojiData}
                />
              )}
            </div>
            <form onSubmit={handleSubmit} className="search-container1">
              <input
                className="search-input1"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
                required
              />
              <button type="submit">
                <Sent id="sent" />
              </button>
            </form>
          </div>
        </>
      ) : (
        <div className="empty">
          <p>
            Pick a person and start
            <br />a conversation
          </p>
        </div>
      )}
    </div>
  );
};

export default Msg;
