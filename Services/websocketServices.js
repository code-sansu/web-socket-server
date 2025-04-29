//websocketServices.js
const WebSocket = require("ws");
const path = require('path');
const redis = require("redis");
const fs = require('fs');
const { logMessage , clearLogs } = require("./logServices");
const {logStateChanges} =require ("../logService");
const pathToRegexp = require('path-to-regexp');




//const logFilePath = path.join(__dirname, '..', 'websocket.log');

//const redisClient = redis.createClient();
//redisClient.connect().catch(console.error);

const { createClient } = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://default:Drz9ucmAI41UMpIAy7XDP488vN0ehpXd@redis-14413.crce179.ap-south-1-1.ec2.redns.redis-cloud.com:14413';

const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
    keepAlive: 5000, // optional, sets TCP keepalive
  },
});

// Better visibility
redisClient.on('connect', () => console.log('Redis client connecting...'));
redisClient.on('ready', () => console.log('Redis client ready'));
redisClient.on('reconnecting', () => console.log('Redis client reconnecting...'));
redisClient.on('end', () => console.log('Redis connection closed'));
redisClient.on('error', (err) => console.error('Redis error:', err));

// Connect once
redisClient.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(console.error);

// Periodic ping to avoid idle timeouts (optional but helpful)
setInterval(() => {
  redisClient.ping()
    .then()
    .catch(err => console.error('Ping error:', err));
}, 30000); // 30 seconds


/*
const redisClient = redis.createClient({
  url: redisUrl
});


redisClient.connect()
  .then(() => console.log('Connected to Redis!'))
  .catch(console.error);
*/

