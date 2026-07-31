const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up all foreign key references to Excise stations...');

  const exciseStations = await prisma.police_stations.findMany({
    where: {
      OR: [
        { station_type: 'EXCISE' },
        { name: { contains: 'Excise', mode: 'insensitive' } },
        { ps_code: { startsWith: 'EX-', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${exciseStations.length} Excise stations.`);
  const idsStr = exciseStations.map(s => s.id.toString()).join(',');

  if (idsStr.length > 0) {
    // Reassign core entities
    await prisma.$executeRawUnsafe(`UPDATE users SET police_station_id = NULL WHERE police_station_id IN (${idsStr});`);
    await prisma.$executeRawUnsafe(`UPDATE offenders SET ps_id = 1 WHERE ps_id IN (${idsStr});`);
    await prisma.$executeRawUnsafe(`UPDATE cases SET ps_id = 1 WHERE ps_id IN (${idsStr});`);
    await prisma.$executeRawUnsafe(`UPDATE case_accused SET previous_ps_id = NULL WHERE previous_ps_id IN (${idsStr});`);

    // Dynamically find all tables pointing to police_stations and delete rows referencing Excise stations
    const fkTables = await prisma.$queryRawUnsafe(`
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'police_stations';
    `);

    for (const row of fkTables) {
      if (row.table_name !== 'users' && row.table_name !== 'offenders' && row.table_name !== 'cases') {
        try {
          await prisma.$executeRawUnsafe(`DELETE FROM "${row.table_name}" WHERE "${row.column_name}" IN (${idsStr});`);
          console.log(`Cleaned ${row.table_name}.${row.column_name}`);
        } catch (err) {
          console.log(`Skipped ${row.table_name}.${row.column_name}: ${err.message}`);
        }
      }
    }

    const deleted = await prisma.$executeRawUnsafe(`DELETE FROM police_stations WHERE id IN (${idsStr});`);
    console.log(`Successfully deleted ${deleted} Excise police stations from database.`);
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
