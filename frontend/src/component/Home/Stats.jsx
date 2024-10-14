import profile1 from './images/profile1.jpg';
import profile2 from './images/profile2.jpg';
import profile3 from './images/profile3.jpg';
import profile4 from './images/profile4.jpg';
import profile5 from './images/profile5.jpg';
import profile6 from './images/profile6.jpg';
import profile7 from './images/profile7.jpg';
import profile8 from './images/profile8.jpg';
import dash from './styles/dash.svg';

function avatarUrl(avatar) {
    return `http://localhost:8000/media/${avatar}`;
}

function Stats({data}) {
    // let stats = [
    //     { winner_username: 'Talal', loser_username: 'John', winner_avatar: profile5, loser_avatar: profile1, winner_goals: 5, loser_goals: 3 },
    //     { winner_username: 'Talal', loser_username: 'John', winner_avatar: profile6, loser_avatar: profile2, winner_goals: 5, loser_goals: 3 },
    //     { winner_username: 'Talal', loser_username: 'John', winner_avatar: profile7, loser_avatar: profile3, winner_goals: 5, loser_goals: 3 },
    // ];
    
    let stats = data;
    return (
        <div className="matches-container">
            <ul className="matches-list">
                {stats.map((stat, index) => (
                    <li key={index} className="matches-list-item">
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