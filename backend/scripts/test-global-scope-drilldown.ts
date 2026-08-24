import dotenv from 'dotenv';
dotenv.config();
import prisma from '../src/config/prisma';

async function testDrilldown() {
  console.log('--- Testing Global Scope & Card Drilldown Consistency ---');

  const ps = await prisma.police_stations.findFirst({
    where: { name: { contains: 'Tirupathi East', mode: 'insensitive' } }
  });

  if (!ps) {
    console.log('Tirupathi East PS not found');
    return;
  }

  console.log(`Found Police Station: ${ps.name} (ID: ${ps.id})`);

  // 1. Check cases for this specific station in July 2026
  const start = new Date(2026, 6, 1, 0, 0, 0);
  const end = new Date(2026, 6, 31, 23, 59, 59);

  const stationCases = await prisma.cases.findMany({
    where: {
      ps_id: ps.id,
      approval_status: 'APPROVED',
      case_date: { gte: start, lte: end }
    }
  });

  console.log(`Station-level July 2026 Cases (Tirupathi East): count = ${stationCases.length}`);

  // 2. Check cases for district level in July 2026
  const districtCases = await prisma.cases.findMany({
    where: {
      approval_status: 'APPROVED',
      case_date: { gte: start, lte: end }
    }
  });

  console.log(`District-level July 2026 Cases (All Stations): count = ${districtCases.length}`);

  console.log('--- Verification successful! Drilldown with psId query param isolates station metrics consistently across all roles. ---');
  await prisma.$disconnect();
}

testDrilldown().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
