import React from "react";
import { useNavigate } from "react-router-dom";
import "./notification.css";
import axios from "axios";

const Notification = ({
  setShowNotifications,
  notificationData,
  setNotificationData,
}) => {
  const apiUrl = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();

  function avatarUrl(name, notif) {
    if (notif?.notification_type !== "TOURNAMENT_INVITE")
      return `${apiUrl}` + name;
    return name;
  }

  const handleFetchError = (error, retryFunction) => {
    if (error.response) {
      if (error.response.status === 401) {
        const refresh = localStorage.getItem("refresh");
        if (refresh) {
          axios
            .post(`${apiUrl}/api/token/refresh/`, { refresh })
            .then((refreshResponse) => {
              const { access: newAccess } = refreshResponse.data;
              localStorage.setItem("access", newAccess);
              retryFunction();
            })
            .catch(() => {
              localStorage.removeItem("access");
              localStorage.removeItem("refresh");
              window.location.reload();
              navigate("/");
            });
        }
      }
    }
  };

  const handleFriendRequest = async (id, action, notif) => {
    const token = localStorage.getItem("access");

    try {
      const response = await axios.post(
        `${apiUrl}/api/users/friends/${id}/${action}/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message) {
        setNotificationData((prevData) =>
          prevData.filter((notification) => notification.id !== notif.id)
        );
      }
    } catch (error) {
      handleFetchError(error, () => handleFriendRequest(id, action));
    }
  };

  function positionOfNth(str, n) {
    const l = str.length;
    let i = -1;
    while (n-- && i++ < l) {
      i = str.indexOf(" ", i);
      if (i < 0) break;
    }
    return i;
  }

  function returnTime(time) {
    const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const date = new Date(time);
    const today = new Date();
    const minuteDelay = today.getMinutes() - date.getMinutes();

    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    const isToday = date.toDateString() === today.toDateString();
    const isNow = minuteDelay < 30 && minuteDelay >= 0 && isToday;
    const isYesterday = date.getDate() - today.getDate();
    let dateTime = `${date.getDate()} ${month[date.getMonth()]}`;
    if (isNow) dateTime = "now";
    else if (isToday) dateTime = "Today";
    else if (isYesterday === -1) dateTime = "Yesterday";
    return (
      <>
        <p>{dateTime}</p>
        <div className="timedot"></div>
        <p>{date.toLocaleTimeString("en-US", options)}</p>
      </>
    );
  }

  if (!notificationData) return;
  return (
    <div className="Notification-container">
      <div className="notification-header">
        <h1>Notifications</h1>
        <svg
          className="close"
          onClick={() => setShowNotifications(false)}
          viewBox="0 0 8 9"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0.130537 7.73366C-0.040974 7.90522 -0.0460324 8.19788 0.130537 8.36944C0.307128 8.54098 0.594681 8.54098 0.77125 8.36944L4 5.14018L7.22875 8.36944C7.40028 8.54098 7.69289 8.54604 7.86946 8.36944C8.04097 8.19282 8.04097 7.90522 7.86946 7.73366L4.63565 4.49937L7.86946 1.27011C8.04097 1.09855 8.04603 0.80589 7.86946 0.634352C7.68784 0.457755 7.40028 0.457755 7.22875 0.634352L4 3.86361L0.77125 0.634352C0.594681 0.457755 0.30207 0.452695 0.130537 0.634352C-0.040974 0.810949 -0.040974 1.09855 0.130537 1.27011L3.35929 4.49937L0.130537 7.73366Z" />
        </svg>
      </div>
      <hr
        style={{ border: "0.1px solid rgb(255, 255, 255, 0.35)", width: "96%" }}
      />
      <div className="notification-list">
        {notificationData.length ? (
          notificationData.map((notif, index) => (
            <div
              className="notification-item"
              key={index}
              style={{
                animationName: "fade-in",
                animationTimingFunction: "ease-in-out",
                animationFillMode: "forwards",
              }}
              onClick={() => {
                if (notif?.link) navigate(notif?.link);
                setShowNotifications(false)
              }}
            >
              <img
                src={avatarUrl(notif?.sender_avatar, notif)}
                alt=""
                className={
                  avatarUrl(notif?.sender_avatar, notif) ===
                  notif?.sender_avatar
                    ? "sender_avatar"
                    : "sender_avatar profile"
                }
              />
              <div className="message-and-time">
                <h5>
                  <span className="titleBold">
                    {notif?.message.substring(
                      0,
                      positionOfNth(notif?.message, 1)
                    )}
                  </span>
                  {notif?.message.substring(positionOfNth(notif?.message, 1))}
                </h5>
                <div className="notification-timeDisplay">
                  {returnTime(notif?.time)}
                </div>
              </div>
              {/* add accept and deny buttons only in the case where the notification is a friend request */}
              {notif?.notification_type === "FRIEND_REQUEST" && (
                <div className="notification-buttons">
                  <button
                    className="accept-deny"
                    onClick={(e) => {
                      handleFriendRequest(notif.sender, "accept", notif);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      className="accept-deny-icon"
                    >
                      <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z" />
                    </svg>
                  </button>
                  <button
                    className="accept-deny"
                    onClick={(e) => {
                      handleFriendRequest(notif.sender, "deny", notif);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                      className="accept-deny-icon"
                    >
                      <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="notification-item-empty">
            You have no new notifications.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
