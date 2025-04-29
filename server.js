/*
const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const http = require('http');
const { handleConnection } = require("./Services/websocketServices.js");
const { logMessage } = require("./Services/logServices.js");

const app = express();

// Serve static files from the React app (assuming the build is inside 'client/build')
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle WebSocket connections
const server = http.createServer(app); // Use the same server instance for both Express and WebSocket

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => handleConnection(ws, wss));

// Catch-all handler for all routes to return the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
  logMessage(`Server started on port ${PORT}`);
});
*/

const WebSocket = require("ws");
const http = require('http');
const { handleConnection } = require("./Services/websocketServices.js");
const { logMessage } = require("./Services/logServices.js");


const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running.');
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  handleConnection(ws, wss);

  // Ping the client every 30 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping(); // Send ping to client
    }
  }, 30000);

  // Listen for pong from the client (acknowledging the ping)
  ws.on('pong', () => {
    console.log('Pong received from client');
  });

  // If the client disconnects, clear the ping interval
  ws.on('close', () => {
    clearInterval(interval);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0" , () => {
    console.log(`WebSocket server is listening on port ${PORT}`);
    logMessage(`Server started on port ${PORT}`);
});
