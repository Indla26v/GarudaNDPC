const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Finding Excise Officers / Users...');

  const exciseUsers = await prisma.users.findMany({
    where: {
      OR: [
        { department: 'EXCISE' },
        { username: { startsWith: 'ex-', mode: 'insensitive' } },
        { username: { contains: 'excise', mode: 'insensitive' } },
        { full_name: { contains: 'Excise', mode: 'insensitive' } }
      ]
    }
  });

  console.log(`Found ${exciseUsers.length} Excise officers/users.`);

  const userIds = exciseUsers.map(u => u.id);
  const userIdsStr = userIds.map(id => id.toString()).join(',');

  if (userIds.length > 0) {
    // Dynamically find all foreign keys pointing to users and set to NULL or 1
    const fkTables = await prisma.$queryRawUnsafe(`
      SELECT tc.table_name, kcu.column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users';
    `);

    for (const row of fkTables) {
      try {
        await prisma.$executeRawUnsafe(`UPDATE "${row.table_name}" SET "${row.column_name}" = NULL WHERE "${row.column_name}" IN (${userIdsStr});`);
        console.log(`Cleaned FK ${row.table_name}.${row.column_name}`);
      } catch (err) {
        console.log(`Skipped ${row.table_name}.${row.column_name}: ${err.message}`);
      }
    }

    const deletedCount = await prisma.$executeRawUnsafe(`DELETE FROM users WHERE id IN (${userIdsStr});`);
    console.log(`Successfully deleted ${deletedCount} Excise officers/users from database.`);
  } else {
    console.log('No Excise officers/users found in database.');
  }

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error removing Excise users:', err);
  process.exit(1);
});
