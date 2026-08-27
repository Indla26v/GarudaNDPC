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

const PASSWORD_EXPIRY_DAYS = 60; // 2 Months mandatory cycle

// ── List all positions (seats) ────────────────────────────────────────
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
        include: {
          current_officer: true,
          police_stations: true,
          team: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take,
      }),
      prisma.users.count({ where }),
    ]);

    const formatted = users.map(u => {
      const lastChanged = u.password_changed_at || u.created_at;
      const expiryMs = new Date(lastChanged).getTime() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const daysRemaining = Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));
      const isExpired = Date.now() > expiryMs;

      return {
        id: u.id.toString(),
        username: u.username,
        positionLabel: u.position_label,
        fullName: u.current_officer?.full_name || 'Vacant',
        officerId: u.current_officer ? u.current_officer.id.toString() : null,
        officerName: u.current_officer?.full_name || 'Vacant',
        officerBadge: u.current_officer?.badge_number || null,
        currentOfficer: u.current_officer
          ? {
              id: u.current_officer.id.toString(),
              fullName: u.current_officer.full_name,
              badgeNumber: u.current_officer.badge_number,
              rank: u.current_officer.rank,
            }
          : null,
        email: u.email || null,
        phoneNumber: u.phone_number || null,
        role: u.role,
        department: u.department,
        badgeNumber: u.current_officer?.badge_number || null,
        divisionId: u.division_id,
        district: u.district,
        teamId: u.team_id?.toString() || null,
        teamName: (u as any).team?.name || null,
        policeStationId: u.police_station_id?.toString() || null,
        policeStationName: u.police_stations?.name || null,
        policeStationDistrict: u.police_stations?.district || null,
        isActive: u.is_active,
        mustChangePassword: Boolean(u.must_change_password || isExpired),
        passwordChangedAt: u.password_changed_at,
        passwordExpiresAt: new Date(expiryMs),
        daysUntilExpiry: daysRemaining,
        isPasswordExpired: isExpired,
        lastLogin: u.last_login,
        createdAt: u.created_at,
      };
    });

    res.json(successResponse({ content: formatted, totalElements: total, totalPages: Math.ceil(total / take) }));
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Get single position seat ─────────────────────────────────────────
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.users.findUnique({
      where: { id: BigInt(id) },
      include: {
        current_officer: true,
        police_stations: true,
      },
    });

    if (!user) return res.status(404).json({ message: 'Position seat not found' });

    const lastChanged = user.password_changed_at || user.created_at;
    const expiryMs = new Date(lastChanged).getTime() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const daysRemaining = Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));

    res.json(successResponse({
      id: user.id.toString(),
      username: user.username,
      positionLabel: user.position_label,
      fullName: user.current_officer?.full_name || 'Vacant',
      officerId: user.current_officer ? user.current_officer.id.toString() : null,
      officerName: user.current_officer?.full_name || 'Vacant',
      currentOfficer: user.current_officer
        ? {
            id: user.current_officer.id.toString(),
            fullName: user.current_officer.full_name,
            badgeNumber: user.current_officer.badge_number,
            rank: user.current_officer.rank,
          }
        : null,
      officerBadge: user.current_officer?.badge_number || null,
      email: user.email || null,
      phoneNumber: user.phone_number || null,
      role: user.role,
      department: user.department,
      badgeNumber: user.current_officer?.badge_number || null,
      divisionId: user.division_id,
      district: user.district,
      policeStationId: user.police_station_id?.toString() || null,
      policeStationName: user.police_stations?.name || null,
      policeStationDistrict: user.police_stations?.district || null,
      isActive: user.is_active,
      mustChangePassword: user.must_change_password ?? false,
      passwordChangedAt: user.password_changed_at,
      passwordExpiresAt: new Date(expiryMs),
      daysUntilExpiry: daysRemaining,
      lastLogin: user.last_login,
      createdAt: user.created_at,
    }));
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Create position seat ─────────────────────────────────────────────
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const {
      username,
      password,
      positionLabel,
      email,
      phoneNumber,
      role,
      policeStationId,
      department,
      divisionId,
      district,
      officerId,
    } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    // ── Email Validation (Mandatory for department OTP) ──
    const trimmedEmail = email ? String(email).trim() : null;
    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      return res.status(400).json({ message: 'A valid department email address is required' });
    }

    // ── Phone Validation (Mandatory) ──
    const trimmedPhone = phoneNumber ? String(phoneNumber).replace(/[\s\-]/g, '') : null;
    if (!trimmedPhone || !PHONE_REGEX.test(trimmedPhone)) {
      return res.status(400).json({ message: 'A valid 10-digit mobile number is required' });
    }

    // Determine default username if not explicitly provided
    let finalUsername = username ? String(username).trim().toLowerCase() : '';
    if (!finalUsername) {
      if (role === 'SP') {
        finalUsername = `sp-${(district || 'tpt').toLowerCase().replace(/\s+/g, '-')}`;
      } else if (role === 'ASP') {
        finalUsername = `asp-${(district || 'tpt').toLowerCase().replace(/\s+/g, '-')}`;
      } else if (role === 'SDPO') {
        finalUsername = `sdpo-${(divisionId || 'div').toLowerCase().replace(/\s+/g, '-')}`;
      } else if (role === 'SHO') {
        finalUsername = `sho-ps-${policeStationId || Date.now().toString().slice(-4)}`;
      } else if (role === 'CONSTABLE') {
        finalUsername = `const-ps-${policeStationId || Date.now().toString().slice(-4)}-1`;
      } else {
        finalUsername = `${role.toLowerCase()}-${Date.now().toString().slice(-4)}`;
      }
    }

    // ── Password Policy Enforcement ──
    if (!password) {
      return res.status(400).json({ message: 'Initial password is required' });
    }
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
    const existing = await prisma.users.findUnique({ where: { username: finalUsername } });
    if (existing) {
      return res.status(409).json({ message: `Position username '${finalUsername}' already exists` });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const assignedOfficerId = officerId ? BigInt(officerId) : null;

    const newUser = await prisma.users.create({
      data: {
        username: finalUsername,
        password_hash: passwordHash,
        position_label: positionLabel || null,
        email: trimmedEmail,
        phone_number: trimmedPhone,
        role,
        department: department || 'POLICE',
        division_id: role === 'SDPO' ? (divisionId || null) : null,
        district: (role === 'SP' || role === 'ASP') ? (district || null) : null,
        police_station_id: (role !== 'SP' && role !== 'ASP' && role !== 'SDPO' && policeStationId) ? BigInt(policeStationId) : null,
        current_officer_id: assignedOfficerId,
        is_active: true,
        must_change_password: true,
        password_changed_at: new Date(),
      }
    });

    // If initial officer assigned, create posting history
    if (assignedOfficerId) {
      await prisma.posting_history.create({
        data: {
          officer_id: assignedOfficerId,
          position_id: newUser.id,
          appointed_at: new Date(),
          notes: 'Initial assignment upon seat creation',
          created_by: req.user?.userId ? BigInt(req.user.userId) : null,
        }
      });
    }

    // ── Seed initial password history entry ──
    await recordPasswordHash(newUser.id, passwordHash);

    await logAudit('CREATE', 'USER', newUser.id, req,
      `Position seat ${finalUsername} created with role ${role}`);

    res.status(201).json(successResponse(
      {
        id: newUser.id.toString(),
        username: newUser.username,
        positionLabel: newUser.position_label,
        role: newUser.role,
        email: newUser.email,
        phoneNumber: newUser.phone_number,
      },
      'Position seat created successfully'
    ));
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── Update position seat (contacts, department, location, password) ───
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      positionLabel,
      email,
      phoneNumber,
      role,
      policeStationId,
      isActive,
      password,
      department,
      divisionId,
      district,
    } = req.body;

    const existing = await prisma.users.findUnique({ where: { id: BigInt(id) } });
    if (!existing) return res.status(404).json({ message: 'Position seat not found' });

    const updateData: any = {};
    if (positionLabel !== undefined) updateData.position_label = positionLabel;
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
    
    // Clear/set assignments based on target role
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
      const policyResult = validatePassword(password);
      if (!policyResult.valid) {
        return res.status(400).json({
          message: 'Password does not meet policy requirements',
          violations: policyResult.violations,
        });
      }
      updateData.password_hash = await bcrypt.hash(password, 12);
      updateData.password_changed_at = new Date();
      updateData.must_change_password = true;
      await recordPasswordHash(BigInt(id), updateData.password_hash);
    }

    await prisma.users.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    await logAudit('UPDATE', 'USER', id, req as any,
      `Position seat ${existing.username} updated: ${JSON.stringify(Object.keys(updateData))}`);

    res.json(successResponse({ id }, 'Position seat updated successfully'));
  } catch (error) {
    console.error('updateUser error:', error);
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
