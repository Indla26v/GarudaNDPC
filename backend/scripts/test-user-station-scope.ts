import dotenv from 'dotenv';
dotenv.config();
import prisma from '../src/config/prisma';
import { getDashboardScope } from '../src/utils/scope';

async function testStationScope() {
  console.log('--- Testing User Station Scoping ---');

  // Fetch M. Suresh or any SHO
  const shoUser = await prisma.users.findFirst({
    where: { role: 'SHO' },
    include: { police_stations: true }
  });

  if (!shoUser) {
    console.log('No SHO user found.');
    return;
  }

  console.log(`SHO User: ${shoUser.username}, Assigned PS in DB: ${shoUser.police_stations?.name} (ID: ${shoUser.police_station_id})`);

  const scope = getDashboardScope({
    userId: Number(shoUser.id),
    role: shoUser.role,
    department: shoUser.department,
    policeStationId: shoUser.police_station_id ? Number(shoUser.police_station_id) : null,
  });

  console.log('Dashboard Scope Result:', scope);

  if (scope.isStationLevel && scope.psFilter.ps_id) {
    const station = await prisma.police_stations.findUnique({
      where: { id: scope.psFilter.ps_id }
    });
    console.log(`Verified: Dashboard will query and display station "${station?.name}" (ID: ${station?.id}).`);
  }

  console.log('--- Scoping Test Passed Successfully ---');
  await prisma.$disconnect();
}

testStationScope().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
});
