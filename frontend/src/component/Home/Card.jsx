import React, { useEffect, useRef, useState } from 'react';

function Card({ friends, handleAddFriend }) {
    const nameRef = useRef(null);
    const [isOverflow, setIsOverflow] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            if (nameRef.current) {
                setIsOverflow(nameRef.current.scrollWidth > nameRef.current.clientWidth);
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);

        return () => {
            window.removeEventListener('resize', checkOverflow);
        };
    }, []);

    return (
        <div className="card-container">
            <div className="card">
                <img src={friends.img} alt="Avatar" />
                <div className="container">
                    <div className={`name-container ${isOverflow ? 'overflow' : ''}`} ref={nameRef}>
                        <span className="name">{friends.name}</span>
                    </div>
                </div>
                <div className="container-btn">
                    <button className="card-btn" onClick={handleAddFriend}>Add Friend</button>
                </div>
            </div>
        </div>
    );
}

export default Card;
