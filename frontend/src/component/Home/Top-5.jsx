//this is just for the demo obviously the data will be fetched from the server in real world scenario !!
import profile1 from './images/profile1.jpg';
import profile2 from './images/profile2.jpg';
import profile3 from './images/profile3.jpg';
import profile4 from './images/profile4.jpg';
import profile5 from './images/profile5.jpg';


const rows = [
    { avatar: profile1, name: 'Guts', rank: 1, score: 240, n_of_wins: 20, link: '' },
    { avatar: profile2, name: 'Griffith', rank: 2, score: 230, n_of_wins: 19, link: '' },
    { avatar: profile3, name: 'Casca', rank: 3, score: 220, n_of_wins: 18, link: '' },
    { avatar: profile4, name: 'Judeau', rank: 4, score: 210, n_of_wins: 17, link: '' },
    { avatar: profile5, name: 'Rickert', rank: 5, score: 200, n_of_wins: 16, link: '' },
]

function Top_5() {
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
                            <img src={row.avatar} alt="user" />
                        </div>
                        <div className="top-5-list-item-name">
                            <p>{row.name.toUpperCase()}</p>
                        </div>
                        <div className="top-5-list-item-rank">
                            <p>#{row.rank}</p>
                        </div>
                        <div className="top-5-list-item-score">
                            <p>{row.score}xp</p>
                        </div>
                        <div className="top-5-list-item-wins">
                            <p>{row.n_of_wins}</p>
                        </div>
                        <div className="top-5-list-item-link">
                            <a href="">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
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