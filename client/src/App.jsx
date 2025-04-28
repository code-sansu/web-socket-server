import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import ServerPage from './components/ServerPage';
import ClientPage from './components/ClientPage';
import LogsPage from './LogsPage';
import SamplePage from './SamplePage';
import Dashboard from './components/Dashboard';
import TestPage from './TestPage';
import { WebSocketProvider } from './context/WebSocketContext';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> 

        <Route
          path="/client/*"
          element={
            <WebSocketProvider role="client">
              <Routes>
                <Route path="" element={<ClientPage />} />
                <Route path="test" element={<TestPage />} />
              </Routes>
            </WebSocketProvider>
          }
        />

        <Route
          path="/server/*"
          element={
            <WebSocketProvider role="server">
              <Routes>
                <Route path="" element={<ServerPage />} />
                <Route path="logs" element={<LogsPage />} />
                <Route path="logs/sample" element={<SamplePage />} />
                <Route path="dashboard" element={<Dashboard />} />
              </Routes>
            </WebSocketProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

/*
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';
import ServerPage from './components/ServerPage';
import ClientPage from './components/ClientPage';
import LogsPage from './LogsPage';
import SamplePage from './SamplePage';
import Dashboard from './components/Dashboard';
import TestPage from './TestPage';
import { WebSocketProvider } from './context/WebSocketContext';


function App() {
  return (
 
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} /> 

      <Route
           path="/client/*"
           element={
       <WebSocketProvider role="client">
         <Routes>
          <Route path="" element={<ClientPage />} />
          <Route path="test" element={<TestPage />} />
        </Routes>
       </WebSocketProvider>
        }
       />


      
        <Route
           path="/server/*"
           element={
       <WebSocketProvider role="server">
         <Routes>
          <Route path="" element={<ServerPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="logs/sample" element={<SamplePage />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Routes>
       </WebSocketProvider>
        }
       />


      </Routes>
   
      </Router>    
    
  );
}

export default App;
*/