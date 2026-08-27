/**
 * GARUDA — Officer & Transfer Management Controller (Admin Only)
 * 
 * Handles officer directory CRUD and seat assignment / transfer operations.
 */
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { convertBigIntsToNumbers, successResponse } from '../utils/transformers';
import { logAudit } from '../utils/audit-logger';

// ── 1. List all officers ──────────────────────────────────────────────
export const getOfficers = async (req: AuthRequest, res: Response) => {
  try {
    const { rank, search, page = 0, size = 50 } = req.query;
    const where: any = {};

    if (rank) {
      where.rank = String(rank);
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { full_name: { contains: q, mode: 'insensitive' } },
        { badge_number: { contains: q, mode: 'insensitive' } },
      ];
    }

    const skip = Number(page) * Number(size);
    const take = Number(size);

    const [officers, total] = await Promise.all([
      prisma.officers.findMany({
        where,
        include: {
          current_position: {
            select: {
              id: true,
              username: true,
              position_label: true,
              role: true,
              department: true,
              district: true,
              division_id: true,
              police_station_id: true,
              police_stations: { select: { id: true, name: true, district: true } },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take,
      }),
      prisma.officers.count({ where }),
    ]);

    const formatted = officers.map((o) => ({
      id: o.id.toString(),
      fullName: o.full_name,
      badgeNumber: o.badge_number,
      rank: o.rank,
      isActive: o.is_active,
      createdAt: o.created_at,
      currentPosition: o.current_position
        ? {
            id: o.current_position.id.toString(),
            username: o.current_position.username,
            positionLabel: o.current_position.position_label,
            role: o.current_position.role,
            department: o.current_position.department,
            district: o.current_position.district,
            divisionId: o.current_position.division_id,
            policeStationId: o.current_position.police_station_id?.toString() || null,
            policeStationName: o.current_position.police_stations?.name || null,
          }
        : null,
    }));

    res.json(successResponse({ content: formatted, totalElements: total, totalPages: Math.ceil(total / take) }));
  } catch (error) {
    console.error('getOfficers error:', error);
    res.status(500).json({ message: 'Server error while fetching officers' });
  }
};

// ── 2. Get single officer with career history ────────────────────────
export const getOfficerById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const officer = await prisma.officers.findUnique({
      where: { id: BigInt(id as string) },
      include: {
        current_position: {
          select: {
            id: true,
            username: true,
            position_label: true,
            role: true,
            police_stations: { select: { name: true } },
          },
        },
        posting_histories: {
          include: {
            position: {
              select: {
                id: true,
                username: true,
                position_label: true,
                role: true,
                police_stations: { select: { name: true } },
              },
            },
          },
          orderBy: { appointed_at: 'desc' },
        },
      },
    });

    if (!officer) {
      return res.status(404).json({ message: 'Officer record not found' });
    }

    const formatted = {
      id: officer.id.toString(),
      fullName: officer.full_name,
      badgeNumber: officer.badge_number,
      rank: officer.rank,
      isActive: officer.is_active,
      createdAt: officer.created_at,
      currentPosition: officer.current_position
        ? {
            id: officer.current_position.id.toString(),
            username: officer.current_position.username,
            positionLabel: officer.current_position.position_label,
            role: officer.current_position.role,
            stationName: officer.current_position.police_stations?.name || null,
          }
        : null,
      postingHistories: officer.posting_histories.map((ph) => ({
        id: ph.id.toString(),
        positionId: ph.position_id.toString(),
        positionLabel: ph.position.position_label || ph.position.username,
        role: ph.position.role,
        stationName: ph.position.police_stations?.name || null,
        appointedAt: ph.appointed_at,
        relievedAt: ph.relieved_at,
        transferOrderNo: ph.transfer_order_no,
        notes: ph.notes,
      })),
    };

    res.json(successResponse(formatted));
  } catch (error) {
    console.error('getOfficerById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ── 3. Create a new officer (person record) ──────────────────────────
export const createOfficer = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, badgeNumber, rank } = req.body;

    if (!fullName || !fullName.trim() || !rank) {
      return res.status(400).json({ message: 'Officer full name and rank are required' });
    }

    const newOfficer = await prisma.officers.create({
      data: {
        full_name: fullName.trim(),
        badge_number: badgeNumber ? badgeNumber.trim() : null,
        rank,
        is_active: true,
      },
    });

    await logAudit('CREATE', 'OFFICER', newOfficer.id, req, `Created officer: ${newOfficer.full_name} (${newOfficer.rank})`);

    res.status(201).json(
      successResponse(
        {
          id: newOfficer.id.toString(),
          fullName: newOfficer.full_name,
          badgeNumber: newOfficer.badge_number,
          rank: newOfficer.rank,
        },
        'Officer record created successfully'
      )
    );
  } catch (error) {
    console.error('createOfficer error:', error);
    res.status(500).json({ message: 'Server error while creating officer' });
  }
};

