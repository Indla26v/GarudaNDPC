import prisma from '../config/prisma';

async function main() {
  console.log('Finding Excise Police Stations...');
  
  const exciseStations = await prisma.police_stations.findMany({
    where: {
      OR: [
        { station_type: 'EXCISE' },
        { name: { contains: 'Excise', mode: 'insensitive' } },
        { ps_code: { startsWith: 'EX-', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${exciseStations.length} Excise stations:`, exciseStations.map(s => s.name));

  const stationIds = exciseStations.map(s => s.id);

  if (stationIds.length > 0) {
    // 1. Reassign or disassociate users pointing to these stations
    const updatedUsers = await prisma.users.updateMany({
      where: { police_station_id: { in: stationIds } },
      data: { police_station_id: null }
    });
    console.log(`Disassociated ${updatedUsers.count} users from Excise stations.`);

    // 2. Disassociate offenders if any
    const updatedOffenders = await prisma.offenders.updateMany({
      where: { ps_id: { in: stationIds } },
      data: { ps_id: 1 } // fallback to HQ / PS 1
    });
    console.log(`Reassigned ${updatedOffenders.count} offenders from Excise stations.`);

    // 3. Delete cases assigned to excise stations or reassign them
    const updatedCases = await prisma.cases.updateMany({
      where: { ps_id: { in: stationIds } },
      data: { ps_id: 1 }
    });
    console.log(`Reassigned ${updatedCases.count} cases from Excise stations.`);

    // 4. Delete the Excise stations
    const deleted = await prisma.police_stations.deleteMany({
      where: { id: { in: stationIds } }
    });
    console.log(`Successfully deleted ${deleted.count} Excise stations from the DB.`);
  } else {
    console.log('No Excise stations found in the database.');
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error removing Excise stations:', err);
  process.exit(1);
});
