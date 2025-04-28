const WebSocket = require("ws");
const express = require('express');
const http = require('http');
const path = require('path');

const { handleConnection } = require("./Services/websocketServices.js");
const { logMessage } = require("./Services/logServices.js");

const app = express();
const server = http.createServer(app);

// Serve static files from client/dist
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Fallback: serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Create WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on("connection", (ws) => handleConnection(ws, wss));

// Listen on environment port or 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  logMessage(`Server started on port ${PORT}`);
});


/*
const WebSocket = require("ws");
const http = require('http');
const { handleConnection } = require("./Services/websocketServices.js");
const { logMessage } = require("./Services/logServices.js");


const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running.');
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => handleConnection(ws, wss));

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0" , () => {
    console.log(`WebSocket server is listening on port ${PORT}`);
    logMessage(`Server started on port ${PORT}`);
});
*/