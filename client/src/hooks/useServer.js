import React, { useState , useRef , useEffect} from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../context/WebSocketContext';


//const WebSocket = require("ws");
function useServer() {
  
  const { socket, clientId } = useWebSocket();// shared connection!

  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [clients, setClients] = useState([]); 
  const [groups, setGroups] = useState({});
  const [typedMessage, setTypedMessage] = useState('');
  const [selectedClients , setSelectedClients] = useState([]);
  
  
 
   
  useEffect(() => {
    
    if (!socket) return;


    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'list_clients') {
        setClients(Object.keys(data.clients));  
      }
      if (data.type === 'list_groups') {
        console.log("Groups received:", data.groups);  
        setGroups(data.groups);  
      }
      if (data.type === 'join_group') {
        setMessage(`You have successfully joined the group: ${data.groupName}`);
      }
      if (data.type === 'create_group') {
        setMessage(`You have successfully created a group: ${data.groupName}`);
      }
      if(data.type === 'create_group_message'){
        setMessage(`Group ${data.groupName} already exists . Kindly join the group . `);
      }
      if(data.type === 'join_group_message'){
        setMessage(`Group ${data.groupName} does not exist.`);
      }
      if(data.type === 'already_group_message'){
        setMessage(`You are already int the Group ${data.groupName} .`);
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

  }, [socket]);



  const handleRoleSelect = (role) => {

    if (role === 'logs') {
      navigate('/server/logs');
    } 
    else if(role === 'dashboard'){
      navigate('/server/dashboard'); 
    }
   
  };
  


  const handleClientChange = (selectedOptions) => {
    setSelectedClients(selectedOptions ? selectedOptions.map(option => option.value) : []);
  };
  

  const handleToggleMusicButton = () => {
     if(socket && socket.readyState === WebSocket.OPEN){
      // Send message to toggle music
      socket.send(JSON.stringify({
        type: 'toggle_music'  // Message type to toggle music
      }));
     }
  };
  

  // Handler for Button 1 click
  const handleButton1Click = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'list_clients' }));
    }
  };

  // Handler for Button 2 click
  const handleButton2Click = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'list_groups' }));
    }
  };


  const handleMessageButtonClick = () =>{
    if (selectedClients) {
      // Send a WebSocket message to join the group
      if (socket) {
        socket.send(JSON.stringify({
          type: 'unicast',
          payload: {
            clientIds : selectedClients ,
            message : typedMessage
          }
        }));
        
      }
    } else {
      setMessage('Please select a client to send message.');
    }

  };

  const handleBroadcastButton = () =>{
      if (socket) {
        socket.send(JSON.stringify({
          type: 'broadcast',
          payload: {
            message : typedMessage
          }
        }));
    } else {
      setMessage('No connected clients.');  
    }
  };

 
  const handleInputChange = (event) => {
    setTypedMessage(event.target.value);
  };

  return{
    message,
    clients,
    groups,
    typedMessage,
    selectedClients,
    handleRoleSelect,
    handleClientChange, 
    handleToggleMusicButton,
    handleButton1Click,
    handleButton2Click,
    handleMessageButtonClick,
    handleBroadcastButton,
    handleInputChange,
  };
};

export default useServer;



