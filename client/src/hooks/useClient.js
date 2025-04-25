
import React, { useState , useRef , useEffect} from 'react';
//const WebSocket = require("ws");
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';

function useClient() {
  // State to manage button click messages
  const { socket, clientId } = useWebSocket();// shared connection!
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [groups, setGroups] = useState({}); 
  const [batteryPercentage , setbatterypercentage] = useState('');
  const [typedGroup, setTypedGroup] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [clientGroups , setClientGroups] = useState({});
  const [clients, setClients] = useState([]); 
  const reconnectTimeoutRef = useRef(null); // Ref to handle reconnection attempts
  
  const [isOn, setIsOn] = useState(false);
  const audioRef = useRef(null);
  const wsRef = useRef(null);
  

  useEffect(() => {
    
    if (!socket) return;
    
    
    if (socket && socket.readyState === WebSocket.OPEN && clientId) {
      socket.send(JSON.stringify({
        type: 'update_state',
        payload: {
          isPlaying,
          batteryPercentage,
          isOn,
          clientGroups,
          clientId
        }
      }));
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "command") {
        const { action } = data.command;
      
        if (action === "toggle_music") {
          toggleMusic();
          //setIsPlaying(prev => !prev); // Update local state
          //sendStateUpdate({ isPlaying: !isPlaying }); // Optional: notify server
        }
      
        if (action === "toggle_ridegrid") {
          toggleRidegrid();
          //sendStateUpdate({ isOn: !isOn });
        }
      }
      
      if (data.type === 'list_clients') {
        setClients(Object.keys(data.clients));  
      }
      if (data.type === 'list_groups') {
        console.log("Groups received:", data.groups);  
        setGroups(data.groups);  
      }
      if (data.type === 'join_group') {
        setMessage(`You have successfully joined the group: ${data.groupName}`);
        if (data.clientGroups) {
          setClientGroups(data.clientGroups);
        }

      }
      if (data.type === 'create_group') {
        setMessage(`You have successfully created a group: ${data.groupName}`);
        if (data.clientGroups) {
          setClientGroups(data.clientGroups);
        }
      }
      if(data.type === 'create_group_message'){
        setMessage(`Group ${data.groupName} already exists . Kindly join the group . `);
        if (data.clientGroups) {
          setClientGroups(data.clientGroups);
        }
      }
      if(data.type === 'join_group_message'){
        setMessage(`Group ${data.groupName} does not exist.`);
        if (data.clientGroups) {
          setClientGroups(data.clientGroups);
        }
      }
      if(data.type === 'already_group_message'){
        setMessage(`You are already int the Group ${data.groupName} .`);
        if (data.clientGroups) {
          setClientGroups(data.clientGroups);
        }
      }
      if(data.type === 'broadcast'){
        setMessage(`message recieved : "${data.message}" from the server. `);
      }
      if(data.type === 'unicast'){
        setMessage(`message recieved : "${data.message}" from the server. `);
      }
      if (data.type === 'toggle_music') {
        toggleMusic();  // When toggle_music message is received, toggle the music
      }
      if (data.type === 'empty_group_name') {
        setMessage(`group name can't be empty.`);

      }


    }; 
    
    }, [socket ,isOn ,isPlaying ,clientGroups]);

    


  const handleRoleSelect = (role) => {

    if (role === 'test') {
      navigate('/client/test');
    } 
   
  };

  const toggleRidegrid = () =>{
    setIsOn(!isOn);
    socket.send(JSON.stringify({
      type: 'update_state',
      payload: {
        isPlaying,
        isOn,
        clientGroups,
        clientId
      }
    }));
  }

  const toggleMusic = () => {
    if (audioRef.current) {
      console.log("Audio paused:", audioRef.current.paused);  // Check the current state
      if (audioRef.current.paused) {
        console.log("Playing music...");
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err);
        });
        setIsPlaying(true); // Set state to playing
      } else {
        console.log("Pausing music...");
        audioRef.current.pause();
        setIsPlaying(false); // Set state to paused
      }
    }
    socket.send(JSON.stringify({
      type: 'update_state',
      payload: {
        isPlaying,
        isOn,
        clientGroups,
        clientId
      }
    }));
  };
  

  
  const handleGroupChange = (event) => {
    setSelectedGroup(event.target.value);
  };
  

  const handleJoinGroup = () => {
    if (selectedGroup) {
      // Send a WebSocket message to join the group
      if (socket) {
        socket.send(JSON.stringify({
          type: 'join_group',
          payload: {
            isPlaying,
            isOn,
            clientGroups,
            clientId,
            groupName: selectedGroup
          }
        }));
        
      }
    } else {
      setMessage('Please select a group to join.');
    }
  };
  
  const handleButton2Click = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'list_groups' }));
    }
  };
  
  const handleButton3Click = () => {
    if (socket && socket.readyState === WebSocket.OPEN){
    socket.send(JSON.stringify({
      type: 'create_group',
      payload: {
        isPlaying,
        isOn,
        clientGroups,
        clientId,
        groupName: typedGroup
      }
    }));
   }
  };

 
  const handleGroupInputChange = (event) => {
    setTypedGroup(event.target.value);
  };

  return{
     message,
     groups,
     typedGroup,
     isPlaying,
     batteryPercentage,
     clientGroups,
     selectedGroup,
     audioRef,
     isOn,
     toggleMusic,
     toggleRidegrid,
     handleRoleSelect,
     handleGroupChange,
     handleButton2Click,
     handleJoinGroup,
     handleButton3Click,
     handleGroupInputChange
  };
};

export default useClient;

