import React, { useState, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from './context/WebSocketContext';

const LogsPage = () => {
  const { socket } = useWebSocket(); // 🔥 Use shared socket!
  const navigate = useNavigate();

  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'logs') {
        setLogs(data.content);
        setLoading(false);
      }
    };

    // Optional cleanup (not closing the socket — provider handles that)
    return () => {
      if (socket) {
        socket.onmessage = null; // just detach the listener
      }
    };
  }, [socket]);

  const handleSampleSelect = () => {
    navigate('/server/logs/sample');
  };

  const handleClearLogsButton = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'clear_logs' }));
    }
  };

  return (
    <div>
      <h1>WebSocket Logs</h1>
      <button style={styles.button} onClick={handleClearLogsButton}>
        Clear Logs
      </button>
      <button onClick={handleSampleSelect}>Sample</button>
      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {logs}
        </pre>
      )}
    </div>
  );
};

const styles = {
  button: {
    margin: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
    backgroundColor: '#0000FF',
    color: 'white',
    border: 'none',
    outline: 'none',
    transition: 'background-color 0.3s, opacity 0.3s',
  },
};

export default LogsPage;
