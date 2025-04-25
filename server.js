// server.js

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

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0' ,() => {
    console.log(`WebSocket server is listening on port ${PORT}`);
    logMessage(`Server started on port ${PORT}`);
});