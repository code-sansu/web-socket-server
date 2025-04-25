import { useState, useEffect ,useRef } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

function useDashboard() {
  const { socket } = useWebSocket();
  const [clientsState, setClientsState] = useState({});
  const didRequestStates = useRef(false);
  const [clientActions, setClientActions] = useState({});
  const [isSequentialRunning, setIsSequentialRunning] = useState(false);
  const intervalRef = useRef(null);
  const clientActionsRef = useRef(clientActions);


  useEffect(() => {
    clientActionsRef.current = clientActions;
  }, [clientActions]);



  useEffect(() => {
    if (!socket) return;
    
    
    const handleMessage = (event) => {
      const data = JSON.parse(event.data);
      
      
      if (data.type === 'client_disconnected') {
        setClientsState((prev) => {
          const updated = { ...prev };
          delete updated[data.clientId];
          return updated;
        });
      }
    

      if(data.type === 'client_states'){
        setClientsState(data.states);
      }

      if (data.type === 'client_state_update') {
       
        setClientsState((prev) => ({
          ...prev,
          [data.clientId]: data.state,
        }));
      }

      if (data.type === 'all_clients_state') {
        setClientsState(data.clients || {});
      }
    };

    const handleOpen = () => {
      if (!didRequestStates.current) {
        socket.send(JSON.stringify({ type: 'get_states' }));
        didRequestStates.current = true;
      }
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('message', handleMessage);
    
    if (socket.readyState === WebSocket.OPEN && !didRequestStates.current) {
      socket.send(JSON.stringify({ type: 'get_states' }));
      didRequestStates.current = true;
    }

    return () => {
      socket.removeEventListener('message', handleMessage);
      socket.removeEventListener('open', handleOpen);
    };
  }, [socket]);
  
  
  const sendCommandToClient = (clientId, command) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({
      type: 'admin_command',
      payload: {
        clientId,
        command, // e.g. { action: "toggle_music" }
      },
    }));
  };

  const logClientAction = (clientId, action) => {
    setClientActions(prev => ({
      ...prev,
      [clientId]: {
        lastAction: action,
        timestamp: Date.now() // use epoch time (number of ms since 1970)
      }
    }));
  };
  

  const startSequentialTest = () => {
    if (intervalRef.current) return; // already running
  
    intervalRef.current = setInterval(() => {
      const clientIds = Object.keys(clientsState);
      if (clientIds.length === 0) return;
  
      // Pick the client with the oldest timestamp (or no timestamp at all)
      const sortedClients = clientIds.sort((a, b) => {
        const timeA = clientActionsRef.current[a]?.timestamp
          ? new Date(clientActionsRef.current[a].timestamp).getTime()
          : 0; // Treat undefined timestamps as 0 (i.e., oldest)
        const timeB = clientActionsRef.current[b]?.timestamp
          ? new Date(clientActionsRef.current[b].timestamp).getTime()
          : 0;
        return timeA - timeB; // ascending order
      });
  
      const nextClient = sortedClients[0];
  
      if (nextClient) {
        // Stop tests on all other clients
        clientIds.forEach((clientId) => {
          if (clientId !== nextClient) {
            stopTest(clientId);
          }
        });
  
        // Start test on the next client
        startTest(nextClient); // this calls logClientAction internally
      }
    }, 5000); // 12seconds
  
    setIsSequentialRunning(true);
  };
  
  

  const stopSequentialTest = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsSequentialRunning(false);
      stopTestForAll();  // Make sure to stop the test for all clients when stopping the sequence
    }
  };
  
  
  
  

  const toggleMusic = (clientId) => {
    sendCommandToClient(clientId, { action: 'toggle_music' });
    //socket.send(JSON.stringify({ type: 'toggle_music' }));
  };

  const toggleRideGrid = (clientId) => {
    sendCommandToClient(clientId, { action: 'toggle_ridegrid' });
    //socket.send(JSON.stringify({ type: 'toggle_ridegrid' }));
  };

  const toggleAdvertisingPower = (clientId) => {
    sendCommandToClient(clientId, { action: 'toggle_advertising_power' });
    // socket.send(JSON.stringify({type: 'toggle_advertising_power'}))
  };
  
  const toggleConnectionPower = (clientId) => {
    sendCommandToClient(clientId, { action: 'toggle_connection_power' });
    // socket.send(JSON.stringify({type: 'toggle_connection_power'}))
 };

 const startTest = (clientId) => {
   sendCommandToClient(clientId, { action: 'start_test' });
   logClientAction(clientId, "start_test");
   // socket.send(JSON.stringify({type: 'start_test'}))
 };

 const stopTest = (clientId) => {
   sendCommandToClient(clientId, { action: 'stop_test' });
  //  socket.send(JSON.stringify({type: 'stop_test'}))
 };

 const stopTestForAll = () => {
  //sendCommandToClient(clientId, { action: 'stop_test' });
  socket.send(JSON.stringify({type: 'stop_test'}))
};
const startTestForAll = () => {
  //sendCommandToClient(clientId, { action: 'stop_test' });
   socket.send(JSON.stringify({type: 'start_test'}))
};

  return {
    clients: clientsState,
    clientActions,
    isSequentialRunning,
    toggleMusic,
    toggleRideGrid,
    toggleAdvertisingPower,
    toggleConnectionPower,
    startTest,
    stopTest,
    startTestForAll,
    stopTestForAll,
    logClientAction,
    startSequentialTest,
    stopSequentialTest
  };
}

export default useDashboard;
