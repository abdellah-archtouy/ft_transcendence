import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./notification.css";

const Notification = ({ setShowNotifications, notificationData }) => {
  const apiUrl = process.env.REACT_APP_API_URL;
  // const [user, setUser] = useState(null);
  // const navigate = useNavigate();

  function avatarUrl(name, notif) {
    if (notif?.notification_type !== "TOURNAMENT_INVITE")
      return `${apiUrl}` + name;
    return name;
  }

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
    const minuteDelay = (today.getMinutes() - date.getMinutes())

    const options = { hour: "2-digit", minute: "2-digit", hour12: true };
    const isToday = date.toDateString() === today.toDateString();
    const isNow = minuteDelay < 30 && minuteDelay >= 0 && isToday;
    const isYesterday = date.getDate() - today.getDate();
    let dateTime = `${date.getDate()} ${month[date.getMonth()]}`;
    if (isNow)
      dateTime = "now";
    else if (isToday)
      dateTime = "Today";
    else if (isYesterday === -1)
      dateTime ="Yesterday";
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
          width="8"
          height="9"
          viewBox="0 0 8 9"
          fill="#E1E1E1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.130537 7.73366C-0.040974 7.90522 -0.0460324 8.19788 0.130537 8.36944C0.307128 8.54098 0.594681 8.54098 0.77125 8.36944L4 5.14018L7.22875 8.36944C7.40028 8.54098 7.69289 8.54604 7.86946 8.36944C8.04097 8.19282 8.04097 7.90522 7.86946 7.73366L4.63565 4.49937L7.86946 1.27011C8.04097 1.09855 8.04603 0.80589 7.86946 0.634352C7.68784 0.457755 7.40028 0.457755 7.22875 0.634352L4 3.86361L0.77125 0.634352C0.594681 0.457755 0.30207 0.452695 0.130537 0.634352C-0.040974 0.810949 -0.040974 1.09855 0.130537 1.27011L3.35929 4.49937L0.130537 7.73366Z"
            fill="#B8B8B8"
            fillOpacity="0.44"
          />
        </svg>
      </div>
      <hr
        style={{ border: "0.1px solid rgb(255, 255, 255, 0.35)", width: "96%" }}
      />
      <div className="notification-list">
        {notificationData.map((notif, index) => (
          <div
            className="notification-item"
            key={index}
            style={{
              animationName: "fade-in",
              animationDuration: `${index + 0.5}s`,
              animationTimingFunction: "ease-in-out",
              animationFillMode: "forwards",
            }}
          >
            <img
              src={avatarUrl(notif?.sender_avatar, notif)}
              alt=""
              className={
                avatarUrl(notif?.sender_avatar, notif) === notif?.sender_avatar
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;
