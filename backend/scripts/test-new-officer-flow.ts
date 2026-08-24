import prisma from '../src/config/prisma';
import bcrypt from 'bcrypt';

async function runTest() {
  console.log('--- TESTING NEW OFFICER & FIRST-TIME LOGIN FLOW ---');
  
  const testUsername = 'test_officer_auto_' + Date.now().toString().slice(-4);
  const initialPassword = 'TempPassword123!';
  const newPassword = 'NewSecretPassword99#';

  // 1. Create officer
  console.log(`[1] Creating officer ${testUsername}...`);
  const passwordHash = await bcrypt.hash(initialPassword, 12);
  const user = await prisma.users.create({
    data: {
      username: testUsername,
      password_hash: passwordHash,
      full_name: 'Test Officer Automation',
      email: 'test.officer@appolice.gov.in',
      phone_number: '9876543210',
      role: 'CONSTABLE',
      department: 'POLICE',
      is_active: true,
      must_change_password: true,
    }
  });
  console.log(`✓ Officer created with ID: ${user.id}, must_change_password: ${user.must_change_password}`);

  // 2. Fetch officer
  console.log('[2] Fetching officer record...');
  const fetched = await prisma.users.findUnique({ where: { id: user.id } });
  console.log(`✓ Stored Email: ${fetched?.email}`);
  console.log(`✓ Stored Phone: ${fetched?.phone_number}`);
  console.log(`✓ Must Change Password: ${fetched?.must_change_password}`);

  if (!fetched?.email || !fetched?.phone_number || fetched?.must_change_password !== true) {
    throw new Error('User record missing email, phone_number, or must_change_password is not true');
  }

  // 3. Simulate first password change
  console.log('[3] Simulating password change on first login...');
  const newHash = await bcrypt.hash(newPassword, 12);
  const updated = await prisma.users.update({
    where: { id: user.id },
    data: {
      password_hash: newHash,
      password_changed_at: new Date(),
      must_change_password: false,
    }
  });

  console.log(`✓ Updated must_change_password: ${updated.must_change_password}`);
  console.log(`✓ Updated password_changed_at: ${updated.password_changed_at}`);

  if (updated.must_change_password !== false || !updated.password_changed_at) {
    throw new Error('Failed to update must_change_password to false');
  }

  // 4. Cleanup
  console.log('[4] Cleaning up test user...');
  await prisma.users.delete({ where: { id: user.id } });
  console.log('✓ Test user cleaned up.');

  console.log('\n>>> ALL AUTOMATED TESTS PASSED SUCCESSFULLY! <<<');
}

runTest()
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
