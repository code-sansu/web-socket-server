const WebSocket = require("ws");

const SERVER_URL = "ws://localhost:3000"; // Change URL if needed
const CLIENT_COUNT = 5; // Number of clients to simulate

const clients = [];

for (let i = 1; i <= CLIENT_COUNT; i++) {
    const ws = new WebSocket(SERVER_URL);
    let clientId = null; // Store assigned client ID

    ws.on("open", () => {
        console.log(`Client connected. Waiting for ID...`);
    });

    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "ack") {
                clientId = data.clientId; // ✅ Store the assigned ID
                console.log(`✅ Client ${clientId} connected successfully.`);
            } else if (data.type === "pong") {
                console.log(`🔄 Client ${clientId} received: ${message}`);
            }
        } catch (error) {
            console.error("❌ Error processing message:", error);
        }
    });

    // Send ping messages only after receiving clientId
    const sendPing = () => {
        if (clientId) {
            const message = JSON.stringify({ type: "ping", clientId });
            ws.send(message);
            console.log(`Client ${clientId} sent: ping`);
        } else {
            console.log("⏳ Waiting for clientId before sending ping...");
        }
    };

    setInterval(sendPing, 5000);

    ws.on("close", (code, reason) => {
        console.log(`Client ${clientId} disconnected | Code: ${code}, Reason: ${reason}`);
    });

    ws.on("error", (error) => {
        console.error(`Client ${clientId} error:`, error.message);
    });

    clients.push(ws);
}