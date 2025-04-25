import React from 'react';
import useServer from '../hooks/useServer';
import Select from 'react-select';

function ServerPage() {
 
    const {
        message,
        clients,
        groups,
        typedMessage,
        selectedClients,
        handleRoleSelect,
        handleClientChange, 
        handleToggleMusicButton,
        handleButton1Click,
        handleButton2Click,
        handleMessageButtonClick,
        handleBroadcastButton,
        handleInputChange
  } = useServer();

  return (

    <div className="App" style={styles.container}>
      <h1 style={styles.heading}>Server Page</h1>

      <button style={styles.button}onClick={handleToggleMusicButton}>
       Toggle Music on Client
      </button>
      <button onClick={() => handleRoleSelect('logs')}>Show Logs</button>

      <button onClick = {()=> handleRoleSelect('dashboard')}>Dashboard</button>
      

      
  <div style={styles.mainContent}>
    <div style={styles.leftHalf}>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleBroadcastButton}>
          Broadcast Message
         </button>
      </div>   

      
      
      {/* Text Input for typing message */}
      <div style={styles.inputContainer}>
        <input 
          type="text" 
          value={typedMessage} 
          onChange={handleInputChange} 
          placeholder="Type your message... " 
          style={styles.input}
        />
      </div>
      <p style={styles.message}>Typed Message: {typedMessage}</p>
 
       {/* client list dropdown using react select*/} 
       <div style={styles.dropdownContainer} onClick={handleButton1Click}>
          <Select
            isMulti
            value={selectedClients.map(client => ({ value: client, label: client }))}           
            onChange={handleClientChange}
            options={clients.map(client => ({ value: client, label: client }))}
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            placeholder="Select clients"
          />
        </div>


      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleMessageButtonClick}>
          Send Message
         </button>
      
  

    
      <div style={styles.buttonContainer}>
        
        {/* list client button */}
        <button style={styles.button} onClick={handleButton1Click}>
          List Clients
         
        </button>

        {/* list groups button */ }
        <button style={styles.button} onClick={handleButton2Click}>
          List Groups
        </button>      
      

      

      </div>
    </div>
    
    </div>
         

    <div style={styles.rightHalf}>
    <div >

      {/* Display the result message */}
      <h2><p style={styles.message}>{message}</p></h2>


      {/* Separate sections for displaying clients and groups */}
      <div style={styles.listContainer}>
        <h3>Clients List:</h3>
        <ul>
          {clients.length > 0 ? (
            clients.map((clientId) => <li key={clientId}>{clientId}</li>)
          ) : (
            <p></p>
          )}
        </ul>
      </div>
      

      <div style={styles.listContainer}>
       <h3>Groups List:</h3>
        <ul>
          {Object.entries(groups).length > 0 ? (
            Object.entries(groups).map(([groupId, clients]) => (
              <li key={groupId}>
                <strong>{groupId}</strong>:
                <ul>
                  {clients.length > 0 ? (
                    clients.map((client, index) => <li key={index}>{client}</li>)
                  ) : (
                    <p></p>
                  )}
                </ul>
              </li>
            ))
          ) : (
            <p></p>
          )}
        </ul>

      
    </div>
      </div>
     </div> 
    </div>
    </div>
    
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    color: '#333',
  },
  mainContent: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '5px',
  },
  leftHalf: {
    width: '50%',
    padding: '50px',
    backgroundColor: '#f0f0f0',
    borderRadius: '30px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  rightHalf: {
    width: '50%',
    padding: '150px',
    backgroundColor: '#f9f9f9',
    borderRadius: '30px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  dropdownContainer: {
    margin: '20px 0',
  },
  dropdown: {
    padding: '10px',
    fontSize: '16px',
    width: '200px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  buttonContainer: {
    margin: '20px',
  },
  toggleButton: {
    margin: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
    color: 'white',
    border: 'none',
    outline: 'none',
  },
  blackbutton: {
    margin: '10px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
    backgroundColor: '#000000',
    color: 'white',
    border: 'none',
    outline: 'none',
  },
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
  inputContainer: {
    margin: '20px 0',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    width: '300px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    outline: 'none',
  },
  message: {
    marginTop: '20px',
    fontSize: '18px',
    color: '#555',
  },
};

export default ServerPage;
