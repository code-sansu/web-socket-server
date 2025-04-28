// src/context/WebSocketContext.js
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';


const WebSocketContext = createContext();

 
  const getOrCreateClientId = () => {
    let id = sessionStorage.getItem("clientId");
    if (!id) {
      id = `client_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("clientId", id);
    }
    return id;
  };

  export const WebSocketProvider = ({ children , role }) => {
    const [ws, setSocket] = useState(null);
  const clientIdRef = useRef(getOrCreateClientId());
  const socketRef = useRef(null);

  useEffect(() => {
    
    const ws = new WebSocket('wss://web-socket-client-fwia.onrender.com/');
    socketRef.current = ws;
    setSocket(ws);
     
     ws.onopen = () => {
      console.log(`Connected to WebSocket as ${role}.`);
      ws.send(JSON.stringify({
        type: 'action',
        payload: {
          role ,
          clientId: clientIdRef.current
        }
      }));
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      
      //reconnectWebSocket();
    };
    
    //setWs(socket);  // Save WebSocket connection to state

    
    return () => {
      if (ws.readyState === WebSocket.OPEN ) {
        ws.close();
        console.log(' WebSocket connection explicitly closed.');
      }
    
    };
    
  }, []);
  

  return (
    <WebSocketContext.Provider value={{ socket: ws, clientId: clientIdRef.current }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
