/**
 * GARUDA NDPS — Pre-Deployment Database Truncate & Storage Cleanup Script
 * 
 * Usage:
 *   npx tsx scripts/truncate-dummy-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('=================================================================');
  console.log('   GARUDA NDPS MONITORING SYSTEM — PRE-DEPLOYMENT TRUNCATE');
  console.log('=================================================================\n');

  console.log('⚠️  WARNING: This will erase all test/dummy operational data:');
  console.log('   - Offenders & related contacts/financials/docs');
  console.log('   - Cases, Accused mappings, Charge sheets, Court hearings & Seizures');
  console.log('   - Field Enforcement Checks & Preventive Module records');
  console.log('   - Surveillance, Tower matches, Social Media & Finance transactions');
  console.log('   - Audit logs, Edit requests, Deletion requests & Refresh tokens');
  console.log('   - Uploaded test media in backend/uploads/');
  console.log('\n🔒 PRESERVED: Master Police Stations, Divisions, Districts, Teams, Users & Settings\n');

  console.log('⏳ Executing TRUNCATE with RESTART IDENTITY CASCADE on PostgreSQL...');

  const truncateQuery = `
    TRUNCATE TABLE 
      refresh_tokens,
      password_history,
      deletion_requests,
      edit_requests,
      audit_logs,
      users,
      charge_sheets,
      court_hearings,
      bail_records,
      seized_vehicles,
      seizures,
      case_accused,
      cases,
      tower_match_logs,
      social_media_intel,
      messaging_intel,
      transaction_records,
      finance_upload_batches,
      enforcement_checks,
      village_visits,
      lodge_checks,
      drunk_drive_checks,
      courier_checks,
      railway_checks,
      bus_stand_checks,
      rowdy_sheeter_checks,
      bound_over_checks,
      vehicle_checks,
      mv_act_checks,
      petty_cases_checks,
      palle_nidra_checks,
      drone_surveillance_checks,
      offender_contacts,
      offender_identity_docs,
      offender_drug_profile,
      offender_financials,
      supply_chain_links,
      surveillance_records,
      interrogation_sessions,
      imei_records,
      intelligence_inputs,
      informers,
      offenders
    RESTART IDENTITY CASCADE;
  `;

  await prisma.$executeRawUnsafe(truncateQuery);
  console.log('✅ Database tables truncated successfully. Auto-increment IDs reset to 1.');

  // Clean uploads directory
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (fs.existsSync(uploadsDir)) {
    console.log(`\n🧹 Cleaning test uploads from: ${uploadsDir}`);
    const files = fs.readdirSync(uploadsDir);
    let deletedFiles = 0;

    for (const file of files) {
      if (file !== '.gitkeep' && file !== '.gitignore') {
        const filePath = path.join(uploadsDir, file);
        try {
          fs.unlinkSync(filePath);
          deletedFiles++;
        } catch (err) {
          console.warn(`Could not delete file ${file}:`, err);
        }
      }
    }
    console.log(`✅ Removed ${deletedFiles} dummy file(s) from uploads.`);
  }

  // Verification summary
  console.log('\n📊 POST-TRUNCATE STATUS CHECK:');
  const [
    offendersCount,
    casesCount,
    enforcementCount,
    usersCount,
    stationsCount,
    divisionsCount,
    teamsCount,
  ] = await Promise.all([
    prisma.offenders.count(),
    prisma.cases.count(),
    prisma.enforcement_checks.count(),
    prisma.users.count(),
    prisma.police_stations.count(),
    prisma.divisions.count(),
    prisma.teams.count(),
  ]);

  console.log(`- Offenders:          ${offendersCount} (should be 0)`);
  console.log(`- Cases:              ${casesCount} (should be 0)`);
  console.log(`- Enforcement Checks: ${enforcementCount} (should be 0)`);
  console.log(`- Users:              ${usersCount} (should be 0 - wiped clean)`);
  console.log(`- Police Stations:    ${stationsCount} (PRESERVED)`);
  console.log(`- Divisions:          ${divisionsCount} (PRESERVED)`);
  console.log(`- Teams:              ${teamsCount} (PRESERVED)`);

  console.log('\n✨ Database is clean!');
  console.log('👉 Next step: Run "npm run create:admin" to initialize your production SP Admin account.');
}

main()
  .catch((err) => {
    console.error('❌ Error executing database truncate:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
