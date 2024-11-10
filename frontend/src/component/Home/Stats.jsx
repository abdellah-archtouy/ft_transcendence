import dash from "./styles/dash.svg";

function avatarUrl(avatar) {
  return `http://localhost:8000/media/${avatar}`;
}

function Stats({ data }) {
  let stats = data;
  return (
    <div className="matches-container">
      <ul className="matches-list">
        {stats.map((stat, index) => (
          <li key={index} className="matches-list-item" style={{
            animationName: "fade-in",
            animationDuration: `${index * 1.5}s`,
            animationTimingFunction: "ease-in-out",
            animationFillMode: "forwards",
          }}>
            <div className="matches-list-item-user">
              <img src={avatarUrl(stat.winner_avatar)} alt="user1" />
              <p>{stat.winner_username.toUpperCase()}</p>
            </div>
            <div className="matches-list-item-score">
              <p>{stat.winner_goals}</p>
              <img src={dash} alt="" style={{ width: "30%" }} />
              <p>{stat.loser_goals}</p>
            </div>
            <div className="matches-list-item-user">
              <img src={avatarUrl(stat.loser_avatar)} alt="user2" />
              <p>{stat.loser_username.toUpperCase()}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Stats;
