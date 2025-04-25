//logServices.js

const fs = require("fs");
const LOG_FILE = "./websocket.log";

// Function to log messages
function logMessage(message) {
    
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; 
    const istTime = new Date(now.getTime() + istOffset);
    
    const formattedTime = istTime.toISOString().replace("T", " ").split(".")[0]; 

    const logMessage = `[${formattedTime} IST] ${message}\n`;

    fs.appendFile(LOG_FILE, `${logMessage}\n`, (err) => {
        if (err) console.error("Error writing to log:", err);
    });
}

// Function to clear logs
function clearLogs(callback) {
    fs.writeFile(LOG_FILE, "", (err) => {
        if (err) {
            console.error("Error clearing logs:", err);
        } else {
            console.log("Logs cleared.");
            if (callback) callback();
        }
    });
}

module.exports = { logMessage, clearLogs };