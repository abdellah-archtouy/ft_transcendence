import React, { useEffect, useRef, useState } from "react";

function Card({ friends, handleAddFriend}) {
  const nameRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL
  const [AlreadyFriends, setAlreadyFriends] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (nameRef.current) {
        setIsOverflow(
          nameRef.current.scrollWidth > nameRef.current.clientWidth
        );
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, []);

  const handleAddFriendClick = async () => {
    try {
      await handleAddFriend(friends.id);
    } catch (error) {
      if (error.response?.data?.message === "Already sent") {
        setAlreadyFriends(true); // Update local state for "Already friends"
      }
    }
  };

  const avatarUrl = `${apiUrl}${friends.avatar}`;

  return (
    <div className="card-container" >
      <div className="card">
        <img src={avatarUrl} alt={`${friends.username}'s avatar`} />
        <div className="container">
          <div
            className={`name-container ${isOverflow ? "overflow" : ""}`}
            ref={nameRef}
          >
            <span className="name">{friends.username}</span>
          </div>
        </div>
        <div className="container-btn">
          {friends.added ? (
            <p className="added" disabled>
              Friend Added
            </p>
          ) : AlreadyFriends ? (
            <p className="added" disabled>
              Already Friends
            </p>
          )
          : (
            <button
              className="card-btn"
              onClick={() => handleAddFriendClick()}
            >
              Add Friend
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Card;