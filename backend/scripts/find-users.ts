import prisma from '../src/config/prisma';

async function listKeyUsers() {
  const users = await prisma.users.findMany({
    select: {
      id: true,
      username: true,
      full_name: true,
      role: true,
      is_active: true,
      failed_login_count: true,
      locked_until: true,
      email: true,
    },
    orderBy: { id: 'asc' }
  });

  console.log('Total users:', users.length);
  const relevant = users.filter(u => 
    ['SP', 'SDPO', 'DSP', 'ADMIN', 'SHO'].includes(u.role) ||
    u.username.includes('sp') ||
    u.username.includes('dsp') ||
    u.username.includes('admin')
  );

  console.log(relevant.map(u => ({ ...u, id: u.id.toString() })));
}

listKeyUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
