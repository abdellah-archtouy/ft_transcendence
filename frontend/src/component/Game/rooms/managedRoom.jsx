import React, {useState} from 'react';
import { useLocation } from 'react-router-dom';
import Room from './room';

const ManagedRoom = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

  // Access specific query parameters
    const data = {
        user1: queryParams.get('user1'),
        user2: queryParams.get('user2')
    }
    const [mode] = useState("friends");
    return (
        <>
            <Room mode={mode} data={data}></Room>
        </>
    );
}

export default ManagedRoom;
