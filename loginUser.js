const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const app = express();
const port = 5502;
const secretKey = crypto.randomBytes(32).toString("hex");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(
  session({
    secret: secretKey, // Change this to a secure random key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

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
        // Create a session and store user data
        req.session.user = {
          userId: results[0].id,
          email: results[0].email,
          username: results[0].username,
          // Add more user data as needed
        };
        console.log("User details stored in session:", req.session.user);
        // User successfully logged in
        res.status(200).json({ message: "Login successful" });
      } else {
        // Invalid credentials
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
