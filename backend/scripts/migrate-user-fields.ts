import prisma from '../src/config/prisma';

async function migrate() {
  console.log('Running user schema migration...');
  await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);`);
  await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);`);
  await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;`);
  
  // Set existing users to false if they already have last_login or password_changed_at, or keep as desired
  console.log('Migration completed successfully.');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
