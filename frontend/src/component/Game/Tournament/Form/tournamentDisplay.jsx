import React from "react";
import { useState } from "react";
import "./tournamentDisplay.css";
const TournamentDisplay = ({ setCancel, players }) => {

  const [round1] = useState(() => {
    const filledArray = Array(4).fill(null);
    if (players?.round1 && Array.isArray(players?.round1))
      players?.round1.slice(0, 4).forEach((player, index) => {
        if (index < 4) filledArray[index] = player;
      });
    return filledArray;
  });
  const [round2] = useState(() => {
    const filledArray = Array(4).fill(null);
    if (players?.round2 && Array.isArray(players?.round2))
      players?.round2.slice(0, 4).forEach((player, index) => {
        if (index < 4) filledArray[index] = player;
      });
    return filledArray;
  });
  const [winner] = useState(() => players?.winner !== undefined ? players?.winner : null);

  const apiUrl = process.env.REACT_APP_API_URL;
  function image_renaming(name) {
    return `${apiUrl}` + name;
  }

  return (
    <div className="tournament-display-container">
      <h1 className="tournament-display-header">Tournament</h1>
      <button className="close-Button" onClick={() => setCancel(true)}>
        <svg width={"100%"} height={"100%"} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
          <path className="close-Button-icon" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
        </svg>
        Cancel
      </button>
      <div className="tournament-display">
        <div className="tournament-winner player-card">
          <svg
            width="39"
            height="37"
            viewBox="0 0 39 37"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="crown"
          >
            <path d="M24.1977 10.6652C25.0813 10.6541 25.9428 10.1908 26.4276 9.3793C27.1769 8.12515 26.7691 6.50307 25.5163 5.75455C24.2635 5.00602 22.6418 5.41555 21.8925 6.6697C21.4043 7.48688 21.4079 8.45933 21.8168 9.24269L14.6829 13.8054C13.55 14.53 12.0358 14.0257 11.5651 12.7665L8.93159 5.70249C9.4422 5.49162 9.89368 5.12221 10.1988 4.61147C10.9482 3.35733 10.5403 1.73525 9.28752 0.986723C8.0347 0.238197 6.41305 0.647729 5.66373 1.90188C4.91442 3.15603 5.32223 4.7781 6.57505 5.52663C6.58639 5.5334 6.6034 5.54356 6.61473 5.55034L0.681485 21.3649C-0.0374641 23.2763 0.712079 25.4337 2.46943 26.4836L18.1836 35.8724C19.9352 36.919 22.1868 36.5624 23.5384 35.0212L34.653 22.3024C34.6643 22.3092 34.6813 22.3194 34.6927 22.3261C35.9455 23.0746 37.5671 22.6651 38.3165 21.411C39.0658 20.1568 38.658 18.5347 37.4051 17.7862C36.1523 17.0377 34.5307 17.4472 33.7814 18.7014C33.4762 19.2121 33.3649 19.7847 33.4211 20.3343L25.9527 21.3627C24.6207 21.5449 23.4592 20.4504 23.5604 19.1094L24.1977 10.6652Z" />
          </svg>
          <svg
            width="39"
            height="37"
            viewBox="0 0 39 37"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="crown-absolute"
          >
            <path d="M24.1977 10.6652C25.0813 10.6541 25.9428 10.1908 26.4276 9.3793C27.1769 8.12515 26.7691 6.50307 25.5163 5.75455C24.2635 5.00602 22.6418 5.41555 21.8925 6.6697C21.4043 7.48688 21.4079 8.45933 21.8168 9.24269L14.6829 13.8054C13.55 14.53 12.0358 14.0257 11.5651 12.7665L8.93159 5.70249C9.4422 5.49162 9.89368 5.12221 10.1988 4.61147C10.9482 3.35733 10.5403 1.73525 9.28752 0.986723C8.0347 0.238197 6.41305 0.647729 5.66373 1.90188C4.91442 3.15603 5.32223 4.7781 6.57505 5.52663C6.58639 5.5334 6.6034 5.54356 6.61473 5.55034L0.681485 21.3649C-0.0374641 23.2763 0.712079 25.4337 2.46943 26.4836L18.1836 35.8724C19.9352 36.919 22.1868 36.5624 23.5384 35.0212L34.653 22.3024C34.6643 22.3092 34.6813 22.3194 34.6927 22.3261C35.9455 23.0746 37.5671 22.6651 38.3165 21.411C39.0658 20.1568 38.658 18.5347 37.4051 17.7862C36.1523 17.0377 34.5307 17.4472 33.7814 18.7014C33.4762 19.2121 33.3649 19.7847 33.4211 20.3343L25.9527 21.3627C24.6207 21.5449 23.4592 20.4504 23.5604 19.1094L24.1977 10.6652Z" />
          </svg>
          {winner ? <img src={image_renaming(winner)} className="playercard-img" alt="" /> : <p>?</p>}
        </div>

        {/* Round 2 */}
        <div className="round round-2">
          {round2?.map(
            (player, index) =>
              index < 2 && (
                <div key={index} className="player-card">
                  {player ? <img src={image_renaming(player)} className="playercard-img" alt="" /> : <p>?</p>}
                </div>
              )
          )}
        </div>

        {/* Round 1 */}
        <div className="round round-1">
          {round1?.map((player, index) => (
            <div key={index} className="player-card">
              {player ? <img src={image_renaming(player)} className="playercard-img" alt="" /> : <p>?</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentDisplay;
