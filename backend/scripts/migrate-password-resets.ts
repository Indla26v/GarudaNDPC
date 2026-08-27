import prisma from '../src/config/prisma';

async function migrate() {
  console.log('Running password_resets schema migration...');
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      email VARCHAR(255) NOT NULL,
      otp_hash VARCHAR(255) NOT NULL,
      reset_token VARCHAR(255) UNIQUE,
      expires_at TIMESTAMP(6) NOT NULL,
      used BOOLEAN DEFAULT false NOT NULL,
      attempts INT DEFAULT 0 NOT NULL,
      created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_pr_user ON password_resets(user_id);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_pr_email ON password_resets(email);`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_pr_token ON password_resets(reset_token);`);

  console.log('password_resets table and indexes created successfully.');
}

migrate()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
