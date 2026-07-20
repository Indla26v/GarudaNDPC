require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log("Connected to DB");
    
    // Rename BAILED to ON_BAIL
    try {
      await client.query("ALTER TYPE arrest_status RENAME VALUE 'BAILED' TO 'ON_BAIL';");
      console.log("Renamed BAILED to ON_BAIL in arrest_status enum");
    } catch(e) { 
      console.log("Rename BAILED failed (might have already been run):", e.message); 
    }

    // Rename ARRESTED to POLICE_CUSTODY
    try {
      await client.query("ALTER TYPE arrest_status RENAME VALUE 'ARRESTED' TO 'POLICE_CUSTODY';");
      console.log("Renamed ARRESTED to POLICE_CUSTODY in arrest_status enum");
    } catch(e) { 
      console.log("Rename ARRESTED failed (might have already been run):", e.message); 
    }
    
    // Add JUDICIAL_CUSTODY
    try {
      await client.query("ALTER TYPE arrest_status ADD VALUE 'JUDICIAL_CUSTODY';");
      console.log("Added JUDICIAL_CUSTODY to arrest_status enum");
    } catch(e) { 
      console.log("Add JUDICIAL_CUSTODY failed (might already exist):", e.message); 
    }

    // Add RELEASED
    try {
      await client.query("ALTER TYPE arrest_status ADD VALUE 'RELEASED';");
      console.log("Added RELEASED to arrest_status enum");
    } catch(e) { 
      console.log("Add RELEASED failed (might already exist):", e.message); 
    }

    // Update column default to POLICE_CUSTODY
    try {
      await client.query("ALTER TABLE case_accused ALTER COLUMN arrest_status SET DEFAULT 'POLICE_CUSTODY';");
      console.log("Updated case_accused.arrest_status column default to POLICE_CUSTODY");
    } catch(e) { 
      console.log("Update default column value failed:", e.message); 
    }

    console.log("Enum upgrade completed successfully!");
  } catch(e) {
    console.error("Migration script error:", e);
  } finally {
    await client.end();
  }
}

run();
