import React, {useState} from 'react';
import { useLocation } from 'react-router-dom';
import Room from './room';

const ManagedRoom = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

  // Access specific query parameters
    const data = {
        room: queryParams.get('room')
    }
    const [mode] = useState("friends");
    return (
        <>
            <Room mode={mode} data={data}></Room>
        </>
    );
}

export default ManagedRoom;
