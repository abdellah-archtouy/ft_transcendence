//this is just for the demo obviously the data will be fetched from the server in real world scenario !!
const apiUrl = process.env.REACT_APP_API_URL

function avatarUrl(avatar) {
  return `${apiUrl}/media/${avatar}`;
}

function Top_5({ data }) {
  const rows = data;
  return (
    <div className="top-5-container">
      <ul className="top-5-list">
        <li className="top-5-list-item">
          <div className="top-5-list-item-user">
            <p>avatar</p>
          </div>
          <div className="top-5-list-item-name">
            <p>name</p>
          </div>
          <div className="top-5-list-item-rank">
            <p>#rank</p>
          </div>
          <div className="top-5-list-item-score">
            <p>score</p>
          </div>
          <div className="top-5-list-item-wins">
            <p>n of wins</p>
          </div>
          <div className="top-5-list-item-link">
            <p></p>
          </div>
        </li>
        {rows.map((row, index) => (
          <li key={index} className="top-5-list-item" style={{
            animationName: "fade-in",
            animationDuration: `${index * 0.5}s`,
            animationTimingFunction: "ease-in-out",
            animationFillMode: "forwards",
          }}>
            <div className="top-5-list-item-user">
              <img src={avatarUrl(row.avatar)} alt="user" />
            </div>
            <div className="top-5-list-item-name">
              <p>{row.username.substring(0, 9).toUpperCase()}</p>
            </div>
            <div className="top-5-list-item-rank">
              <p>#{row.rank}</p>
            </div>
            <div className="top-5-list-item-score">
              <p>{row.score}xp</p>
            </div>
            <div className="top-5-list-item-wins">
              <p>{row.matches_won}</p>
            </div>
            <div className="top-5-list-item-link">
              <a href="">
              <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="top5-LinkIcon"
                      >
                        <path d="M352 0c-12.9 0-24.6 7.8-29.6 19.8s-2.2 25.7 6.9 34.9L370.7 96 201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L416 141.3l41.4 41.4c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-128c0-17.7-14.3-32-32-32L352 0zM80 32C35.8 32 0 67.8 0 112L0 432c0 44.2 35.8 80 80 80l320 0c44.2 0 80-35.8 80-80l0-112c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 112c0 8.8-7.2 16-16 16L80 448c-8.8 0-16-7.2-16-16l0-320c0-8.8 7.2-16 16-16l112 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 32z" />
              </svg>
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Top_5;
