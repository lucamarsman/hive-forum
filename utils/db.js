const mysql = require("mysql2");

// Create DB connection using env vars
const db = mysql.createConnection({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "hive",
  password: process.env.DB_PASSWORD || "hivepassword",
  database: process.env.DB_NAME || "hive_forum",
  port: process.env.DB_PORT || 3306,
});

// Connect
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("Database connected");
});

module.exports = db;
