// config/db.js
const mysql = require("mysql2");
require('dotenv').config(); // load environment variables from .env

// ✅ Create a connection pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,        // Railway DB host
  user: process.env.DB_USER,        // Railway DB user
  password: process.env.DB_PASSWORD,// Railway DB password
  database: process.env.DB_NAME,    // Railway DB name
  port: process.env.DB_PORT || 3306,// Railway DB port (default 3306)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ Export promise-based pool for async/await usage
const db = pool.promise();

module.exports = db;
