import React, { useState } from 'react';
import './Dashboard.css';
import useDashboard from '../hooks/useDashboard';

const Dashboard = () => {
  const { clients, clientActions, isSequentialRunning ,toggleMusic, toggleRideGrid , toggleAdvertisingPower ,toggleConnectionPower , startTest , stopTest , 
    startTestForAll , stopTestForAll , startSequentialTest , stopSequentialTest} = useDashboard(); 

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedClients , setSelectedClients] = useState([]);
  const [isTestRunningClients ,  setIsTestRunningClients] = useState({});
  const [isTestRunning ,  setIsTestRunning] = useState();

  const handleCheckboxChange = (clientId) => {
    setSelectedClients((prev) =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };
  

  const handleStartStopTest = (clientId) => {
    const isRunning = isTestRunningClients[clientId];
    if (isRunning) {
      stopTest(clientId);
    } else {
      startTest(clientId);
     // logClientAction(clientId, "start_test");
    } 
    setIsTestRunningClients(prev => ({
      ...prev,
      [clientId]: !isRunning,
    }));
  };

const clusterOwnerMap = {};

Object.entries(clients).forEach(([id, clientState]) => {
  if (clientState?.eRideGrid) {
    if (!clusterOwnerMap[clientState.clusterId]) {
      clusterOwnerMap[clientState.clusterId] = id; // First client with eRideGrid ON
    }
  }
}); 
  

  return (

    <div className="dashboard-container">
      {/* Left Panel*/ }
      <div className="sidebar">
        <h2>Clients</h2>
        <div className="button-container">
       <button
       onClick={isSequentialRunning ? stopSequentialTest : startSequentialTest}
         style={{
         backgroundColor: isSequentialRunning ? 'grey' : 'lightblue',
         color: 'white',
         padding: '6px 10px',
         border: 'none',
         borderRadius: '6px',
         cursor: 'pointer',
         fontWeight: 'bold'
         }}
        >
       {isSequentialRunning ? '💣 Stop Sequential Test' : '🎬 Start Sequential Test'}
        </button>



        <button
  onClick={() => {
    const clientIds = Object.keys(clients);
    const randomCount = Math.floor(Math.random() * clientIds.length) + 1; // at least 1
    const shuffled = [...clientIds].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, randomCount);

    selected.forEach((clientId) => {
      startTest(clientId);
      setIsTestRunningClients(prev => ({
        ...prev,
        [clientId]: true,
      }));
    });


    // Optionally update selectedClients state
    setSelectedClients(selected);
  }}
  style={{ backgroundColor: 'violet', marginTop: '10px' }}
>
  🎲 Start Test on Random Clients
</button>




        <button
  onClick={() => {
    const targetClients = selectedClients.length > 0
      ? selectedClients
      : Object.keys(clients); // apply to all if none selected

    targetClients.forEach((clientId) => {
      const isRunning = isTestRunningClients[clientId];
      if (isRunning) {
        stopTest(clientId);
      } else {
        startTest(clientId);
      }
      setIsTestRunningClients(prev => ({
        ...prev,
        [clientId]: !isRunning,
      }));
    });
  }}
  style={{ 
    backgroundColor: (
      (selectedClients.length > 0
        ? selectedClients.every(id => isTestRunningClients[id])
        : Object.keys(clients).every(id => isTestRunningClients[id])
      ) ? 'grey' : 'pink'
    )
  }}
>
  {(selectedClients.length > 0
    ? selectedClients.every(id => isTestRunningClients[id])
    : Object.keys(clients).every(id => isTestRunningClients[id])
  ) ? '💣 Stop Test' : '🏁 Start Test'}
</button>

 </div>



        {Object.entries(clients).map(([id, state]) => (
          <div
            key={id}
            //className={`client-card ${selectedClient === id ? 'active' : ''}`}
            className={`client-card ${selectedClients.includes(id) ? 'active' : ''}`}
            onClick={() => setSelectedClient(id)}
          >
            <input
              type="checkbox"
              checked={selectedClients.includes(id)}
              onClick={(e) => e.stopPropagation()}
              onChange={() => handleCheckboxChange(id)}
            />
            <strong>{id}</strong>
            <p>Battery : {state.batteryPercentage + "%" }</p>
            
            <p>Music: {state.isPlaying ? 'Playing🎵' : 'Paused⏸️'}</p>
            <p>Ridegrid: {state.isOn ? 'On ✅' : 'Off ❌'}</p>
            <p> Low Power  :  
               <Dot  color={state?.lowConnectionPower ? 'red' : 'grey'} />
           </p>
           <p>eRIDEGRID:  
              <Dot color={clusterOwnerMap[state.clusterId] === id ? 'blue' : 'grey'} />
           </p>
          </div>
        ))}
      </div>

      {/* Right panel */ }
     
            
      <div className="details">
        {selectedClient ? (
          <>
            <h2>Client: {selectedClient}</h2>

            <button 
              onClick={() => handleStartStopTest(selectedClient)} 
              style={{ backgroundColor:  isTestRunningClients[selectedClient] || isTestRunning ? 'grey' : 'purple' }}
            >
              {isTestRunningClients[selectedClient] || isTestRunning ? '💣 Stop Test' : 'Start Test'}
            </button>

            <div className="buttons">
              
              <button onClick={() => toggleMusic(selectedClient)}
              style={{ backgroundColor : clients[selectedClient].isPlaying ? 'grey' : 'black'}}
              >
              {clients[selectedClient].isPlaying ? 'Pause music' : 'Play music'}    
              </button>

              <button onClick={() => toggleRideGrid(selectedClient)}
              style={{ backgroundColor : clients[selectedClient].isOn ? 'green' : 'brown'}}
              >
              {clients[selectedClient].isOn ? 'RideGrid ON' : 'RideGrid OFF'}    
              </button>

              <button onClick={() => toggleAdvertisingPower(selectedClient)}
              style={{ backgroundColor : clients[selectedClient].lowAdvertisingPower ? 'orange' : 'grey'}}
              >
              {clients[selectedClient].lowAdvertisingPower ? 'Low Advertising Power ON' : 'Low Advertising Power OFF'}    
              </button>

              <button onClick={() => toggleConnectionPower(selectedClient)}
              style={{ backgroundColor : clients[selectedClient].lowConnectionPower ? 'orange' : 'grey'}}
              >
              {clients[selectedClient].lowConnectionPower ? 'Low Power ON' : 'Low Power OFF'}    
              </button>
              
            </div>

            <p><strong>Battery:</strong> {clients[selectedClient]?.batteryPercentage +"%"}</p>

            {/*<p><strong>Groups:</strong> {clients[selectedClient]?.clientGroups?.length > 0 ? clients[selectedClient].clientGroups.join(', ') : '—'}</p>*/}
            <p><strong>Music:</strong> {clients[selectedClient]?.isPlaying ? 'Playing 🎵' : 'Paused ⏸️'}</p>
            <p><strong>RideGrid:</strong> {clients[selectedClient]?.isOn ? 'On ✅' : 'Off ❌'}</p>
            <p><strong>RideGridEngineState:</strong> {clients[selectedClient]?.ridegridEngineState}</p>
            <p><strong>Cluster Id: </strong>{clients[selectedClient]?.clusterId}</p>

            {/* Display connected nodes */}
      {clients[selectedClient]?.connectedNodes && clients[selectedClient].connectedNodes.length > 0 && (
        <div className="connected-nodes">
          <h3>Connected Nodes:</h3>
          <ul>
            {clients[selectedClient].connectedNodes.map((node, index) => (
              <li key={index}>
                <p><strong>Node ID:</strong> {node.nodeId}</p>
                <p>Name: {node.name}</p>
                <p>MAC Address: {
                  node.macAddress 
                  ? node.macAddress.match(/-?\d+/g)
                  ?.map(n => (parseInt(n) & 0xFF).toString(16).padStart(2, '0'))
                  .join(':') 
                 : 'N/A'
                 }</p>
                <p>Group ID:{node.groupId}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

        <div className="ridegrid-group">
          <h3>RideGrid Group:</h3>
          <ul>
            
                <p>Active Group Id:{clients[selectedClient]?.activeGroupId}</p>
                <p>Active Group Name :{clients[selectedClient]?.activeGroupName}</p>
                <p>eRIDEGRID:  
                  <Dot color={clusterOwnerMap[clients[selectedClient]?.clusterId] === selectedClient ? 'blue' : 'grey'} />
                </p>
             
          </ul>
        </div>


           
          </>
        ) : (
          <div className="placeholder">Select a client to view details</div>
        )}
      </div>
    </div>
  );
};

const Dot = ({ color = 'green', size = 10 }) => (
  <span
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      marginRight: '6px',
    }}
  />
);






export default Dashboard;
