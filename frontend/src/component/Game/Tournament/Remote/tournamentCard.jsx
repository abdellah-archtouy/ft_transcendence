import React from 'react';
import "./tournamentCard.css"

const TournamentCard = ({setJoin, data}) => {
    console.log(data)
    return (
        <div className='TournamentCard-container'>
            <h4 className='TournamentCard-numusers'>
                &lt; {data?.users_num}/4 &gt;
            </h4>
            <h1 className="TournamentCard-name">
                {data.name}
            </h1>
            <div className="join-button">
                <div className="bg-color"></div>
                <button className="TournamentCard-join" onClick={setJoin(true)}>
                    Join
                </button>
            </div>
        </div>
    );
}

export default TournamentCard;
