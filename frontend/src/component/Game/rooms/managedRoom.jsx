import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import Room from './room';

const ManagedRoom = () => {
    const { room } = useParams();
    const [currentRoom, setCurrentRoom] = useState(null);

    useEffect(() => {
        setCurrentRoom(room);
    }, [room]);

    const data = { room: currentRoom };
    const [mode] = useState("friends");
    return (
        <>
            <Room key={currentRoom} mode={mode} data={data}></Room>
        </>
    );
}

export default ManagedRoom;
