import prisma from '../src/config/prisma';
import bcrypt from 'bcrypt';

async function resetCredentials() {
  console.log('=== Updating and Unlocking Leadership & Master Accounts ===\n');

  const saltRounds = 10;
  const spHash = await bcrypt.hash('Sp@Garuda2026!', saltRounds);
  const dspHash = await bcrypt.hash('Dsp@Garuda2026!', saltRounds);
  const adminHash = await bcrypt.hash('Admin@Garuda2026!', saltRounds);

  // 1. Reset and Unlock SP account
  const spUser = await prisma.users.upsert({
    where: { username: 'sp' },
    update: {
      password_hash: spHash,
      failed_login_count: 0,
      locked_until: null,
      is_active: true,
      must_change_password: false,
      email: 'venkateshindla2612@gmail.com',
      password_changed_at: new Date(),
    },
    create: {
      username: 'sp',
      full_name: 'L. Subbarayudu (SP)',
      role: 'SP',
      department: 'POLICE',
      password_hash: spHash,
      is_active: true,
      must_change_password: false,
      email: 'venkateshindla2612@gmail.com',
    },
  });
  console.log(`[SP Account] Username: "sp" | Password: "Sp@Garuda2026!" | Unlocked: YES (ID: ${spUser.id})`);

  // 2. Reset and Unlock SDPO account
  const sdpoUser = await prisma.users.upsert({
    where: { username: 'sdpo' },
    update: {
      password_hash: dspHash,
      failed_login_count: 0,
      locked_until: null,
      is_active: true,
      must_change_password: false,
      email: 'venkateshindla2612@gmail.com',
      password_changed_at: new Date(),
    },
    create: {
      username: 'sdpo',
      full_name: 'P. Venkatesh (SDPO East)',
      role: 'SDPO',
      department: 'POLICE',
      password_hash: dspHash,
      is_active: true,
      must_change_password: false,
      email: 'venkateshindla2612@gmail.com',
    },
  });
  console.log(`[SDPO Account] Username: "sdpo" | Password: "Dsp@Garuda2026!" | Unlocked: YES (ID: ${sdpoUser.id})`);

  // 3. Create or Reset DSP alias account
  const dspUser = await prisma.users.upsert({
    where: { username: 'dsp' },
    update: {
      password_hash: dspHash,
      failed_login_count: 0,
      locked_until: null,
      is_active: true,
      must_change_password: false,
      email: 'venkateshindla2612@gmail.com',
      password_changed_at: new Date(),
    },
    create: {
      username: 'dsp',
      full_name: 'Deputy Superintendent of Police (DSP)',
      role: 'SDPO',
      department: 'POLICE',
      password_hash: dspHash,
      is_active: true,
      must_change_password: false,
      email: 'venkateshindla2612@gmail.com',
    },
  });
  console.log(`[DSP Account] Username: "dsp" | Password: "Dsp@Garuda2026!" | Unlocked: YES (ID: ${dspUser.id})`);

  // 4. Create Master Administrator Account
  const masterAdmin = await prisma.users.upsert({
    where: { username: 'admin' },
    update: {
      password_hash: adminHash,
      role: 'SP', // SP has top-level super admin access
      failed_login_count: 0,
      locked_until: null,
      is_active: true,
      must_change_password: false,
      email: 'venkateshindla2612@gmail.com',
      password_changed_at: new Date(),
    },
    create: {
      username: 'admin',
      full_name: 'Master System Administrator',
      role: 'SP',
      department: 'POLICE',
      password_hash: adminHash,
      is_active: true,
      must_change_password: false,
      email: 'venkateshindla2612@gmail.com',
    },
  });
  console.log(`[Master Admin Account] Username: "admin" | Password: "Admin@Garuda2026!" | Role: "SP (Super Admin)" | Unlocked: YES (ID: ${masterAdmin.id})`);

  console.log('\n=== Database Credentials Updated Successfully ===');
}

resetCredentials()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
