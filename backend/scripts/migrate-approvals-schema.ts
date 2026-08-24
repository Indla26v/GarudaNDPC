import dotenv from 'dotenv';
dotenv.config();
import { Client } from 'pg';

async function migrate() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to Database');

    // 1. Add CHANGES_REQUESTED to record_approval_status enum if not already present
    try {
      await client.query("ALTER TYPE record_approval_status ADD VALUE IF NOT EXISTS 'CHANGES_REQUESTED';");
      console.log("Added CHANGES_REQUESTED to record_approval_status");
    } catch (e: any) {
      console.log('record_approval_status alter error/notice:', e.message);
    }

    // 2. Add CHANGES_REQUESTED to edit_request_status enum if not already present
    try {
      await client.query("ALTER TYPE edit_request_status ADD VALUE IF NOT EXISTS 'CHANGES_REQUESTED';");
      console.log("Added CHANGES_REQUESTED to edit_request_status");
    } catch (e: any) {
      console.log('edit_request_status alter error/notice:', e.message);
    }

    // 3. Add approval_notes to cases table
    try {
      await client.query("ALTER TABLE cases ADD COLUMN IF NOT EXISTS approval_notes TEXT;");
      console.log("Added approval_notes column to cases table");
    } catch (e: any) {
      console.log('cases alter column error/notice:', e.message);
    }

    // 4. Add approval_notes to offenders table
    try {
      await client.query("ALTER TABLE offenders ADD COLUMN IF NOT EXISTS approval_notes TEXT;");
      console.log("Added approval_notes column to offenders table");
    } catch (e: any) {
      console.log('offenders alter column error/notice:', e.message);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

migrate();
