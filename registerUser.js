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

        // Create "before insert" triggers
        createUsernameTrigger();
        createEmailTrigger();

        // Continue with the rest of your code here

        // API endpoint for user registration
        app.post("/register", async (req, res) => {
          const { username, email, password } = req.body;

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

        // Start the server
        app.listen(port, () => {
          console.log(`Server is running on http://localhost:${port}`);
        });
      }
    );
  });
});

// Helper function to create a "before insert" trigger for username
function createUsernameTrigger() {
  const triggerSql = `
    CREATE TRIGGER before_insert_username
    BEFORE INSERT ON users
    FOR EACH ROW
    BEGIN
      DECLARE username_count INT;
      SELECT COUNT(*) INTO username_count FROM users WHERE username = NEW.username;
      IF username_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Username already exists';
      END IF;
    END;
  `;

  connection.query(triggerSql, (err) => {
    if (err) {
      console.error("Error creating username trigger:", err);
    } else {
      console.log("Username trigger created successfully");
    }
  });
}

// Helper function to create a "before insert" trigger for email
function createEmailTrigger() {
  const triggerSql = `
    CREATE TRIGGER before_insert_email
    BEFORE INSERT ON users
    FOR EACH ROW
    BEGIN
      DECLARE email_count INT;
      SELECT COUNT(*) INTO email_count FROM users WHERE email = NEW.email;
      IF email_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Email already exists';
      END IF;
    END;
  `;

  connection.query(triggerSql, (err) => {
    if (err) {
      console.error("Error creating email trigger:", err);
    } else {
      console.log("Email trigger created successfully");
    }
  });
}
