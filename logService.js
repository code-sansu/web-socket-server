const db = require('./db');

async function logStateChanges(clientId, stateObj) {
  const timestamp = new Date();

  const entries = Object.entries(stateObj); // 

  const insertValues = entries.map(([key, value]) => [
    clientId,
    key,
    typeof value === 'object' ? JSON.stringify(value) : String(value),
    timestamp
  ]);
  try {
    await db.query(
      `INSERT INTO client_state_changes (clientId, stateKey, stateValue, timestamp)
       VALUES ?`,
      [insertValues]
    );
    console.log(`✅ Logged ${entries.length} state changes for ${clientId}`);
  } catch (err) {
    console.error('❌ Error logging state changes:', err);
  }
}

module.exports ={logStateChanges};