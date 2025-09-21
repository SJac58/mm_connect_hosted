// config/db.js
const mysql = require("mysql2");
require("dotenv").config(); // load environment variables

// Create a connection pool using Railway environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,        // matches your .env
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export promise-based pool for async/await usage
const db = pool.promise();

module.exports = db;
