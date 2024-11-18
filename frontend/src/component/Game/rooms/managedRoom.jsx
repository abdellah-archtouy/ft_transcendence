import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import Room from './room';

const ManagedRoom = () => {
    const { room } = useParams();
    const [currentRoom, setCurrentRoom] = useState(room);

    useEffect(() => {
        setCurrentRoom(room); // Update state when `room` changes
    }, [room]);

    const data = { room: currentRoom };
    const [mode] = useState("friends");
    return (
        <>
            <Room mode={mode} data={data}></Room>
        </>
    );
}

export default ManagedRoom;