// ── 4. Update officer personal info ──────────────────────────────────
export const updateOfficer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, badgeNumber, rank, isActive } = req.body;

    const existing = await prisma.officers.findUnique({ where: { id: BigInt(id as string) } });
    if (!existing) {
      return res.status(404).json({ message: 'Officer not found' });
    }

    const updateData: any = {};
    if (fullName !== undefined && fullName.trim()) updateData.full_name = fullName.trim();
    if (badgeNumber !== undefined) updateData.badge_number = badgeNumber ? badgeNumber.trim() : null;
    if (rank !== undefined) updateData.rank = rank;
    if (isActive !== undefined) updateData.is_active = isActive;

    const updated = await prisma.officers.update({
      where: { id: BigInt(id as string) },
      data: updateData,
      include: { current_position: true },
    });

    if (updated.current_position) {
      await prisma.users.update({
        where: { id: updated.current_position.id },
        data: {
          full_name: updated.full_name,
          badge_number: updated.badge_number,
        },
      });
    }

    await logAudit('UPDATE', 'OFFICER', updated.id, req, `Updated officer: ${updated.full_name}`);

    res.json(
      successResponse(
        {
          id: updated.id.toString(),
          fullName: updated.full_name,
          badgeNumber: updated.badge_number,
          rank: updated.rank,
          isActive: updated.is_active,
        },
        'Officer record updated successfully'
      )
    );
  } catch (error) {
    console.error('updateOfficer error:', error);
    res.status(500).json({ message: 'Server error while updating officer' });
  }
};

// ── 5. Assign Officer to Position (Transfer In) ──────────────────────
export const assignOfficerToPosition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Position ID (users.id)
    const { officerId, transferOrderNo, notes } = req.body;

    if (!officerId) {
      return res.status(400).json({ message: 'Officer ID is required for assignment' });
    }

    const positionId = BigInt(id as string);
    const targetOfficerId = BigInt(officerId as string);

    // Verify position exists
    const position = await prisma.users.findUnique({
      where: { id: positionId },
      include: { current_officer: true },
    });

    if (!position) {
      return res.status(404).json({ message: 'Position seat not found' });
    }

    // Verify officer exists
    const officer = await prisma.officers.findUnique({
      where: { id: targetOfficerId },
      include: { current_position: true },
    });

    if (!officer) {
      return res.status(404).json({ message: 'Officer record not found' });
    }

    const adminUserId = req.user?.userId ? BigInt(req.user.userId) : null;
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // 1. If position currently has an officer, relieve that officer
      if (position.current_officer_id) {
        await tx.posting_history.updateMany({
          where: {
            position_id: positionId,
            officer_id: position.current_officer_id,
            relieved_at: null,
          },
          data: {
            relieved_at: now,
            notes: notes ? `Relieved on transfer: ${notes}` : 'Relieved on transfer of new officer',
          },
        });
      }

      // 2. If target officer is currently posted elsewhere, vacate their old seat
      if (officer.current_position && officer.current_position.id !== positionId) {
        await tx.users.update({
          where: { id: officer.current_position.id },
          data: {
            current_officer_id: null,
            full_name: null,
            badge_number: null,
          },
        });

        await tx.posting_history.updateMany({
          where: {
            position_id: officer.current_position.id,
            officer_id: targetOfficerId,
            relieved_at: null,
          },
          data: {
            relieved_at: now,
            notes: `Transferred to ${position.position_label || position.username}`,
          },
        });
      }

      // 3. Assign target officer to this position
      await tx.users.update({
        where: { id: positionId },
        data: {
          current_officer_id: targetOfficerId,
          full_name: officer.full_name,
          badge_number: officer.badge_number,
        },
      });

      // 4. Create new posting history entry
      await tx.posting_history.create({
        data: {
          officer_id: targetOfficerId,
          position_id: positionId,
          appointed_at: now,
          transfer_order_no: transferOrderNo ? transferOrderNo.trim() : null,
          notes: notes ? notes.trim() : null,
          created_by: adminUserId,
        },
      });
    });

    await logAudit(
      'UPDATE',
      'USER',
      positionId,
      req,
      `Assigned Officer ${officer.full_name} (${officer.rank}) to Position ${position.position_label || position.username}`
    );

    res.json(
      successResponse(
        {
          positionId: positionId.toString(),
          positionLabel: position.position_label,
          officerId: officer.id.toString(),
          officerName: officer.full_name,
        },
        `Officer ${officer.full_name} successfully assigned to ${position.position_label || position.username}`
      )
    );
  } catch (error) {
    console.error('assignOfficerToPosition error:', error);
    res.status(500).json({ message: 'Server error while assigning officer' });
  }
};

