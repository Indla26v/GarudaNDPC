import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { convertBigIntsToNumbers, successResponse } from '../utils/transformers';
import { logAudit } from '../utils/audit-logger';
import { validatePassword } from '../utils/password-policy';
import { checkPasswordHistory, recordPasswordHash } from '../utils/password-history';
import { checkBreachedPassword } from '../utils/breached-password';
import { sendPasswordResetOtpEmail } from '../services/mail.service';

// ── SECURITY FIX #1: No hardcoded fallback — fail-fast if JWT_SECRET is missing
const JWT_KEY = process.env.JWT_SECRET;
if (!JWT_KEY) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is not set. ' +
    'Refusing to start. Set JWT_SECRET in your .env or hosting environment.'
  );
}
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 15;
const PASSWORD_EXPIRY_DAYS = 60; // 2 Months mandatory cycle
const IS_PROD = process.env.NODE_ENV === 'production';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

// ── Helper: Mask email address for privacy (e.g. s****h@gmail.com) ───
function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0] || '';
  const domain = parts[1] || '';
  if (!name || !domain) return email;
  if (name.length <= 2) {
    return `${name.charAt(0)}*@${domain}`;
  }
  return `${name.charAt(0)}${'*'.repeat(name.length - 2)}${name.charAt(name.length - 1)}@${domain}`;
}

