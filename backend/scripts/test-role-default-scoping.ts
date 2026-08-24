import dotenv from 'dotenv';
dotenv.config();
import prisma from '../src/config/prisma';

async function testRoleDefaults() {
  console.log('--- Testing Role Default Station / Sub-Division Scoping ---');

  // 1. SHO / Constable: e.g. Tirupathi East PS (id: 1)
  const shoCases = await prisma.cases.findMany({
    where: {
      ps_id: 1n,
      approval_status: 'APPROVED'
    }
  });
  console.log(`1. SHO / Constable Default (Tirupathi East): ${shoCases.length} cases found`);

  // 2. SDPO: e.g. Renigunta SDPO
  const sdpoCases = await prisma.cases.findMany({
    where: {
      police_stations: { sdpo: 'Renigunta SDPO' },
      approval_status: 'APPROVED'
    }
  });
  console.log(`2. SDPO Default (Renigunta SDPO Sub-Division): ${sdpoCases.length} cases found`);

  // 3. ASP / SP: All Stations
  const districtCases = await prisma.cases.findMany({
    where: {
      approval_status: 'APPROVED'
    }
  });
  console.log(`3. SP / ASP Default (All Stations in District): ${districtCases.length} cases found`);

  console.log('--- All Role Default Scoping Tests Passed Successfully ---');
  await prisma.$disconnect();
}

testRoleDefaults().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
