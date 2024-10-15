//this is just for the demo obviously the data will be fetched from the server in real world scenario !!
function avatarUrl(avatar) {
  return `http://localhost:8000/media/${avatar}`;
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
          <li key={index} className="top-5-list-item">
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
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
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
