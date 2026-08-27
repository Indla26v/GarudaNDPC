import prisma from '../src/config/prisma';

async function topUsers() {
  const users = await prisma.users.findMany({
    where: {
      OR: [
        { role: 'SP' },
        { role: 'ASP' },
        { role: 'SDPO' },
        { role: 'SHO' },
        { role: 'CONSTABLE' },
        { username: { in: ['sp', 'dsp', 'sdpo', 'admin', 'sho'] } }
      ]
    },
    select: {
      id: true,
      username: true,
      full_name: true,
      role: true,
      failed_login_count: true,
      locked_until: true,
      is_active: true,
      email: true
    }
  });

  console.log(users.map(u => ({ ...u, id: u.id.toString() })));
}

topUsers().catch(console.error).finally(() => prisma.$disconnect());
