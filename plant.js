const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const port = 5503;

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

// API endpoint for plant search
app.get("/searchPlants", async (req, res) => {
  const searchTerm = req.query.searchTerm;

  // Perform a search in your database based on the searchTerm
  // Return the matching results as JSON
  // Modify this part according to your database schema and search logic

  const sql = "SELECT * FROM Plants WHERE common_name LIKE ?";
  try {
    const searchResult = await connection
      .promise()
      .execute(sql, [`%${searchTerm}%`]);
    res.json({ plants: searchResult[0] });
  } catch (error) {
    console.error("Error searching plants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/getPlantDetails", async (req, res) => {
  const plantId = req.query.plantId;

  if (!plantId) {
    return res.status(400).json({ error: "Plant ID not provided" });
  }

  try {
    // Assuming you have a function to get plant details by ID
    const plantDetails = await getPlantDetailsById(plantId);

    if (!plantDetails) {
      return res.status(404).json({ error: "Plant not found" });
    }

    // Send the detailed plant information
    res.json({ plant: plantDetails });
  } catch (error) {
    console.error("Error fetching plant details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to get plant details by ID
// Function to get plant details by ID
async function getPlantDetailsById(plantId) {
  // Assuming you have a function to execute a query
  const query = "SELECT * FROM plants WHERE p_id = ?";
  const params = [plantId];

  try {
    const [rows] = await connection.promise().execute(query, params);

    if (rows && rows.length > 0) {
      // Modify the result to include the image URL
      const plantDetails = {
        p_id: rows[0].p_id,
        common_name: rows[0].common_name,
        scientific_name: rows[0].scientific_name,
        cycle: rows[0].cycle,
        watering: rows[0].watering,
        sunlight: rows[0].sunlight,
        image_url: rows[0].image_url, // Include image URL
      };

      return plantDetails;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error executing query:", error);

    // Log additional information
    console.log("Query:", query);
    console.log("Params:", params);

    throw error;
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
