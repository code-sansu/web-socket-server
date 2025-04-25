import React from 'react';
import useClient from '../hooks/useClient';


const ClientPage = () => {
  const {
    message,
     groups,
     typedGroup,
     isPlaying,
     selectedGroup,
     audioRef,
     isOn,
     handleRoleSelect,
     toggleRidegrid,
     toggleMusic,
     handleGroupChange,
     handleButton2Click,
     handleJoinGroup,
     handleButton3Click,
     handleGroupInputChange
  } = useClient(); 

  return (

    <div className="App" style={styles.container}>
      <h1 style={styles.heading}>Client Page</h1>

      
  <div style={styles.mainContent}>
    <div style={styles.leftHalf}>

        {/* Button to toggle music play/pause */}
        <button onClick={() => handleRoleSelect('test')}>Test</button>
     <button style={styles.blackbutton} onClick={toggleMusic}>
        {isPlaying ? 'Pause Music' : 'Play Music'}
      </button>


      {/* Audio element for background music */}
      <audio ref={audioRef} loop>
        <source src="/file_example_MP3_5MG.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
      
      <p style={styles.message}>{isPlaying ? 'Music is playing' : 'Music is paused'}</p>
      
      RideGrid
      <div style={styles.buttonContainer}>
        {/* On/Off Toggle Button */}
        <button 
          style={{
            ...styles.toggleButton,
            backgroundColor: isOn ? 'green' : 'red' 
          }} 
          onClick={toggleRidegrid}
        >
          {isOn ? 'Turn Off' : 'Turn On'}
        </button>
      </div>


        {/* group list dropdown */} 
        <div style={styles.dropdownContainer}>
        <select 
          value={selectedGroup} 
          onChange={handleGroupChange}
          onClick={handleButton2Click}
          style={styles.dropdown}
        >
          <option value="">Select a group</option>
          {Object.entries(groups).map(([groupId, clients]) => (
            <option key={groupId} value={groupId}>
              {groupId} - {clients.length} Clients
            </option>
          ))}
        </select>
      </div> 


      <button 
       style={styles.button} 
       onClick={handleJoinGroup} 
       disabled={!selectedGroup} // Disable if no group is selected
       >
      Join Group
      </button>
      
  

    
      <div style={styles.buttonContainer}>
        

       {/* Text Input for typing message */}
      <div style={styles.inputContainer}>
        <input 
          type="text" 
          value={typedGroup} 
          onChange={handleGroupInputChange} 
          placeholder="Enter name ... " 
          style={styles.input}
        />
      </div> 

      {/* create group button*/}
        <button style={styles.button} onClick={handleButton3Click}>
          Create Group
        </button>
        
       
    </div>
    
    </div>
         

    <div style={styles.rightHalf}>
    <div >

      {/* Display the result message */}
      Notifications:
      <h2><p style={styles.message}>{message}</p></h2>

      
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

export default ClientPage;