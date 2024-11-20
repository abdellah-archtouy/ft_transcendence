import React, { useEffect, useRef, useState } from "react";

function Card({ friends, handleAddFriend}) {
  const nameRef = useRef(null);
  const [isOverflow, setIsOverflow] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL

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
          ) : (
            <button
              className="card-btn"
              onClick={() => handleAddFriend(friends.id)}
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
