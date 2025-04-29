

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

