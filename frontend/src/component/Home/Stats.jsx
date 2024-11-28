import dash from "./styles/dash.svg";

const apiUrl = process.env.REACT_APP_API_URL

function avatarUrl(avatar) {
  return `${apiUrl}/media/${avatar}`;
}

function Stats({ data }) {
  const stats = data;

  return (
    <div className="matches-container">
      <ul className="matches-list">
        {stats.map((stat, index) => {
          const itemStyle = {
            animationName: "fade-in",
            animationDuration: `${index * 1.5}s`,
            animationTimingFunction: "ease-in-out",
            animationFillMode: "forwards",
          };

          if (stat.type === "tournament") {
            return (
              <li key={`tournament-${index}`} className="matches-list-item-tournament" style={itemStyle}>
                <div className="matches-list-item-user-tournament">
                  <img src={avatarUrl(stat.winner_avatar)} alt="user1" />
                    <svg viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="matches-list-item-user-tournament-icon">
                    <path d="M19.2938 10.2882C19.8298 10.3644 20.3949 10.1648 20.7646 9.719C21.3361 9.03001 21.2414 8.00962 20.5532 7.43879C19.8649 6.86797 18.8446 6.96368 18.2732 7.65267C17.9009 8.1016 17.8118 8.69072 17.9858 9.2034L13.2381 11.2962C12.4841 11.6285 11.6147 11.1811 11.4479 10.3745L10.5166 5.85023C10.8456 5.77049 11.1536 5.58922 11.3863 5.30864C11.9578 4.61965 11.8631 3.59925 11.1749 3.02843C10.4866 2.45761 9.46634 2.55331 8.89491 3.2423C8.32348 3.93129 8.41811 4.95169 9.10637 5.52251C9.1126 5.52768 9.12194 5.53542 9.12817 5.54059L4.05108 14.5586C3.43633 15.6484 3.6876 17.025 4.65304 17.8257L13.2859 24.9856C14.2482 25.7837 15.6449 25.7792 16.6079 24.9729L24.5315 18.3157C24.5377 18.3208 24.5471 18.3286 24.5533 18.3338C25.2416 18.9046 26.2619 18.8089 26.8333 18.1199C27.4047 17.4309 27.3101 16.4105 26.6218 15.8397C25.9336 15.2689 24.9133 15.3646 24.3418 16.0536C24.1091 16.3341 23.988 16.6704 23.9704 17.0084L19.352 16.9299C18.5285 16.9151 17.9279 16.1435 18.1151 15.341L19.2938 10.2882Z" fill="#DDC47B"/>
                    </svg>
                  <p>{stat.name?.toUpperCase()}</p>
                </div>
              </li>
            );
          } else if (stat.type === "normal") {
            return (
              <li key={`normal-${index}`} className="matches-list-item" style={itemStyle}>
                <div className="matches-list-item-user">
                  <img src={avatarUrl(stat.winner_avatar)} alt="user1" />
                  <p>{stat.winner_username?.toUpperCase()}</p>
                </div>
                <div className="matches-list-item-score">
                  <p>{stat.winner_goals}</p>
                  <img src={dash} alt="" style={{ width: "30%" }} />
                  <p>{stat.loser_goals}</p>
                </div>
                <div className="matches-list-item-user">
                  <img src={avatarUrl(stat.loser_avatar)} alt="user2" />
                  <p>{stat.loser_username?.toUpperCase()}</p>
                </div>
              </li>
            );
          } else {
            return null; // Return `null` for unhandled types to avoid errors
          }
        })}
      </ul>
    </div>
  );
}


export default Stats;
