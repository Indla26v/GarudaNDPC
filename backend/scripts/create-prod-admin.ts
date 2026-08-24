/**
 * GARUDA NDPS — Production Admin Initialization Script
 * 
 * Creates the initial SP (Super Administrator) account for production deployment.
 * Once logged in as SP, you can create all other officer accounts directly from the UI.
 * 
 * Usage:
 *   npx tsx scripts/create-prod-admin.ts
 * 
 * Or with custom credentials:
 *   npx tsx scripts/create-prod-admin.ts <username> <password> <full_name>
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function main() {
  console.log('=================================================================');
  console.log('       GARUDA NDPS — CREATE INITIAL PRODUCTION SP ADMIN');
  console.log('=================================================================\n');

  let username = process.argv[2];
  let password = process.argv[3];
  let fullName = process.argv[4];

  if (!username) {
    username = (await askQuestion('Enter SP Admin Username [default: sp_tirupati]: ')) || 'sp_tirupati';
  }

  if (!password) {
    password = await askQuestion('Enter Strong Password for SP Admin: ');
    if (!password) {
      console.error('❌ Password cannot be empty.');
      process.exit(1);
    }
  }

  if (!fullName) {
    fullName = (await askQuestion('Enter Officer Full Name [default: Superintendent of Police, Tirupati]: ')) || 'Superintendent of Police, Tirupati';
  }

  console.log(`\n⏳ Creating production SP Admin account: "${username}"...`);

  const passwordHash = await bcrypt.hash(password, 12);

  // Check if username already exists
  const existing = await prisma.users.findUnique({ where: { username } });

  let user;
  if (existing) {
    user = await prisma.users.update({
      where: { username },
      data: {
        password_hash: passwordHash,
        full_name: fullName,
        role: 'SP',
        department: 'POLICE',
        district: 'Tirupati',
        is_active: true,
      },
    });
    console.log(`✅ Updated existing account: ${username}`);
  } else {
    user = await prisma.users.create({
      data: {
        username,
        password_hash: passwordHash,
        full_name: fullName,
        role: 'SP',
        department: 'POLICE',
        district: 'Tirupati',
        is_active: true,
      },
    });
    console.log(`✅ SP Admin account successfully created with ID: ${user.id}`);
  }

  // Record initial password history
  await prisma.password_history.create({
    data: {
      user_id: user.id,
      password_hash: passwordHash,
    },
  });

  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('  PRODUCTION SP ADMIN READY');
  console.log('═════════════════════════════════════════════════════════════════');
  console.log(`  Username:   ${username}`);
  console.log(`  Role:       SP (District Administrator)`);
  console.log(`  Department: POLICE`);
  console.log(`  District:   Tirupati`);
  console.log('═════════════════════════════════════════════════════════════════');
  console.log('\n🔒 Next Step: Log in as this SP account on production, navigate to');
  console.log('   "User Management" (Admin Panel), and create official station SHO accounts.');
}

main()
  .catch((err) => {
    console.error('❌ Failed to create admin account:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
