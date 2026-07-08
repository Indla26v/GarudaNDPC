import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma';
import { convertBigIntsToNumbers, successResponse } from '../utils/transformers';
import { logAudit } from '../utils/auditLogger';
import { validatePassword } from '../utils/passwordPolicy';

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
const IS_PROD = process.env.NODE_ENV === 'production';

function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ── SECURITY FIX #7: Reject deactivated users at login
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account has been deactivated. Contact your administrator.' });
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

    // ── Note: Multi-device login restriction is currently disabled per request. ──
    // const activeSession = await prisma.refresh_tokens.findFirst({ ... });

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login: new Date(), failed_login_count: 0, locked_until: null }
    });

    const accessToken = jwt.sign(
      {
        userId: Number(user.id),
        username: user.username,
        role: user.role,
        department: user.department,
        policeStationId: user.police_station_id ? Number(user.police_station_id) : null,
        district: user.district || null,
        divisionId: user.division_id || null
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

    // We can't attach req to logAudit directly without modifying it, but we can set mock req user.
    (req as any).user = { userId: user.id };
    await logAudit('LOGIN', 'USER', user.id, req);

    // ── SECURITY FIX #12: Store JWTs in HttpOnly cookies to prevent XSS theft
    const cookieOptions = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? ('none' as const) : ('lax' as const),
      path: '/', // EXPLICITLY set path to root so it applies to all routes
    };

    res.cookie('garuda_access_token', accessToken, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    res.cookie('garuda_refresh_token', refreshTokenString, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json(successResponse({
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: 8 * 60 * 60, // 8 hours in seconds
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      department: user.department,
      policeStationId: user.police_station_id ? Number(user.police_station_id) : null,
      district: user.district || null,
      divisionId: user.division_id || null
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const token = refreshToken || req.cookies?.garuda_refresh_token;

  if (!token) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const stored = await prisma.refresh_tokens.findUnique({
      where: { token: token },
      include: { users: true }
    });

    if (!stored || stored.revoked || new Date() > stored.expiry_date) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const user = stored.users;
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token user' });
    }

    // ── SECURITY FIX #7: Reject deactivated users at token refresh
    if (!user.is_active) {
      await prisma.refresh_tokens.update({
        where: { id: stored.id },
        data: { revoked: true },
      });
      return res.status(401).json({ message: 'Account has been deactivated' });
    }

    const newAccessToken = jwt.sign(
      {
        userId: Number(user.id),
        username: user.username,
        role: user.role,
        department: user.department,
        policeStationId: user.police_station_id ? Number(user.police_station_id) : null,
        district: user.district || null,
        divisionId: user.division_id || null
      },
      JWT_KEY,
      { expiresIn: '8h' }
    );
    
    // ── SECURITY FIX #12: Store JWTs in HttpOnly cookies
    const cookieOptions = {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: IS_PROD ? ('none' as const) : ('lax' as const),
      path: '/',
    };

    res.cookie('garuda_access_token', newAccessToken, {
      ...cookieOptions,
      maxAge: 8 * 60 * 60 * 1000 // 8 hours
    });

    res.json(successResponse({
      accessToken: newAccessToken,
      refreshToken: stored.token,
      expiresIn: 8 * 60 * 60,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      department: user.department,
      policeStationId: user.police_station_id ? Number(user.police_station_id) : null,
      district: user.district || null,
      divisionId: user.division_id || null
    }));
  } catch(error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body?.refreshToken;
    
    // Also check cookie for refresh token if not in body
    const tokenToRevoke = refreshToken || req.cookies?.garuda_refresh_token;

    if (tokenToRevoke) {
      await prisma.refresh_tokens.updateMany({
        where: { token: tokenToRevoke },
        data: { revoked: true }
      });
    }

    if ((req as any).user) {
      await logAudit('LOGOUT', 'USER', (req as any).user.userId, req);
    }

    // ── SECURITY FIX #12: Clear HttpOnly cookies on logout
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

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: (req as any).user.userId }
    });
    
    if (!user) {
       return res.status(404).json({ message: 'User not found' });
    }
    
    const { password_hash, ...userWithoutPassword } = user;
    res.json(successResponse(convertBigIntsToNumbers(userWithoutPassword)));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Update own profile (self-service) ─────────────────────────────────
export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { fullName, badgeNumber } = req.body;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData: any = {};
    if (fullName !== undefined && fullName.trim()) {
      updateData.full_name = fullName.trim();
    }
    if (badgeNumber !== undefined) {
      updateData.badge_number = badgeNumber?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const updated = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

    await logAudit('UPDATE', 'USER', userId, req,
      `Self-service profile update: ${JSON.stringify(Object.keys(updateData))}`);

    const { password_hash: _, ...userWithoutPassword } = updated;
    res.json(successResponse(convertBigIntsToNumbers(userWithoutPassword), 'Profile updated successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Change own password (self-service) ────────────────────────────────
export const changeMyPassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Validate new password against policy
    const policyResult = validatePassword(newPassword);
    if (!policyResult.valid) {
      return res.status(400).json({
        message: 'New password does not meet policy requirements',
        violations: policyResult.violations,
      });
    }

    // Ensure new password is different from current
    const isSame = await bcrypt.compare(newPassword, user.password_hash);
    if (isSame) {
      return res.status(400).json({ message: 'New password must be different from the current password' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.users.update({
      where: { id: userId },
      data: {
        password_hash: newHash,
        password_changed_at: new Date(),
      },
    });

    await logAudit('UPDATE', 'USER', userId, req, 'Self-service password change');

    res.json(successResponse(null, 'Password changed successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
