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
  password: "root", // Replace with your MySQL password
  database: "plant_care",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// API endpoint for user registration
// Inside the registration endpoint in registerUser.js
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
  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  connection.query(sql, [username, email, hashedPassword], (err, results) => {
    if (err) {
      console.error("Error inserting user:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    console.log("User registered successfully");
    return res.status(200).json({ message: "User registered successfully" });
  });
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

// API endpoint for user login
// ... (previous code)

// API endpoint for user login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Retrieve hashed password from the database
  const sql = "SELECT * FROM users WHERE email = ?";
  connection.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Error checking user credentials:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (results.length === 0) {
      // User not found or invalid credentials
      res.status(401).json({ error: "Invalid credentials" });
    } else {
      const hashedPassword = results[0].password;

      // Compare the provided password with the hashed password
      const passwordMatch = await bcrypt.compare(password, hashedPassword);

      if (passwordMatch) {
        // User successfully logged in
        res.status(200).json({ message: "Login successful" });
      } else {
        // Invalid credentials
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  });
});

// ... (other code)

// ... (rest of the code)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
