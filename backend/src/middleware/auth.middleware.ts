import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

// ── SECURITY FIX #1: No hardcoded fallback — fail-fast if JWT_SECRET is missing
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is not set. ' +
    'Refusing to start. Set JWT_SECRET in your .env or hosting environment.'
  );
}

/**
 * Shape of the decoded JWT payload attached to authenticated requests.
 * Matches the token signed in auth.controller.ts login().
 */
export interface AuthenticatedUser {
  userId: number;
  username: string;
  positionLabel?: string | null;
  role: string;
  department: string | null;
  policeStationId: number | null;
  district: string | null;
  divisionId: string | null;
  officerId?: number | null;
  officerName?: string | null;
  officerBadge?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Extract token from HttpOnly cookie, fallback to Authorization header
  let token: string | undefined = req.cookies?.garuda_access_token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Fetch latest user account status and assignments from database
    const dbUser = await prisma.users.findUnique({
      where: { id: BigInt(decoded.userId) },
      select: {
        id: true,
        username: true,
        position_label: true,
        role: true,
        department: true,
        police_station_id: true,
        district: true,
        division_id: true,
        is_active: true,
        locked_until: true,
        current_officer: {
          select: {
            id: true,
            full_name: true,
            badge_number: true,
          }
        }
      },
    });

    if (!dbUser || !dbUser.is_active) {
      return res.status(401).json({ message: 'Account deactivated' });
    }

    if (dbUser.locked_until && new Date() < dbUser.locked_until) {
      return res.status(423).json({ message: 'Account locked. Try again later.' });
    }

    req.user = {
      userId: Number(dbUser.id),
      username: dbUser.username,
      positionLabel: dbUser.position_label || decoded.positionLabel || null,
      role: dbUser.role,
      department: dbUser.department,
      policeStationId: dbUser.police_station_id ? Number(dbUser.police_station_id) : null,
      district: dbUser.district || decoded.district || null,
      divisionId: dbUser.division_id || decoded.divisionId || null,
      officerId: dbUser.current_officer ? Number(dbUser.current_officer.id) : (decoded.officerId || null),
      officerName: dbUser.current_officer?.full_name || decoded.officerName || 'Vacant',
      officerBadge: dbUser.current_officer?.badge_number || decoded.officerBadge || null,
    };
    next();
  } catch (err) {
    return res.sendStatus(401);
  }
};
