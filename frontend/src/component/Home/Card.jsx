import Marquee from "react-fast-marquee";

function Card({ friends, handleAddFriend }) {
    return (
        <div className="card-container">
            <div className="card">
                <img src={friends.img} alt="Avatar" />
                <div className="container">
                    <Marquee className="container-marquee" pauseOnHover="false" speed="15"  >
                        {friends.name}
                    </Marquee>
                </div>
                <div className="container-btn">
                    <button className="card-btn" onClick={handleAddFriend}>Add Friend</button>
                </div>
            </div>
        </div >
    );
}

export default Card;