// ── 6. Relieve Officer from Position (Vacate Seat) ───────────────────
export const relieveOfficerFromPosition = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Position ID (users.id)
    const { notes } = req.body;
    const positionId = BigInt(id as string);

    const position = await prisma.users.findUnique({
      where: { id: positionId },
      include: { current_officer: true },
    });

    if (!position) {
      return res.status(404).json({ message: 'Position seat not found' });
    }

    if (!position.current_officer_id) {
      return res.status(400).json({ message: 'Position is already vacant' });
    }

    const previousOfficerName = position.current_officer?.full_name || 'Officer';
    const now = new Date();

    await prisma.$transaction(async (tx) => {
      // 1. Close posting history
      await tx.posting_history.updateMany({
        where: {
          position_id: positionId,
          officer_id: position.current_officer_id!,
          relieved_at: null,
        },
        data: {
          relieved_at: now,
          notes: notes ? notes.trim() : 'Relieved from position by Admin',
        },
      });

      // 2. Set position current_officer_id to null
      await tx.users.update({
        where: { id: positionId },
        data: {
          current_officer_id: null,
          full_name: null,
          badge_number: null,
        },
      });
    });

    await logAudit(
      'UPDATE',
      'USER',
      positionId,
      req,
      `Relieved officer ${previousOfficerName} from position ${position.position_label || position.username}. Position is now vacant.`
    );

    res.json(
      successResponse(
        { positionId: positionId.toString(), positionLabel: position.position_label },
        `Officer relieved. Seat is now vacant.`
      )
    );
  } catch (error) {
    console.error('relieveOfficerFromPosition error:', error);
    res.status(500).json({ message: 'Server error while relieving officer' });
  }
};

// ── 7. Get Posting History for a Position ────────────────────────────
export const getPositionPostingHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const positionId = BigInt(id as string);

    const histories = await prisma.posting_history.findMany({
      where: { position_id: positionId },
      include: {
        officer: {
          select: {
            id: true,
            full_name: true,
            badge_number: true,
            rank: true,
          },
        },
      },
      orderBy: { appointed_at: 'desc' },
    });

    const formatted = histories.map((h) => ({
      id: h.id.toString(),
      officerId: h.officer.id.toString(),
      officerName: h.officer.full_name,
      badgeNumber: h.officer.badge_number,
      rank: h.officer.rank,
      appointedAt: h.appointed_at,
      relievedAt: h.relieved_at,
      transferOrderNo: h.transfer_order_no,
      notes: h.notes,
    }));

    res.json(successResponse(formatted));
  } catch (error) {
    console.error('getPositionPostingHistory error:', error);
    res.status(500).json({ message: 'Server error while fetching posting history' });
  }
};
