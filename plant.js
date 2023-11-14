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

// API endpoint for plant details with setup logic
app.get("/getPlantDetails", async (req, res) => {
  const plantId = req.query.plantId;

  if (!plantId) {
    return res.status(400).json({ error: "Plant ID not provided" });
  }

  try {
    // Check if the stored procedure exists
    const checkProcedureQuery =
      "SHOW PROCEDURE STATUS LIKE 'GetPlantDetailsById';";
    const [procedureRows] = await connection
      .promise()
      .query(checkProcedureQuery);
    // const procedureExists = await checkIfProcedureExists("GetPlantDetailsById");

    if (procedureRows.length === 0) {
      // Create the stored procedure
      await createGetPlantDetailsProcedure();
    }

    // Call the stored procedure to get plant details
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

// API endpoint for adding plants to the nursery
// ...

// API endpoint for adding plants to the nursery
app.post("/addToNursery", async (req, res) => {
  const { userId, plantId } = req.body;

  if (!userId || !plantId) {
    return res.status(400).json({ error: "UserID and PlantID are required" });
  }

  try {
    const tableExists = "SHOW table STATUS LIKE 'nursery';";
    const [tableRows] = await connection.promise().query(tableExists);
    // const procedureExists = await checkIfProcedureExists("GetPlantDetailsById");

    if (tableRows.length === 0) {
      // Create the stored procedure
      await createNurseryTable;
    }
    // Check if the nursery table exists
    // const tableExists = await checkIfTableExists("nursery");

    // if (!tableExists) {
    //   // Create the nursery table
    //   await createNurseryTable();
    // }

    // Call the stored procedure to insert into the nursery table
    await insertIntoNursery(userId, plantId);

    res.json({ success: true, message: "Plant added to nursery" });
  } catch (error) {
    console.error("Error adding plant to nursery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to check if a table exists
async function checkIfTableExists(tableName) {
  try {
    const query = `
      SELECT
        COUNT(*)
      FROM
        information_schema.TABLES
      WHERE
        TABLE_SCHEMA = 'plant_care'
        AND TABLE_NAME = ?;
    `;

    const [rows] = await connection.promise().query(query, [tableName]);

    return rows.length > 0 && rows[0][0] > 0;
  } catch (error) {
    console.error("Error checking if table exists:", error);
    throw error;
  }
}

// Function to create the nursery table
async function createNurseryTable() {
  try {
    const createTableQuery = `
      CREATE TABLE nursery (
        UserID INT,
        p_id INT,
        PRIMARY KEY (UserID, p_id),
        FOREIGN KEY (UserID) REFERENCES users(ID),
        FOREIGN KEY (p_id) REFERENCES plants(p_id)
      );
    `;

    // Execute the table creation query
    await connection.promise().query(createTableQuery);
  } catch (error) {
    console.error("Error creating nursery table:", error);
    throw error;
  }
}

// Function to insert into the nursery table using a stored procedure
async function insertIntoNursery(userId, plantId) {
  try {
    const insertProcedure = `
      CREATE PROCEDURE InsertIntoNursery(IN p_userId INT, IN p_plantId INT)
      BEGIN
          INSERT INTO nursery (UserID, p_id)
          VALUES (p_userId, p_plantId);
      END;
    `;

    // Check if the procedure exists
    const checkProcedureQuery =
      "SHOW PROCEDURE STATUS LIKE 'InsertIntoNursery';";
    const [procedureRows] = await connection
      .promise()
      .query(checkProcedureQuery);
    // const procedureExists = await checkIfProcedureExists("GetPlantDetailsById");

    if (procedureRows.length === 0) {
      // Create the stored procedure
      await connection.promise().query(insertProcedure);
    }
    // const procedureExists = await checkIfProcedureExists("InsertIntoNursery");

    // if (!procedureExists) {
    //   // Create the stored procedure
    //   await connection.promise().query(insertProcedure);
    // }

    // Call the stored procedure to insert into the nursery table
    await connection
      .promise()
      .query("CALL InsertIntoNursery(?, ?)", [userId, plantId]);
  } catch (error) {
    console.error("Error inserting into nursery table:", error);
    throw error;
  }
}

// Function to check if a stored procedure exists
// Function to check if a stored procedure exists
async function checkIfProcedureExists(procedureName) {
  try {
    const query = `
      SELECT
        COUNT(*)
      FROM
        information_schema.ROUTINES
      WHERE
        ROUTINE_TYPE = 'PROCEDURE'
        AND ROUTINE_SCHEMA = 'plant_care'
        AND ROUTINE_NAME = ?;
    `;

    const [rows] = await connection.promise().query(query, [procedureName]);

    if (rows.length > 0 && rows[0][0] > 0) {
      return true; // Procedure exists
    } else {
      return false; // Procedure does not exist
    }
  } catch (error) {
    console.error("Error checking if procedure exists:", error);
    throw error;
  }
}

// API endpoint to get plants in the user's nursery
app.get("/getPlantsInNursery", async (req, res) => {
  const userId = req.query.userId; // Assuming you pass the user ID as a query parameter

  if (!userId) {
    return res.status(400).json({ error: "User ID not provided" });
  }

  try {
    const checkProcedureQuery =
      "SHOW PROCEDURE STATUS LIKE 'GetPlantsInNursery';";
    const [procedureRows] = await connection
      .promise()
      .query(checkProcedureQuery);
    // const procedureExists = await checkIfProcedureExists("GetPlantDetailsById");

    if (procedureRows.length === 0) {
      // Create the stored procedure
      await createGetPlantsInNurseryProcedure();
    }
    // Check if the stored procedure exists
    // const procedureExists = await checkIfProcedureExists("GetPlantsInNursery");

    // if (!procedureExists) {
    //     // Create the stored procedure
    //     await createGetPlantsInNurseryProcedure();
    // }

    // Call the stored procedure to get plants in the nursery
    const plantsInNursery = await getPlantsInNursery(userId);

    // Send the plant information
    res.json({ plants: plantsInNursery });
  } catch (error) {
    console.error("Error fetching plants in nursery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to create the stored procedure to get plants in the nursery
async function createGetPlantsInNurseryProcedure() {
  try {
    const getPlantsInNurseryProcedure = `
            CREATE PROCEDURE GetPlantsInNursery(IN p_userId INT)
BEGIN
    SELECT
        plants.p_id,
        plants.common_name
    FROM
        nursery
    JOIN plants ON
        nursery.p_id = plants.p_id
        AND nursery.UserID = p_userId;
END;

        `;

    // Execute the procedure creation query
    await connection.promise().query(getPlantsInNurseryProcedure);
  } catch (error) {
    console.error("Error creating stored procedure:", error);
    throw error;
  }
}

// Function to get plants in the user's nursery using the stored procedure
async function getPlantsInNursery(userId) {
  const query = "CALL GetPlantsInNursery(?)";
  const params = [userId];

  try {
    const [rows] = await connection.promise().query(query, params);

    if (rows.length > 0) {
      const plantsInNursery = rows[0].map((row) => ({
        p_id: row.p_id,
        common_name: row.common_name,
      }));

      return plantsInNursery;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

// Function to create the stored procedure to get plant details by ID
// Function to create the stored procedure to get plant details by ID
async function createGetPlantDetailsProcedure() {
  try {
    const getPlantDetailsProcedure = `
      CREATE PROCEDURE GetPlantDetailsById(IN p_plantId INT)
      BEGIN
          SELECT
              p_id,
              common_name,
              scientific_name,
              cycle,
              watering,
              sunlight,
              image_url
          FROM
              plants
          WHERE
              p_id = p_plantId;
      END;
    `;

    // Execute the procedure creation query
    await connection.promise().query(getPlantDetailsProcedure);
  } catch (error) {
    console.error("Error creating stored procedure:", error);
    throw error;
  }
}

// Function to get plant details by ID using the stored procedure
async function getPlantDetailsById(plantId) {
  const query = "CALL GetPlantDetailsById(?)";
  const params = [plantId];

  try {
    const [rows] = await connection.promise().query(query, params);

    if (rows.length > 0) {
      // Modify the result to include the image URL
      const plantDetails = {
        p_id: rows[0][0].p_id,
        common_name: rows[0][0].common_name,
        scientific_name: rows[0][0].scientific_name,
        cycle: rows[0][0].cycle,
        watering: rows[0][0].watering,
        sunlight: rows[0][0].sunlight,
        image_url: rows[0][0].image_url, // Include image URL
      };

      return plantDetails;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
