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
                        <p>rank</p>
                    </div>
                    <div className="top-5-list-item-score">
                        <p>score</p>
                    </div>
                    <div className="top-5-list-item-wins">
                        <p>wins</p>
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
                            <p>{row.name}</p>
                        </div>
                        <div className="top-5-list-item-rank">
                            <p>{row.rank}</p>
                        </div>
                        <div className="top-5-list-item-score">
                            <p>{row.score}</p>
                        </div>
                        <div className="top-5-list-item-wins">
                            <p>{row.n_of_wins}</p>
                        </div>
                        <div className="top-5-list-item-link">
                            <a href="">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
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