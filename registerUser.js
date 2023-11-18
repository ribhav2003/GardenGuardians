const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const port = 5501;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "tiger", // Replace with your MySQL password
});

// Create the "plant_care" database if it doesn't exist
connection.query("CREATE DATABASE IF NOT EXISTS plant_care", (err) => {
  if (err) {
    console.error("Error creating database:", err);
    connection.end();
    return;
  }

  console.log("Database 'plant_care' is ready");

  // Connect to the "plant_care" database
  connection.changeUser({ database: "plant_care" }, (err) => {
    if (err) {
      console.error("Error connecting to database:", err);
      connection.end();
      return;
    }

    // Create the "users" table if it doesn't exist
    connection.query(
      "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), email VARCHAR(255), password VARCHAR(255))",
      (err) => {
        if (err) {
          console.error("Error creating users table:", err);
          connection.end();
          return;
        }

        console.log("Table 'users' is ready");

        // Continue with the rest of your code here

        // API endpoint for user registration
        app.post("/register", async (req, res) => {
          const { username, email, password } = req.body;

          // Check if username already exists
          const usernameCheck = await usernameExists(username);
          if (usernameCheck) {
            return res.status(400).json({ error: "Username already exists" });
          }

          // Check if email already exists
          const emailCheck = await emailExists(email);
          if (emailCheck) {
            return res.status(400).json({ error: "Email already exists" });
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert user into the database
          const sql =
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
          connection.query(
            sql,
            [username, email, hashedPassword],
            (err, results) => {
              if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({ error: "Internal Server Error" });
              }

              console.log("User registered successfully");
              return res
                .status(200)
                .json({ message: "User registered successfully" });
            }
          );
        });

        // Helper function to check if a username exists
        function usernameExists(username) {
          return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM users WHERE username = ?";
            connection.query(sql, [username], (err, results) => {
              if (err) {
                reject(err);
              } else {
                resolve(results.length > 0);
              }
            });
          });
        }

        // Helper function to check if an email exists
        function emailExists(email) {
          return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM users WHERE email = ?";
            connection.query(sql, [email], (err, results) => {
              if (err) {
                reject(err);
              } else {
                resolve(results.length > 0);
              }
            });
          });
        }

        // Start the server
        app.listen(port, () => {
          console.log(`Server is running on http://localhost:${port}`);
        });
      }
    );
  });
});
