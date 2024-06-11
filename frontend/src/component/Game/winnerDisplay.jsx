import React from "react";

function winnerDisplay({ user }) {
  return (
    <>
      <p>Winner</p>
      <div style={{position: "relative"}}>
        <img
          src="/winner.svg"
          style={{
            height: "200px",
            filter: "drop-shadow(0px 0px 15px #ffffff93)",
          }}
        />
        <img
          src={user.avatar}
          style={{
            height: "120px",
            position: "absolute",
            zIndex: "1",
            right: "0",
            left: "0",
            top: "-80px",
            bottom: "0",
            margin: "auto",
            borderRadius: "50%",
            border: "solid #ffffff3f 4px"
          }}
        />
        <p className="name">{user.name}</p>
      </div>
    </>
  );
}

export default winnerDisplay;
