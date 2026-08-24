/**
 * GARUDA — User Management Controller (Admin Only)
 * 
 * Full CRUD for user accounts, role assignment, PS assignment.
 */
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import { successResponse } from '../utils/transformers';
import { logAudit } from '../utils/audit-logger';
import { validatePassword } from '../utils/password-policy';
import { recordPasswordHash } from '../utils/password-history';
import { checkBreachedPassword } from '../utils/breached-password';

// Helper regex for validating email & phone
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

// ── List all users ────────────────────────────────────────────────────
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, psId, page = 0, size = 20 } = req.query;
    const where: any = {};
    if (role) where.role = String(role);
    if (psId) where.police_station_id = BigInt(psId as string);

    const skip = Number(page) * Number(size);
    const take = Number(size);

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        include: { police_stations: true, team: true },
        orderBy: { created_at: 'desc' },
        skip,
        take,
      }),
      prisma.users.count({ where }),
    ]);

    const formatted = users.map(u => ({
      id: u.id.toString(),
      username: u.username,
      fullName: u.full_name,
      email: u.email || null,
      phoneNumber: u.phone_number || null,
      role: u.role,
      department: u.department,
      badgeNumber: u.badge_number,
      divisionId: u.division_id,
      district: u.district,
      teamId: u.team_id?.toString() || null,
      teamName: (u as any).team?.name || null,
      policeStationId: u.police_station_id?.toString() || null,
      policeStationName: u.police_stations?.name || null,
      policeStationDistrict: u.police_stations?.district || null,
      isActive: u.is_active,
      mustChangePassword: u.must_change_password ?? false,
      lastLogin: u.last_login,
      createdAt: u.created_at,
    }));

    res.json(successResponse({ content: formatted, totalElements: total, totalPages: Math.ceil(total / take) }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get single user ──────────────────────────────────────────────────
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.users.findUnique({
      where: { id: BigInt(id) },
      include: { police_stations: true },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(successResponse({
      id: user.id.toString(),
      username: user.username,
      fullName: user.full_name,
      email: user.email || null,
      phoneNumber: user.phone_number || null,
      role: user.role,
      department: user.department,
      badgeNumber: user.badge_number,
      divisionId: user.division_id,
      district: user.district,
      policeStationId: user.police_station_id?.toString() || null,
      policeStationName: user.police_stations?.name || null,
      policeStationDistrict: user.police_stations?.district || null,
      isActive: user.is_active,
      mustChangePassword: user.must_change_password ?? false,
      lastLogin: user.last_login,
      createdAt: user.created_at,
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Create user ──────────────────────────────────────────────────────
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, fullName, email, phoneNumber, role, policeStationId, department, badgeNumber, divisionId, district } = req.body;

    if (!username || !password || !fullName || !role) {
      return res.status(400).json({ message: 'username, password, fullName, and role are required' });
    }

    // ── Email Validation (Mandatory) ──
    const trimmedEmail = email ? String(email).trim() : null;
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ message: 'A valid email address is required' });
    }

    // ── Phone Validation (Mandatory) ──
    const trimmedPhone = phoneNumber ? String(phoneNumber).replace(/[\s\-]/g, '') : null;
    if (!trimmedPhone || !PHONE_REGEX.test(trimmedPhone)) {
      return res.status(400).json({ message: 'A valid 10-digit mobile number is required' });
    }

    // ── Password Policy Enforcement ──
    const policyResult = validatePassword(password);
    if (!policyResult.valid) {
      return res.status(400).json({
        message: 'Password does not meet policy requirements',
        violations: policyResult.violations,
      });
    }

    // ── SECURITY: Breached Password Check ──
    const breachCheck = await checkBreachedPassword(password);
    if (breachCheck.breached) {
      return res.status(400).json({
        message: 'This password is too common or unsafe to use. Please choose a different password.',
        details: breachCheck.message,
      });
    }

    // Check for existing username
    const existing = await prisma.users.findUnique({ where: { username } });
    if (existing) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.users.create({
      data: {
        username,
        password_hash: passwordHash,
        full_name: fullName,
        email: trimmedEmail,
        phone_number: trimmedPhone,
        role,
        department: department || 'OPERATIONS',
        badge_number: badgeNumber || null,
        division_id: role === 'SDPO' ? (divisionId || null) : null,
        district: (role === 'SP' || role === 'ASP') ? (district || null) : null,
        police_station_id: (role !== 'SP' && role !== 'ASP' && role !== 'SDPO' && policeStationId) ? BigInt(policeStationId) : null,
        is_active: true,
        must_change_password: true,
      }
    });

    // ── Seed initial password history entry ──
    await recordPasswordHash(newUser.id, passwordHash);

    await logAudit('CREATE', 'USER', newUser.id, req,
      `User ${username} created with role ${role}`);

    res.status(201).json(successResponse(
      { id: newUser.id.toString(), username: newUser.username, role: newUser.role, email: newUser.email, phoneNumber: newUser.phone_number },
      'User created successfully'
    ));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Update user (role, PS assignment, active status) ─────────────────
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { fullName, email, phoneNumber, role, policeStationId, isActive, password, department, badgeNumber, divisionId, district } = req.body;

    const existing = await prisma.users.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return res.status(404).json({ message: 'User not found' });

    const updateData: any = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (email !== undefined) {
      const trimmedEmail = email ? String(email).trim() : null;
      if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
        return res.status(400).json({ message: 'Invalid email address format' });
      }
      updateData.email = trimmedEmail;
    }
    if (phoneNumber !== undefined) {
      const trimmedPhone = phoneNumber ? String(phoneNumber).replace(/[\s\-]/g, '') : null;
      if (trimmedPhone && !PHONE_REGEX.test(trimmedPhone)) {
        return res.status(400).json({ message: 'Invalid phone number. Must be a valid 10-digit mobile number' });
      }
      updateData.phone_number = trimmedPhone;
    }
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (badgeNumber !== undefined) updateData.badge_number = badgeNumber || null;
    
    // Clear/set assignments based on the final/target role
    const targetRole = role !== undefined ? role : existing.role;
    
    if (targetRole === 'SP' || targetRole === 'ASP') {
      updateData.district = district !== undefined ? (district || null) : existing.district;
      updateData.division_id = null;
      updateData.police_station_id = null;
    } else if (targetRole === 'SDPO') {
      updateData.district = null;
      updateData.division_id = divisionId !== undefined ? (divisionId || null) : existing.division_id;
      updateData.police_station_id = null;
    } else {
      updateData.district = null;
      updateData.division_id = null;
      updateData.police_station_id = policeStationId !== undefined ? (policeStationId ? BigInt(policeStationId) : null) : existing.police_station_id;
    }

    if (isActive !== undefined) updateData.is_active = isActive;
    if (password) {
      // ── Password Policy Enforcement ──
      const policyResult = validatePassword(password);
      if (!policyResult.valid) {
        return res.status(400).json({
          message: 'Password does not meet policy requirements',
          violations: policyResult.violations,
        });
      }
      updateData.password_hash = await bcrypt.hash(password, 12);
      updateData.must_change_password = true;
      // ── Record admin-reset password in history ──
      await recordPasswordHash(BigInt(id), updateData.password_hash);
    }

    await prisma.users.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    await logAudit('UPDATE', 'USER', id, req as any,
      `User ${existing.username} updated: ${JSON.stringify(Object.keys(updateData))}`);

    res.json(successResponse({ id }, 'User updated successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Deactivate user ──────────────────────────────────────────────────
export const deactivateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.users.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return res.status(404).json({ message: 'User not found' });

    await prisma.users.update({
      where: { id: BigInt(id) },
      data: { is_active: false },
    });

    // Revoke all refresh tokens
    await prisma.refresh_tokens.updateMany({
      where: { user_id: BigInt(id), revoked: false },
      data: { revoked: true },
    });

    await logAudit('UPDATE', 'USER', id, req,
      `User ${existing.username} deactivated`);

    res.json(successResponse({ id }, 'User deactivated'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Activate user ────────────────────────────────────────────────────
export const activateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.users.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return res.status(404).json({ message: 'User not found' });

    await prisma.users.update({
      where: { id: BigInt(id) },
      data: { is_active: true },
    });

    await logAudit('UPDATE', 'USER', id, req,
      `User ${existing.username} activated`);

    res.json(successResponse({ id }, 'User activated successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get audit logs (Admin only) ──────────────────────────────────────
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { action, entityType, userId, page = 0, size = 50 } = req.query;

    const where: any = {};
    if (action) where.action = String(action);
    if (entityType) where.entity_type = String(entityType);
    if (userId) where.user_id = BigInt(userId as string);

    const skip = Number(page) * Number(size);
    const take = Number(size);

    const [logs, total] = await Promise.all([
      prisma.audit_logs.findMany({
        where,
        include: { users: { select: { id: true, full_name: true, username: true, role: true } } },
        orderBy: { timestamp: 'desc' },
        skip,
        take,
      }),
      prisma.audit_logs.count({ where }),
    ]);

    const formatted = logs.map(l => ({
      id: l.id.toString(),
      action: l.action,
      entityType: l.entity_type,
      entityId: l.entity_id?.toString() || null,
      details: l.details,
      ipAddress: l.ip_address,
      timestamp: l.timestamp,
      user: l.users ? {
        id: l.users.id.toString(),
        name: l.users.full_name,
        username: l.users.username,
        role: l.users.role,
      } : null,
    }));

    res.json(successResponse({ content: formatted, totalElements: total, totalPages: Math.ceil(total / take) }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Direct Delete Offender (SP/Admin only) ───────────────────────────
export const deleteOffenderDirect = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Offender ID is required' });
    }
    const offenderId = BigInt(id as string);
    
    // First verify it exists
    const offender = await prisma.offenders.findUnique({
      where: { id: offenderId }
    });
    if (!offender) {
      return res.status(404).json({ message: 'Offender not found' });
    }

    await prisma.$transaction(async (tx) => {
      // Direct delete associated records where onDelete: NoAction in schema.prisma:
      await tx.case_accused.deleteMany({ where: { offender_id: offenderId } });
      await tx.intelligence_inputs.deleteMany({ where: { offender_id: offenderId } });
      await tx.supply_chain_links.deleteMany({
        where: {
          OR: [
            { offender_id: offenderId },
            { linked_offender_id: offenderId }
          ]
        }
      });
      await tx.enforcement_checks.updateMany({
        where: { matched_offender_id: offenderId },
        data: { matched_offender_id: null }
      });
      await tx.enforcement_checks.updateMany({
        where: { committed_offender_id: offenderId },
        data: { committed_offender_id: null }
      });
      await tx.transaction_records.updateMany({
        where: { matched_offender_id: offenderId },
        data: { matched_offender_id: null }
      });

      // Purge all related detail records
      await tx.offender_contacts.deleteMany({ where: { offender_id: offenderId } });
      await tx.offender_drug_profile.deleteMany({ where: { offender_id: offenderId } });
      await tx.offender_financials.deleteMany({ where: { offender_id: offenderId } });
      await tx.offender_identity_docs.deleteMany({ where: { offender_id: offenderId } });
      await tx.imei_records.deleteMany({ where: { offender_id: offenderId } });
      await tx.surveillance_records.deleteMany({ where: { offender_id: offenderId } });
      await tx.interrogation_sessions.deleteMany({ where: { offender_id: offenderId } });
      await tx.finance_upload_batches.deleteMany({ where: { offender_id: offenderId } });
      await tx.transaction_records.deleteMany({ where: { offender_id: offenderId } });
      await tx.social_media_intel.deleteMany({ where: { offender_id: offenderId } });
      await tx.messaging_intel.deleteMany({ where: { offender_id: offenderId } });
      
      await tx.offenders.delete({
        where: { id: offenderId }
      });
    }, { maxWait: 15000, timeout: 60000 });

    await logAudit('DELETE', 'OFFENDER', offenderId, req, `Direct deletion of offender profile ID: ${id}, Name: ${offender.full_name}`);

    res.json(successResponse(null, 'Offender profile deleted successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
