import dotenv from 'dotenv';
dotenv.config();
import { Client } from 'pg';

async function check() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res1 = await client.query("SELECT enum_range(NULL::record_approval_status);");
  console.log('record_approval_status:', res1.rows[0]);
  const res2 = await client.query("SELECT enum_range(NULL::edit_request_status);");
  console.log('edit_request_status:', res2.rows[0]);
  const res3 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cases' AND column_name IN ('approval_status', 'approval_notes', 'review_notes');");
  console.log('cases cols:', res3.rows);
  const res4 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'offenders' AND column_name IN ('approval_status', 'approval_notes', 'review_notes');");
  console.log('offenders cols:', res4.rows);
  await client.end();
}

check().catch(console.error);