async function handleConnection(ws, wss) {
  
    ws.clientId = `client_${Math.random().toString(36).substring(2, 9)}`;



    //websocket Logs
    /*
    const broadcastLogs = () => {
        fs.readFile(logFilePath, 'utf8', (err, data) => {
          if (err) {
            console.error("Error reading log file:", err);
            return;
          }
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'logs', content: data }));
            }
          });
          
        });
      };
      setInterval(broadcastLogs, 5000); 
    */  
    

    

    ws.on("message", async (message) => {
        
        const { type, payload } = JSON.parse(message);
        const data = (type ?? "").toString().trim(); 




        if (type === "admin_command") {
          const { clientId, command } = payload;
        
          // 1. Forward the command to the correct client WebSocket
          wss.clients.forEach((client) => {
            if (client.clientId === clientId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: "command",
                command, // e.g., { action: "toggle_music" }
              }));
            }
          });
        
          // 2. Optional: Optimistically update Redis state (or let client reply back with update_state)
          if (command.action === "toggle_music") {
            const raw = await redisClient.hGet("client_states", clientId);
            if (raw) {
              const currentState = JSON.parse(raw);
              const updated = { ...currentState, isPlaying: !currentState.isPlaying };
              await redisClient.hSet("client_states", clientId, JSON.stringify(updated));
              
              const newState={
                isPlaying: !currentState.isPlaying,
                isOn: currentState.isOn,
                groups:currentState.clientGroups,
                batteryPercentage:currentState.batteryPercentage
              }
              await logStateChanges(clientId, newState  ); 

              // 3. Notify all dashboards (including sender)
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: "client_state_update",
                    clientId,
                    state: updated
                  }));
                }
              });
            }
          }
        
          if (command.action === "toggle_ridegrid") {
            const raw = await redisClient.hGet("client_states", clientId);
            if (raw) {
              const currentState = JSON.parse(raw);
              const updated = { ...currentState, isOn: !currentState.isOn };
              await redisClient.hSet("client_states", clientId, JSON.stringify(updated));
              
              const newState={
                MusicisPlaying: currentState.isPlaying,
                RidegridisOn: !currentState.isOn,
                groups:currentState.clientGroups,
              }
              await logStateChanges(clientId, newState  ); 
              
            }
          } 
        }
        

        if (type === "update_state") {
            const { isPlaying, isOn, clientGroups, clientId , batteryPercentage , ridegridEngineState , connectedNodes ,
              activeGroupId , activeGroupName , eRideGrid , clusterId , lowAdvertisingPower , lowConnectionPower

            } = payload;
            const state = { isPlaying, isOn, clientGroups , batteryPercentage , ridegridEngineState ,  connectedNodes , 
              activeGroupId , activeGroupName , eRideGrid, clusterId , lowAdvertisingPower , lowConnectionPower

            };
          
            await redisClient.hSet("client_states", clientId, JSON.stringify(state));
            console.log(`Updated state for ${clientId}:`, state);
            ws.send(JSON.stringify({type:"client_state_update" , state:state , clientId: ws.clientId}));
          

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                  client.send(JSON.stringify({
                    type: "client_state_update",
                    clientId,
                    state
                  }));
                }
              });
          }

          if (type === "get_states") {
            const allStates = await redisClient.hGetAll("client_states");
            // Parse all JSON strings into real objects
            const parsedStates = {};
            for (const [id, json] of Object.entries(allStates)) {
              parsedStates[id] = JSON.parse(json);
            }
          
            ws.send(JSON.stringify({
              type: "client_states",
              states: parsedStates
            }));
          }
        
        if(type === "action"){
            const { role , clientId: incomingId } = payload;
            if( role === "client"){
               
              

                if (incomingId) {
                    ws.id = incomingId;
                    ws.clientId = incomingId;

                    
                  
                    // converting to IST
                    const now = new Date();
                    const istOffset = 5.5 * 60 * 60 * 1000;
                    const istTime = new Date(now.getTime() + istOffset);
                    const JoiningTime = istTime.toISOString().replace("T", " ").split(".")[0];
                  
                    // Save the client in Redis if not already there
                    const existing = await redisClient.hGet("clients", incomingId);
                    if (!existing) {
                      await redisClient.hSet("clients", incomingId, JSON.stringify({ JoiningTime }));
                      console.log(`Client registered: ${incomingId}`);
                      logMessage(`Client registered: ${incomingId}`);
                      
                      const existingState = await redisClient.hGet("client_states", incomingId);
                      if (!existingState) {
                      const defaultState = { isPlaying: false, isOn: false, clientGroups: [] };
                      await redisClient.hSet("client_states", incomingId, JSON.stringify(defaultState));
                      }

                      const state = await redisClient.hGet("client_states", incomingId);
                      const parsedState = state ? JSON.parse(state) : {};
                      wss.clients.forEach((client) => {
                      if (client.readyState === WebSocket.OPEN) {
                      client.send(JSON.stringify({
                      type: "client_state_update",
                      clientId: incomingId,
                      state: parsedState
                     }));
                    }
                  });
                }

                    
                  }
              }

            else{
                ws.send(JSON.stringify({
                    type: "ack",
                    message: `Welcome, server! Connection successful.`,
                    clientId: ws.id
                }));

                const allStates = await redisClient.hGetAll("client_states");
                const parsedStates = {};
                for (const [id, json] of Object.entries(allStates)) {
                  parsedStates[id] = JSON.parse(json);
                }
              
                ws.send(JSON.stringify({
                  type: "client_states",
                  states: parsedStates
                }));
            }
        }


        if (type === "ping") {
            ws.send(JSON.stringify({ 
                type: "pong", 
                message: "pong from server"
            }));
        }
        
        if(type === "clear_logs") clearLogs();
        
            else if (type === "message") {
            sendToClient(ws , wss , payload.clientId, payload.message);
          } else if (type === "unicast") {
            sendToGroup(ws, wss , payload.clientIds, payload.message , ws.clientId);
          } else if (type === "broadcast") {

            const { message } = payload;

            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify({ type: 'broadcast' , message : message , clientId : ws.clientId }));
                }
              });
          }
          
          else if(type === "toggle_music" ){
            console.log("musci toggled");
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'toggle_music'
                  }));
                }
              });
          }
          else if(type === "toggle_advertising_power" ){
            console.log("musci toggled");
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'toggle_advertising_power'
                  }));
                }
              });
          }
          else if(type === "toggle_connection_power" ){
            console.log("musci toggled");
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'toggle_connection_power'
                  }));
                }
              });
          }

          else if(type === "toggle_ridegrid" ){
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'toggle_ridegrid'
                  }));
                }
              });
          }

          else if(type === "start_test" ){
            console.log("musci toggled");
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'start_test'
                  }));
                }
              });
          }
          else if(type === "stop_test" ){
            console.log("musci toggled");
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'stop_test'
                  }));
                }
              });
          }

        else if (type === "create_group") {
            const { isPlaying, isOn, clientGroups, clientId , groupName } = payload;
            const state = { isPlaying, isOn, clientGroups };
            await redisClient.hSet("client_states", clientId, JSON.stringify(state));
            const members = await redisClient.sMembers(`groups:${groupName}`);
            

            if(groupName === ""){
                return ws.send(JSON.stringify({type: 'empty_group_name'}));

            }
            else if(members.length !== 0) {
                logMessage("server returns group already exists.");
                return ws.send(JSON.stringify({type: 'create_group_message' , groupName: groupName}));
            }
            else{
            await redisClient.sAdd(`groups:${groupName}`, ws.clientId);
            await redisClient.sAdd(`client_groups:${ws.clientId}`, groupName);
            
            const clientGroups = await redisClient.sMembers(`client_groups:${ws.clientId}`);
            ws.send(JSON.stringify({ type: 'create_group', groupName: groupName , clientGroups:clientGroups}));
            logMessage(`client ${ws.clientId} created group ${groupName}`);
            }

        }

        else if(data === "join_group"){
            const { isPlaying, isOn, clientGroups, clientId , groupName } = payload;
            const state = { isPlaying, isOn, clientGroups };
            await redisClient.hSet("client_states", clientId, JSON.stringify(state));

            const members = await redisClient.sMembers(`groups:${groupName}`);
            if (members.length === 0) {
                logMessage("server returns group does not exist");
                return ws.send(JSON.stringify({type: 'join_group_message' , groupName: groupName}));
            }
            const isMember = await redisClient.sIsMember(`groups:${groupName}`, ws.clientId);
            if (isMember) {
                return ws.send(JSON.stringify({type: 'already_group_message' , groupName: groupName}));
            }
            else{ 
            await redisClient.sAdd(`groups:${groupName}`, ws.clientId);
            await redisClient.sAdd(`client_groups:${ws.clientId}`, groupName);

            const clientGroups = await redisClient.sMembers(`client_groups:${ws.clientId}`);
            ws.send(JSON.stringify({ type: 'join_group', groupName: groupName ,clientGroups:clientGroups}));

            logMessage(`clients ${ws.clientId} joined group ${groupName}`);
            }

        } 
        
        else if (data === "list_clients") {
            const clients = await redisClient.hGetAll("clients");
            ws.send(JSON.stringify({
                type: "list_clients",
                clients: clients  
            }));
        
            logMessage(`client ${ws.clientId} fetched list of clients , server returned:${JSON.stringify(clients, null, 2)} `);
        }
        
        
        else if(data === "list_groups"){
            const groupKeys = await redisClient.keys("groups:*"); 
            const result = {};
            for (const groupKey of groupKeys) {
                
                const groupId = groupKey.split(":")[1];       
                const clients = await redisClient.sMembers(groupKey);
                result[groupId] = clients;
            }
            ws.send(JSON.stringify({
                type: "list_groups",
                groups: result  // Sending clients as part of the response
            }));
           
            logMessage(`client ${ws.clientId} fetched list of groups , server returned:${JSON.stringify(result, null, 2)} `);

            
        }
        
        else {
            console.log(`Received from ${ws.clientId}: ${data}`);
            logMessage(`client ${ws.clientId} sent a message : ${data} `);
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ 
                        type: "message", 
                        from: ws.clientId, 
                        content: data 
                    }));
                }
            });
        }
    });
    
    ws.on("close", async (code , reason) => {

        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; 
        const istTime = new Date(now.getTime() + istOffset);
        const leaveTime = istTime.toISOString().replace("T", " ").split(".")[0]; 

        await redisClient.hDel("client_states", ws.clientId)

        // Fetch existing client data
       //const clientData = await redisClient.hGet("clients", clientId);
       //let parsedData = clientData ? JSON.parse(clientData) : {};

    // Add leaveTime to the existing data
      // parsedData.leaveTime = leaveTime;

    // Store updated client data in Redis
        //await redisClient.hSet("clients", clientId, JSON.stringify(parsedData));


        try {
            // Get all groups the client is in
            const clientGroups = await redisClient.sMembers(`client_groups:${ws.clientId}`);
    
            // Remove client from all groups
            for (const group of clientGroups) {
                console.log(`Removing ${ws.clientId} from group: ${group}`); 
                await redisClient.sRem(`groups:${group}`, ws.clientId);
                await redisClient.sRem(`client_groups:${ws.clientId}`, group); 
            }
    
            // Now remove the client entry itself
            await redisClient.del(`client_groups:${ws.clientId}`);
            await redisClient.hDel("clients", ws.clientId);
            console.log(`Client ${ws.clientId} successfully removed from Redis`);
        } catch (error) {
            console.error(`Error during client disconnection: ${error.message}`);
            logMessage(`Error during client disconnection: ${error.message}`);
        }
      

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "client_disconnected",
              clientId: ws.clientId
            }));
          }
        });
        
        
        
       if (code !== 1000 && code !== 1001) { // 1000 = normal closure, 1001 = user navigated away
        console.warn(`Unexpected disconnection detected for client: ${ws.clientId}`);
        logMessage(`Unexpected disconnection detected for client: ${ws.clientId}`);
       }
        else{
            const formattedReason = reason?.toString() || "No reason provided";

        console.log(`Client ${ws.clientId} disconnected at ${leaveTime} | Code: ${code}, Reason: ${formattedReason || "Unknown"}`);
        logMessage(`Client ${ws.clientId} disconnected at ${leaveTime} | Code: ${code}, Reason: ${formattedReason || "Unknown"}`);
        }
    });

    }
    
    
    async function sendToClient(ws ,wss , clientId, message , currClientId) {
    const isConnected = await redisClient.hGet("clients", clientId);

    if (!isConnected) {
        ws.send(`⚠️ Client ${clientId} is not connected.`);
        return;
    }
    wss.clients.forEach((ws) => {
        if (ws.clientId === clientId && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({type : 'unicast' , message : message , clientId : currClientId}));
            console.log(`✅ Message sent to ${clientId}`);
        }
    });
   }



      // Send message to a set of clients (unicast)
      function sendToGroup(ws , wss ,clientIds, message , currClientId) {
        clientIds.forEach((clientId) => {
          sendToClient(ws , wss , clientId, message , currClientId);
        });
      }
    

   
      


    async function cleanup() {
        console.log("\n🔴 Server shutting down... Clearing Redis cache.");
    
            await redisClient.flushDb(); // Clears all data
            await redisClient.quit(); // Disconnect Redis
            console.log("✅ Redis cache cleared and disconnected.");
            process.exit(0);
    }
    
    

    
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("SIGHUP", cleanup); 
    process.on("exit", cleanup);
    


module.exports = { handleConnection };