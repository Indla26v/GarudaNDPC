import request from 'supertest';
import app from '../server';
import prisma from '../config/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

describe('Forgot Password Flow (Gmail SMTP & OTP)', () => {
  const testUsername = 'test_forgot_pw_user';
  const testEmail = 'officer.test@garuda.police.gov.in';
  const initialPassword = 'OldPassword@2026';
  let createdUserId: bigint;

  beforeAll(async () => {
    // Clean up existing if any
    const existing = await prisma.users.findFirst({
      where: {
        OR: [{ username: testUsername }, { email: testEmail }],
      },
    });

    if (existing) {
      await prisma.password_resets.deleteMany({ where: { user_id: existing.id } });
      await prisma.password_history.deleteMany({ where: { user_id: existing.id } });
      await prisma.audit_logs.deleteMany({ where: { user_id: existing.id } });
      await prisma.users.delete({ where: { id: existing.id } });
    }

    // Create a fresh test user
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const user = await prisma.users.create({
      data: {
        username: testUsername,
        email: testEmail,
        password_hash: passwordHash,
        full_name: 'Special Task Force Officer',
        role: 'SHO',
        department: 'POLICE',
        is_active: true,
      },
    });
    createdUserId = user.id;

    // Record initial password in history
    await prisma.password_history.create({
      data: {
        user_id: createdUserId,
        password_hash: passwordHash,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    if (createdUserId) {
      await prisma.password_resets.deleteMany({ where: { user_id: createdUserId } });
      await prisma.password_history.deleteMany({ where: { user_id: createdUserId } });
      await prisma.refresh_tokens.deleteMany({ where: { user_id: createdUserId } });
      await prisma.audit_logs.deleteMany({ where: { user_id: createdUserId } });
      await prisma.users.delete({ where: { id: createdUserId } }).catch(() => {});
    }
  });

  it('should reject OTP request for empty identifier', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password/request')
      .send({ identifier: '' });

    expect(res.status).toBe(400);
  });

  it('should return 404 for unknown username', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password/request')
      .send({ identifier: 'non_existent_officer_xyz' });

    expect(res.status).toBe(404);
  });

  it('should successfully request OTP with username', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password/request')
      .send({ identifier: testUsername });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('maskedEmail');
    expect(res.body.data.maskedEmail).toContain('@garuda.police.gov.in');

    // Verify record in DB
    const resetRecord = await prisma.password_resets.findFirst({
      where: { user_id: createdUserId, used: false },
    });
    expect(resetRecord).not.toBeNull();
    expect(resetRecord?.email).toBe(testEmail);
  });

  it('should reject OTP verification with incorrect code', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password/verify-otp')
      .send({ identifier: testUsername, otp: '000000' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Invalid verification code');
  });

  it('should verify OTP and return reset token with valid code', async () => {
    // Seed a known OTP
    const knownOtp = '742918';
    const otpHash = await bcrypt.hash(knownOtp, 10);
    await prisma.password_resets.updateMany({
      where: { user_id: createdUserId, used: false },
      data: { otp_hash: otpHash },
    });

    const res = await request(app)
      .post('/api/auth/forgot-password/verify-otp')
      .send({ identifier: testUsername, otp: knownOtp });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('resetToken');
    expect(res.body.data.resetToken).toBeTruthy();
  });

  it('should reject reset password if password does not meet policy', async () => {
    // Fetch active reset token
    const record = await prisma.password_resets.findFirst({
      where: { user_id: createdUserId, used: false },
      orderBy: { created_at: 'desc' },
    });
    const token = record?.reset_token;

    const res = await request(app)
      .post('/api/auth/forgot-password/reset')
      .send({
        resetToken: token,
        newPassword: 'weak',
        confirmPassword: 'weak',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('violations');
  });

  it('should reject reset password if new password reuses previous password', async () => {
    const record = await prisma.password_resets.findFirst({
      where: { user_id: createdUserId, used: false },
      orderBy: { created_at: 'desc' },
    });
    const token = record?.reset_token;

    const res = await request(app)
      .post('/api/auth/forgot-password/reset')
      .send({
        resetToken: token,
        newPassword: initialPassword, // Same as old password
        confirmPassword: initialPassword,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('You cannot reuse any of your last');
  });

  it('should successfully reset password with compliant new password', async () => {
    const record = await prisma.password_resets.findFirst({
      where: { user_id: createdUserId, used: false },
      orderBy: { created_at: 'desc' },
    });
    const token = record?.reset_token;
    const compliantNewPassword = 'StrongNewPass@2026';

    const res = await request(app)
      .post('/api/auth/forgot-password/reset')
      .send({
        resetToken: token,
        newPassword: compliantNewPassword,
        confirmPassword: compliantNewPassword,
      });

    expect(res.status).toBe(200);

    // Verify that the reset token is now marked used
    const updatedRecord = await prisma.password_resets.findUnique({
      where: { reset_token: token! },
    });
    expect(updatedRecord?.used).toBe(true);

    // Verify user can now log in with the new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: testUsername,
        password: compliantNewPassword,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.username).toBe(testUsername);
  });
});
