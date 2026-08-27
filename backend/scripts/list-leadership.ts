import prisma from '../src/config/prisma';

async function listUsers() {
  const users = await prisma.users.findMany({
    where: {
      role: { in: ['SP', 'ASP', 'SDPO'] },
    },
    select: {
      id: true,
      username: true,
      full_name: true,
      role: true,
      is_active: true,
      failed_login_count: true,
      locked_until: true,
      email: true,
    }
  });

  console.log('Leadership users:', users.map(u => ({ ...u, id: u.id.toString() })));
}

listUsers().catch(console.error).finally(() => prisma.$disconnect());
