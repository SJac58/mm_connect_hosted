const mysql = require("mysql2");
require("dotenv").config();
const fs = require("fs");

// Read your SQL dump
const sql = fs.readFileSync("mentor_mentee_db.sql", "utf8");

// Connect to Railway MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true // allows running all queries in dump
});

connection.connect(err => {
  if (err) {
    console.error("❌ Connection error:", err);
    return;
  }
  console.log("✅ Connected to Railway DB");

  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Error importing dump:", err);
      return;
    }
    console.log("✅ Database imported successfully!");
    connection.end();
  });
});
