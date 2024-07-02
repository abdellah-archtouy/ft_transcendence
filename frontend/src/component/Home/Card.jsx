function Card({ friends, handleAddFriend }) {
    return (
        <div>
            <div className="card">
                <img src={friends.img} alt="Avatar" />
                <div className="container">
                    <h4><b className="card-container-name">{friends.name}</b> <div className="online-offline"> </div></h4>
                    <button className="card-btn" onClick={handleAddFriend}>Add Friend</button>
                </div>
            </div>
        </div>
    );
}

export default Card;