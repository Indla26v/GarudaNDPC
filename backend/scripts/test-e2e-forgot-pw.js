async function testE2E() {
  const BASE_URL = 'http://127.0.0.1:8081/api';

  console.log('Testing Forgot Password API against running backend at:', BASE_URL);

  // Step 1: Request OTP
  console.log('\n--- 1. Requesting OTP for user "sp" ---');
  const reqRes = await fetch(`${BASE_URL}/auth/forgot-password/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'sp' }),
  });
  const reqData = await reqRes.json();
  console.log('Request Status:', reqRes.status, reqData);

  // Step 2: Fetch latest OTP from database for testing verification
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const resetRecord = await prisma.password_resets.findFirst({
    where: { used: false },
    orderBy: { created_at: 'desc' },
    include: { users: true },
  });

  console.log('\n--- 2. Database Record Created ---');
  console.log('User ID:', resetRecord?.user_id?.toString());
  console.log('Email:', resetRecord?.email);
  console.log('Expires At:', resetRecord?.expires_at);

  // Set known OTP hash so we can verify with certainty
  const bcrypt = require('bcrypt');
  const testOtp = '654321';
  const testHash = await bcrypt.hash(testOtp, 10);
  await prisma.password_resets.update({
    where: { id: resetRecord.id },
    data: { otp_hash: testHash },
  });

  // Step 3: Verify OTP
  console.log('\n--- 3. Verifying OTP ---');
  const verifyRes = await fetch(`${BASE_URL}/auth/forgot-password/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'sp', otp: testOtp }),
  });
  const verifyData = await verifyRes.json();
  console.log('Verify Status:', verifyRes.status, verifyData);
  const resetToken = verifyData.data.resetToken;

  // Step 4: Reset Password
  console.log('\n--- 4. Resetting Password with Compliant Password ---');
  const newPassword = 'GarudaPolice@2026';
  const resetRes = await fetch(`${BASE_URL}/auth/forgot-password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resetToken,
      newPassword,
      confirmPassword: newPassword,
    }),
  });
  const resetData = await resetRes.json();
  console.log('Reset Status:', resetRes.status, resetData);

  // Step 5: Test Login with new password
  console.log('\n--- 5. Logging in with new password ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'sp',
      password: newPassword,
    }),
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status, 'Logged in as:', loginData?.data?.username);

  // Reset back to original password for development convenience
  const originalHash = await bcrypt.hash('sp@123', 10);
  await prisma.users.update({
    where: { username: 'sp' },
    data: { password_hash: originalHash },
  });
  console.log('\nReset sp password back to original development hash.');
  await prisma.$disconnect();
}

testE2E().catch(console.error);
