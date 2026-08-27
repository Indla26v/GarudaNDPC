import prisma from '../src/config/prisma';

async function main() {
  const user = await prisma.users.update({
    where: { username: 'sp' },
    data: { email: 'sp.tirupati@police.gov.in' },
  });
  console.log(`Updated user ${user.username} email to: ${user.email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
