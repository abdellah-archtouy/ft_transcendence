import profile1 from './images/profile1.jpg';
import profile2 from './images/profile2.jpg';
import profile3 from './images/profile3.jpg';
import profile4 from './images/profile4.jpg';
import profile5 from './images/profile5.jpg';
import profile6 from './images/profile6.jpg';
import profile7 from './images/profile7.jpg';
import profile8 from './images/profile8.jpg';
import dash from './styles/dash.svg';


function Stats() {
    let stats = [
        { user1: 'Talal', user2: 'John', user1_img: profile5, user2_img: profile1, use1_score: 5, user2_score: 3 },
        { user1: 'Talal', user2: 'John', user1_img: profile6, user2_img: profile2, use1_score: 5, user2_score: 3 },
        { user1: 'Talal', user2: 'John', user1_img: profile7, user2_img: profile3, use1_score: 5, user2_score: 3 },
    ];

    return (
        <div className="matches-container">
            <ul className="matches-list">
                {stats.map((stat, index) => (
                    <li key={index} className="matches-list-item">
                        <div className="matches-list-item-user">
                            <img src={stat.user1_img} alt="user1" />
                            <p>{stat.user1.toUpperCase()}</p>
                        </div>
                        <div className="matches-list-item-score">
                            <p>{stat.use1_score}</p>
                            <img src={dash} alt="" style={{ width: "30%" }} />
                            <p>{stat.user2_score}</p>
                        </div>
                        <div className="matches-list-item-user">
                            <img src={stat.user2_img} alt="user2" />
                            <p>{stat.user2.toUpperCase()}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Stats;