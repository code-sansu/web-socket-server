// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',           // your username
  password: 'password',  // your password
  database: 'client_logs_db'
});

module.exports = pool;