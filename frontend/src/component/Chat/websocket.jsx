import React, { createContext, useState, useEffect, useContext } from 'react';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({children1}) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Create WebSocket connection
    const ws = new WebSocket(`ws://${window.location.hostname}:8000/api/data/`);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
        {children1}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