export const login = async (req: AuthRequest, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.users.findUnique({
      where: { username },
      include: { current_officer: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(401).json({ message: 'Position seat has been deactivated. Contact your administrator.' });
    }

    if (user.locked_until && new Date() < user.locked_until) {
      return res.status(423).json({ message: 'Account locked. Try again later.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      const failed = (user.failed_login_count || 0) + 1;
      const updateData: { failed_login_count: number; locked_until?: Date } = { failed_login_count: failed };
      if (failed >= MAX_FAILED_LOGINS) {
        updateData.locked_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      }
      await prisma.users.update({ where: { id: user.id }, data: updateData });
      await logAudit('LOGIN', 'USER', user.id, req, 'Login failed');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ── 60-Day (2-Month) Password Expiry Check ──
    const lastChanged = user.password_changed_at || user.created_at;
    const isExpired = Date.now() - new Date(lastChanged).getTime() > PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const mustChangePassword = Boolean(user.must_change_password || isExpired);

    if (mustChangePassword && user.email && EMAIL_REGEX.test(user.email)) {
      // Invalidate existing unused reset requests
      await prisma.password_resets.updateMany({
        where: { user_id: user.id, used: false },
        data: { used: true },
      });

      // Generate 6-digit numeric OTP & reset challenge token
      const otp = crypto.randomInt(100000, 1000000).toString();
      const otpHash = await bcrypt.hash(otp, 10);
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.password_resets.create({
        data: {
          user_id: user.id,
          email: user.email,
          otp_hash: otpHash,
          reset_token: resetToken,
          expires_at: expiresAt,
          used: false,
          attempts: 0,
        },
      });

      // Dispatch renewal OTP to department email
      await sendPasswordResetOtpEmail({
        to: user.email,
        fullName: user.current_officer?.full_name || user.position_label || user.username,
        username: user.username,
        otp,
        expiryMinutes: 10,
        subject: 'GARUDA NDPS — 60-Day Password Security Renewal Code',
        customTitle: '60-Day Password Security Renewal',
        customMessage: 'Your mandatory 60-day (2-month) security password cycle has expired. Please use the verification code below to authorize your password update.',
      });

      await logAudit('LOGIN', 'USER', user.id, req, '60-day password expiry triggered, OTP dispatched');

      return res.json(successResponse({
        passwordExpired: true,
        mustChangePassword: true,
        username: user.username,
        resetToken,
        maskedEmail: maskEmail(user.email),
        expiresInSeconds: 600,
        message: 'Your 60-day password security cycle has expired. A verification code has been sent to your department email to reset your password.',
      }));
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date(), failed_login_count: 0, locked_until: null }
    });

    const officerName = user.current_officer?.full_name || 'Vacant';
    const officerBadge = user.current_officer?.badge_number || null;
    const officerId = user.current_officer ? Number(user.current_officer.id) : null;

    const accessToken = jwt.sign(
      {
        userId: Number(user.id),
        username: user.username,
        positionLabel: user.position_label,
        role: user.role,
        department: user.department,
        policeStationId: user.police_station_id ? Number(user.police_station_id) : null,
        district: user.district || null,
        divisionId: user.division_id || null,
        officerId,
        officerName,
        officerBadge,
      },
      JWT_KEY,
      { expiresIn: '8h' }
    );

    const refreshTokenString = generateRefreshToken();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry

    await prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token: refreshTokenString,
        expiry_date: expiryDate,
        revoked: false
      }
    });

    req.user = { userId: Number(user.id) } as any;
    await logAudit('LOGIN', 'USER', user.id, req);

    const cookieOptions = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    res.cookie('garuda_access_token', accessToken, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000
    });

    res.cookie('garuda_refresh_token', refreshTokenString, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json(successResponse({
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: 8 * 60 * 60,
      username: user.username,
      positionLabel: user.position_label,
      fullName: officerName,
      officerId,
      badgeNumber: officerBadge,
      email: user.email || null,
      phoneNumber: user.phone_number || null,
      role: user.role,
      department: user.department,
      policeStationId: user.police_station_id ? Number(user.police_station_id) : null,
      district: user.district || null,
      divisionId: user.division_id || null,
      mustChangePassword: user.must_change_password ?? false,
      passwordExpiresAt: new Date(new Date(lastChanged).getTime() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refresh = async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  const token = refreshToken || req.cookies?.garuda_refresh_token;

  if (!token) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const record = await prisma.refresh_tokens.findUnique({
      where: { token },
      include: { users: { include: { current_officer: true } } }
    });

    if (!record || record.revoked || record.expiry_date < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = record.users;
    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'User inactive or not found' });
    }

    const officerName = user.current_officer?.full_name || 'Vacant';
    const officerBadge = user.current_officer?.badge_number || null;
    const officerId = user.current_officer ? Number(user.current_officer.id) : null;

    const newAccessToken = jwt.sign(
      {
        userId: Number(user.id),
        username: user.username,
        positionLabel: user.position_label,
        role: user.role,
        department: user.department,
        policeStationId: user.police_station_id ? Number(user.police_station_id) : null,
        district: user.district || null,
        divisionId: user.division_id || null,
        officerId,
        officerName,
        officerBadge,
      },
      JWT_KEY,
      { expiresIn: '8h' }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    res.cookie('garuda_access_token', newAccessToken, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000
    });

    const lastChanged = user.password_changed_at || user.created_at;
    const isExpired = Date.now() - new Date(lastChanged).getTime() > PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    res.json(successResponse({
      accessToken: newAccessToken,
      expiresIn: 8 * 60 * 60,
      username: user.username,
      positionLabel: user.position_label,
      fullName: officerName,
      officerId,
      badgeNumber: officerBadge,
      email: user.email || null,
      phoneNumber: user.phone_number || null,
      role: user.role,
      department: user.department,
      policeStationId: user.police_station_id ? Number(user.police_station_id) : null,
      district: user.district || null,
      divisionId: user.division_id || null,
      mustChangePassword: Boolean(user.must_change_password || isExpired),
      passwordExpiresAt: new Date(new Date(lastChanged).getTime() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    }));
  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken;
    const tokenToRevoke = refreshToken || req.cookies?.garuda_refresh_token;

    if (tokenToRevoke) {
      await prisma.refresh_tokens.updateMany({
        where: { token: tokenToRevoke },
        data: { revoked: true }
      });
    }

    if (req.user!) {
      await logAudit('LOGOUT', 'USER', req.user!.userId, req);
    }

    const cookieOptions = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? ('none' as const) : ('lax' as const),
      path: '/',
    };
    res.clearCookie('garuda_access_token', cookieOptions);
    res.clearCookie('garuda_refresh_token', cookieOptions);

    res.json(successResponse(null, 'Logged out successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(req.user!.userId) },
      include: {
        current_officer: true,
        police_stations: true,
      }
    });
    
    if (!user) {
       return res.status(404).json({ message: 'User not found' });
    }
    
    const { password_hash, ...userWithoutPassword } = user;
    const formattedUser = convertBigIntsToNumbers(userWithoutPassword);
    const lastChanged = user.password_changed_at || user.created_at;
    const isExpired = Date.now() - new Date(lastChanged).getTime() > PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    res.json(successResponse({
      ...formattedUser,
      positionLabel: user.position_label,
      fullName: user.current_officer?.full_name || 'Vacant',
      badgeNumber: user.current_officer?.badge_number || null,
      officerId: user.current_officer ? Number(user.current_officer.id) : null,
      email: user.email || null,
      phoneNumber: user.phone_number || null,
      mustChangePassword: Boolean(user.must_change_password || isExpired),
      passwordExpiresAt: new Date(new Date(lastChanged).getTime() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    }));
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Update own profile (self-service) ─────────────────────────────────
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = BigInt(req.user!.userId);
    const { fullName, badgeNumber, email, phoneNumber } = req.body;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { current_officer: true }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatePositionData: any = {};
    if (email !== undefined) {
      const trimmedEmail = email ? String(email).trim() : null;
      if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
        return res.status(400).json({ message: 'Invalid email address format' });
      }
      updatePositionData.email = trimmedEmail;
    }
    if (phoneNumber !== undefined) {
      const trimmedPhone = phoneNumber ? String(phoneNumber).replace(/[\s\-]/g, '') : null;
      if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
        return res.status(400).json({ message: 'Invalid phone number. Must be a valid 10-digit mobile number' });
      }
      updatePositionData.phone_number = trimmedPhone;
    }

    if (Object.keys(updatePositionData).length > 0) {
      await prisma.users.update({
        where: { id: userId },
        data: updatePositionData,
      });
    }

    // Update officer record
    let updatedOfficer = user.current_officer;
    if (user.current_officer_id && (fullName !== undefined || badgeNumber !== undefined)) {
      const updateOfficerData: any = {};
      if (fullName !== undefined && fullName.trim()) {
        updateOfficerData.full_name = fullName.trim();
      }
      if (badgeNumber !== undefined) {
        updateOfficerData.badge_number = badgeNumber?.trim() || null;
      }
      if (Object.keys(updateOfficerData).length > 0) {
        updatedOfficer = await prisma.officers.update({
          where: { id: user.current_officer_id },
          data: updateOfficerData,
        });
      }
    }

    await logAudit('UPDATE', 'USER', userId, req,
      `Self-service profile update: Position & Officer metadata`);

    const refreshedUser = await prisma.users.findUnique({
      where: { id: userId },
      include: { current_officer: true }
    });

    const { password_hash: _, ...userWithoutPassword } = refreshedUser!;
    const formattedUser = convertBigIntsToNumbers(userWithoutPassword);
    res.json(successResponse({
      ...formattedUser,
      positionLabel: refreshedUser!.position_label,
      fullName: refreshedUser!.current_officer?.full_name || 'Vacant',
      badgeNumber: refreshedUser!.current_officer?.badge_number || null,
      officerId: refreshedUser!.current_officer ? Number(refreshedUser!.current_officer.id) : null,
      email: refreshedUser!.email || null,
      phoneNumber: refreshedUser!.phone_number || null,
      mustChangePassword: refreshedUser!.must_change_password ?? false,
    }, 'Profile updated successfully'));
  } catch (error) {
    console.error('updateMyProfile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Change own password (self-service) ────────────────────────────────
export const changeMyPassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = BigInt(req.user!.userId);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const policyResult = validatePassword(newPassword);
    if (!policyResult.valid) {
      return res.status(400).json({
        message: 'New password does not meet policy requirements',
        violations: policyResult.violations,
      });
    }

    const isSame = await bcrypt.compare(newPassword, user.password_hash);
    if (isSame) {
      return res.status(400).json({ message: 'New password must be different from the current password' });
    }

    const historyCheck = await checkPasswordHistory(userId, newPassword);
    if (historyCheck.reused) {
      return res.status(400).json({ message: historyCheck.message });
    }

    const breachCheck = await checkBreachedPassword(newPassword);
    if (breachCheck.breached) {
      return res.status(400).json({ message: breachCheck.message });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.users.update({
      where: { id: userId },
      data: {
        password_hash: newHash,
        password_changed_at: new Date(),
        must_change_password: false,
      },
    });

    await recordPasswordHash(userId, newHash);
    await logAudit('UPDATE', 'USER', userId, req, 'Self-service password change');

    res.json(successResponse(null, 'Password changed successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Forgot Password: Step 1 - Request OTP via Email ──────────────────
export const requestPasswordReset = async (req: AuthRequest, res: Response) => {
  try {
    const { identifier } = req.body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({ message: 'Username or registered department email is required' });
    }

    const cleanIdentifier = identifier.trim();

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { username: { equals: cleanIdentifier, mode: 'insensitive' } },
          { email: { equals: cleanIdentifier, mode: 'insensitive' } },
        ],
      },
      include: { current_officer: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'No account found with that username or email' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'This position seat has been deactivated. Please contact your administrator.' });
    }

    if (!user.email || !EMAIL_REGEX.test(user.email)) {
      return res.status(400).json({
        message: 'No valid registered department email address is configured for this position. Please contact your administrator.',
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await prisma.password_resets.updateMany({
      where: {
        user_id: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    await prisma.password_resets.create({
      data: {
        user_id: user.id,
        email: user.email,
        otp_hash: otpHash,
        expires_at: expiresAt,
        used: false,
        attempts: 0,
      },
    });

    await sendPasswordResetOtpEmail({
      to: user.email,
      fullName: user.current_officer?.full_name || user.position_label || user.username,
      username: user.username,
      otp,
      expiryMinutes: 10,
    });

    await logAudit('CREATE', 'PASSWORD_RESET', user.id, req, 'Password reset OTP requested');

    return res.json(
      successResponse(
        {
          username: user.username,
          maskedEmail: maskEmail(user.email),
          expiresInSeconds: 600,
        },
        'Password reset code has been sent to your registered department email.'
      )
    );
  } catch (error: any) {
    console.error('requestPasswordReset error:', error);
    return res.status(500).json({ message: error.message || 'Server error while sending reset code' });
  }
};

// ── Forgot Password: Step 2 - Verify OTP & Issue Reset Token ─────────
export const verifyPasswordResetOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || typeof identifier !== 'string' || !otp || typeof otp !== 'string') {
      return res.status(400).json({ message: 'Identifier and OTP code are required' });
    }

    const cleanIdentifier = identifier.trim();
    const cleanOtp = otp.trim();

    const user = await prisma.users.findFirst({
      where: {
        OR: [
          { username: { equals: cleanIdentifier, mode: 'insensitive' } },
          { email: { equals: cleanIdentifier, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetRecord = await prisma.password_resets.findFirst({
      where: {
        user_id: user.id,
        used: false,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!resetRecord) {
      return res.status(400).json({
        message: 'No active password reset request found or the code has expired. Please request a new code.',
      });
    }

    if (resetRecord.attempts >= 5) {
      await prisma.password_resets.update({
        where: { id: resetRecord.id },
        data: { used: true },
      });
      return res.status(429).json({
        message: 'Maximum verification attempts exceeded. Please request a new verification code.',
      });
    }

    const isMatch = await bcrypt.compare(cleanOtp, resetRecord.otp_hash);
    if (!isMatch) {
      const newAttempts = resetRecord.attempts + 1;
      await prisma.password_resets.update({
        where: { id: resetRecord.id },
        data: { attempts: newAttempts },
      });

      const remaining = 5 - newAttempts;
      return res.status(400).json({
        message:
          remaining > 0
            ? `Invalid verification code. ${remaining} attempt(s) remaining.`
            : 'Maximum verification attempts exceeded. Please request a new verification code.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.password_resets.update({
      where: { id: resetRecord.id },
      data: {
        reset_token: resetToken,
        expires_at: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    return res.json(
      successResponse(
        {
          resetToken,
          username: user.username,
        },
        'Verification code confirmed. Please set your new password.'
      )
    );
  } catch (error) {
    console.error('verifyPasswordResetOtp error:', error);
    return res.status(500).json({ message: 'Server error while verifying OTP' });
  }
};

// ── Forgot Password: Step 3 - Reset Password with Token ──────────────
export const resetPasswordWithToken = async (req: AuthRequest, res: Response) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || typeof resetToken !== 'string') {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match' });
    }

    const resetRecord = await prisma.password_resets.findUnique({
      where: { reset_token: resetToken },
      include: { users: { include: { current_officer: true } } },
    });

    if (!resetRecord || resetRecord.used || resetRecord.expires_at < new Date()) {
      return res.status(400).json({
        message: 'Invalid or expired password reset session. Please request a new verification code.',
      });
    }

    const user = resetRecord.users;
    if (!user || !user.is_active) {
      return res.status(403).json({ message: 'User account is inactive or not found.' });
    }

    const policyResult = validatePassword(newPassword);
    if (!policyResult.valid) {
      return res.status(400).json({
        message: 'New password does not meet policy requirements',
        violations: policyResult.violations,
      });
    }

    const historyCheck = await checkPasswordHistory(user.id, newPassword);
    if (historyCheck.reused) {
      return res.status(400).json({ message: historyCheck.message });
    }

    const breachCheck = await checkBreachedPassword(newPassword);
    if (breachCheck.breached) {
      return res.status(400).json({ message: breachCheck.message });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: newHash,
        password_changed_at: new Date(),
        must_change_password: false,
        failed_login_count: 0,
        locked_until: null,
      },
    });

    await recordPasswordHash(user.id, newHash);

    await prisma.password_resets.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    await prisma.refresh_tokens.updateMany({
      where: { user_id: user.id },
      data: { revoked: true },
    });

    await logAudit('UPDATE', 'USER', user.id, req, 'Password reset completed via email OTP');

    return res.json(
      successResponse(null, 'Your password has been reset successfully. You may now log in with your new password.')
    );
  } catch (error) {
    console.error('resetPasswordWithToken error:', error);
    return res.status(500).json({ message: 'Server error while resetting password' });
  }
};

// ── 60-Day Expiration Renewal: Combined OTP + Password Reset ─────────
export const resetExpiredPasswordWithOtp = async (req: AuthRequest, res: Response) => {
  try {
    const { resetToken, otp, newPassword, confirmPassword } = req.body;

    if (!resetToken || typeof resetToken !== 'string') {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({ message: 'Verification code (OTP) is required' });
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ message: 'New password is required' });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirmation do not match' });
    }

    const resetRecord = await prisma.password_resets.findUnique({
      where: { reset_token: resetToken },
      include: { users: { include: { current_officer: true } } },
    });

    if (!resetRecord || resetRecord.used || resetRecord.expires_at < new Date()) {
      return res.status(400).json({
        message: 'Invalid or expired verification session. Please log in again to receive a fresh verification code.',
      });
    }

    const user = resetRecord.users;
    if (!user || !user.is_active) {
      return res.status(403).json({ message: 'Position account is inactive or not found.' });
    }

    // Rate-limit attempts
    if (resetRecord.attempts >= 5) {
      await prisma.password_resets.update({
        where: { id: resetRecord.id },
        data: { used: true },
      });
      return res.status(429).json({ message: 'Maximum verification attempts exceeded. Please log in again.' });
    }

    const isMatch = await bcrypt.compare(otp.trim(), resetRecord.otp_hash);
    if (!isMatch) {
      const newAttempts = resetRecord.attempts + 1;
      await prisma.password_resets.update({
        where: { id: resetRecord.id },
        data: { attempts: newAttempts },
      });
      const remaining = 5 - newAttempts;
      return res.status(400).json({
        message: remaining > 0 ? `Invalid verification code. ${remaining} attempt(s) remaining.` : 'Maximum attempts exceeded.',
      });
    }

    // Validate password policy
    const policyResult = validatePassword(newPassword);
    if (!policyResult.valid) {
      return res.status(400).json({
        message: 'New password does not meet policy requirements',
        violations: policyResult.violations,
      });
    }

    // Check history (last 5)
    const historyCheck = await checkPasswordHistory(user.id, newPassword);
    if (historyCheck.reused) {
      return res.status(400).json({ message: historyCheck.message });
    }

    // Check breached password
    const breachCheck = await checkBreachedPassword(newPassword);
    if (breachCheck.breached) {
      return res.status(400).json({ message: breachCheck.message });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password_hash: newHash,
        password_changed_at: new Date(),
        must_change_password: false,
        failed_login_count: 0,
        locked_until: null,
      },
    });

    await recordPasswordHash(user.id, newHash);

    await prisma.password_resets.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    await prisma.refresh_tokens.updateMany({
      where: { user_id: user.id },
      data: { revoked: true },
    });

    const officerName = user.current_officer?.full_name || 'Vacant';
    const officerBadge = user.current_officer?.badge_number || null;
    const officerId = user.current_officer ? Number(user.current_officer.id) : null;

    // Issue JWT and login session directly
    const accessToken = jwt.sign(
      {
        userId: Number(user.id),
        username: user.username,
        positionLabel: user.position_label,
        role: user.role,
        department: user.department,
        policeStationId: user.police_station_id ? Number(user.police_station_id) : null,
        district: user.district || null,
        divisionId: user.division_id || null,
        officerId,
        officerName,
        officerBadge,
      },
      JWT_KEY,
      { expiresIn: '8h' }
    );

    const refreshTokenString = generateRefreshToken();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await prisma.refresh_tokens.create({
      data: {
        user_id: user.id,
        token: refreshTokenString,
        expiry_date: expiryDate,
        revoked: false,
      },
    });

    const cookieOptions = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    res.cookie('garuda_access_token', accessToken, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.cookie('garuda_refresh_token', refreshTokenString, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAudit('UPDATE', 'USER', user.id, req, '60-day password renewal completed via OTP');

    return res.json(
      successResponse(
        {
          accessToken,
          refreshToken: refreshTokenString,
          expiresIn: 8 * 60 * 60,
          username: user.username,
          positionLabel: user.position_label,
          fullName: officerName,
          badgeNumber: officerBadge,
          email: user.email || null,
          phoneNumber: user.phone_number || null,
          role: user.role,
          department: user.department,
          policeStationId: user.police_station_id ? Number(user.police_station_id) : null,
          district: user.district || null,
          divisionId: user.division_id || null,
          mustChangePassword: false,
          passwordExpiresAt: new Date(Date.now() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
        },
        'Password renewed successfully. Welcome to GARUDA NDPS.'
      )
    );
  } catch (error) {
    console.error('resetExpiredPasswordWithOtp error:', error);
    return res.status(500).json({ message: 'Server error while resetting password' });
  }
};


