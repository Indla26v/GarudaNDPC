import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { successResponse } from '../utils/transformers';
import { logAudit } from '../utils/audit-logger';
import { broadcastEvent } from './sse.controller';

export const approveCase = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ message: 'Missing ID parameter' });
    const user = req.user!;
    const userRole = user.role;
    const userPsId = user.policeStationId ? BigInt(user.policeStationId) : null;

    if (!['SHO', 'SDPO', 'SP', 'ASP'].includes(userRole)) {
      return res.status(403).json({ message: 'Only SHO and above can approve records' });
    }

    const existingCase = await prisma.cases.findUnique({ where: { id: BigInt(id) } });
    if (!existingCase) return res.status(404).json({ message: 'Case not found' });

    if (userRole === 'SHO' && existingCase.ps_id !== userPsId) {
      return res.status(403).json({ message: 'You can only approve records from your own police station' });
    }

    await prisma.cases.update({
      where: { id: BigInt(id) },
      data: {
        approval_status: 'APPROVED',
        approval_notes: null,
      }
    });

    await logAudit('UPDATE', 'CASE', BigInt(id), req, 'Approved pending case and committed to database');
    broadcastEvent('case_created', { id, firNo: existingCase.fir_no });
    broadcastEvent('data_updated', { entity: 'case', id });

    res.json(successResponse({ id }, 'Case approved and committed successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectCase = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ message: 'Missing ID parameter' });
    const user = req.user!;
    const userRole = user.role;
    const userPsId = user.policeStationId ? BigInt(user.policeStationId) : null;
    const { notes, reason } = req.body;

    if (!['SHO', 'SDPO', 'SP', 'ASP'].includes(userRole)) {
      return res.status(403).json({ message: 'Only SHO and above can reject records' });
    }

    const existingCase = await prisma.cases.findUnique({ where: { id: BigInt(id) } });
    if (!existingCase) return res.status(404).json({ message: 'Case not found' });

    if (userRole === 'SHO' && existingCase.ps_id !== userPsId) {
      return res.status(403).json({ message: 'You can only reject records from your own police station' });
    }

    const noteText = notes || reason || 'Rejected by SHO';

    await prisma.cases.update({
      where: { id: BigInt(id) },
      data: {
        approval_status: 'REJECTED',
        approval_notes: noteText,
      }
    });

    await logAudit('UPDATE', 'CASE', BigInt(id), req, `Rejected pending case: ${noteText}`);
    broadcastEvent('data_updated', { entity: 'case', id });

    res.json(successResponse({ id }, 'Case rejected successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const requestChangesCase = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ message: 'Missing ID parameter' });
    const user = req.user!;
    const userRole = user.role;
    const userPsId = user.policeStationId ? BigInt(user.policeStationId) : null;
    const { notes, reason } = req.body;

    if (!['SHO', 'SDPO', 'SP', 'ASP'].includes(userRole)) {
      return res.status(403).json({ message: 'Only SHO and above can request changes' });
    }

    const noteText = notes || reason;
    if (!noteText || !noteText.trim()) {
      return res.status(400).json({ message: 'Please provide instructions/notes about the required changes' });
    }

    const existingCase = await prisma.cases.findUnique({ where: { id: BigInt(id) } });
    if (!existingCase) return res.status(404).json({ message: 'Case not found' });

    if (userRole === 'SHO' && existingCase.ps_id !== userPsId) {
      return res.status(403).json({ message: 'You can only review records from your own police station' });
    }

    await prisma.cases.update({
      where: { id: BigInt(id) },
      data: {
        approval_status: 'CHANGES_REQUESTED',
        approval_notes: noteText.trim(),
      }
    });

    await logAudit('UPDATE', 'CASE', BigInt(id), req, `Requested changes on case: ${noteText.trim()}`);
    broadcastEvent('data_updated', { entity: 'case', id });

    res.json(successResponse({ id }, 'Changes requested successfully. Case sent back to Constable for revision.'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveOffender = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ message: 'Missing ID parameter' });
    const user = req.user!;
    const userRole = user.role;
    const userPsId = user.policeStationId ? BigInt(user.policeStationId) : null;

    if (!['SHO', 'SDPO', 'SP', 'ASP'].includes(userRole)) {
      return res.status(403).json({ message: 'Only SHO and above can approve records' });
    }

    const existingOffender = await prisma.offenders.findUnique({ where: { id: BigInt(id) } });
    if (!existingOffender) return res.status(404).json({ message: 'Offender not found' });

    if (userRole === 'SHO' && existingOffender.ps_id !== userPsId) {
      return res.status(403).json({ message: 'You can only approve records from your own police station' });
    }

    await prisma.offenders.update({
      where: { id: BigInt(id) },
      data: {
        approval_status: 'APPROVED',
        approval_notes: null,
      }
    });

    await logAudit('UPDATE', 'OFFENDER', BigInt(id), req, 'Approved pending offender and committed to database');
    broadcastEvent('offender_created', { id: id.toString() });
    broadcastEvent('data_updated', { entity: 'offender', id });

    res.json(successResponse({ id }, 'Offender profile approved and committed successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectOffender = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ message: 'Missing ID parameter' });
    const user = req.user!;
    const userRole = user.role;
    const userPsId = user.policeStationId ? BigInt(user.policeStationId) : null;
    const { notes, reason } = req.body;

    if (!['SHO', 'SDPO', 'SP', 'ASP'].includes(userRole)) {
      return res.status(403).json({ message: 'Only SHO and above can reject records' });
    }

    const existingOffender = await prisma.offenders.findUnique({ where: { id: BigInt(id) } });
    if (!existingOffender) return res.status(404).json({ message: 'Offender not found' });

    if (userRole === 'SHO' && existingOffender.ps_id !== userPsId) {
      return res.status(403).json({ message: 'You can only reject records from your own police station' });
    }

    const noteText = notes || reason || 'Rejected by SHO';

    await prisma.offenders.update({
      where: { id: BigInt(id) },
      data: {
        approval_status: 'REJECTED',
        approval_notes: noteText,
      }
    });

    await logAudit('UPDATE', 'OFFENDER', BigInt(id), req, `Rejected pending offender: ${noteText}`);
    broadcastEvent('data_updated', { entity: 'offender', id });

    res.json(successResponse({ id }, 'Offender profile rejected successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const requestChangesOffender = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ message: 'Missing ID parameter' });
    const user = req.user!;
    const userRole = user.role;
    const userPsId = user.policeStationId ? BigInt(user.policeStationId) : null;
    const { notes, reason } = req.body;

    if (!['SHO', 'SDPO', 'SP', 'ASP'].includes(userRole)) {
      return res.status(403).json({ message: 'Only SHO and above can request changes' });
    }

    const noteText = notes || reason;
    if (!noteText || !noteText.trim()) {
      return res.status(400).json({ message: 'Please provide instructions/notes about the required changes' });
    }

    const existingOffender = await prisma.offenders.findUnique({ where: { id: BigInt(id) } });
    if (!existingOffender) return res.status(404).json({ message: 'Offender not found' });

    if (userRole === 'SHO' && existingOffender.ps_id !== userPsId) {
      return res.status(403).json({ message: 'You can only review records from your own police station' });
    }

    await prisma.offenders.update({
      where: { id: BigInt(id) },
      data: {
        approval_status: 'CHANGES_REQUESTED',
        approval_notes: noteText.trim(),
      }
    });

    await logAudit('UPDATE', 'OFFENDER', BigInt(id), req, `Requested changes on offender: ${noteText.trim()}`);
    broadcastEvent('data_updated', { entity: 'offender', id });

    res.json(successResponse({ id }, 'Changes requested successfully. Offender profile sent back to Constable for revision.'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Controller to fetch all approval submissions created by the current user (Constable / Field Officer)
 * or scoped to the current station for tracking approval progress.
 */
export const getMySubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const userId = BigInt(user.userId);
    const userRole = user.role;
    const userPsId = user.policeStationId ? BigInt(user.policeStationId) : null;
    const { status, type, search } = req.query;

    const caseWhere: any = {};
    const offenderWhere: any = {};
    const editWhere: any = {};

    if (userRole === 'CONSTABLE') {
      caseWhere.created_by = userId;
      offenderWhere.created_by = userId;
      editWhere.requested_by = userId;
    } else if (['SHO', 'SDPO', 'ASP'].includes(userRole) && userPsId) {
      caseWhere.ps_id = userPsId;
      offenderWhere.ps_id = userPsId;
      editWhere.requested_user = { police_station_id: userPsId };
    }

    if (status && String(status) !== 'ALL') {
      caseWhere.approval_status = String(status);
      offenderWhere.approval_status = String(status);
      editWhere.status = String(status);
    }

    if (search) {
      const q = String(search).trim();
      caseWhere.OR = [
        { fir_no: { contains: q, mode: 'insensitive' } },
        { section_of_law: { contains: q, mode: 'insensitive' } },
      ];
      offenderWhere.OR = [
        { full_name: { contains: q, mode: 'insensitive' } },
        { alias: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [casesList, offendersList, editRequestsList] = await Promise.all([
      type === 'offenders' || type === 'edit-requests' ? [] : prisma.cases.findMany({
        where: caseWhere,
        include: {
          police_stations: { select: { id: true, name: true, ps_code: true } },
          users: { select: { id: true, full_name: true, badge_number: true, username: true } },
        },
        orderBy: { updated_at: 'desc' },
      }),
      type === 'cases' || type === 'edit-requests' ? [] : prisma.offenders.findMany({
        where: offenderWhere,
        include: {
          police_stations: { select: { id: true, name: true, ps_code: true } },
          users: { select: { id: true, full_name: true, badge_number: true, username: true } },
        },
        orderBy: { updated_at: 'desc' },
      }),
      type === 'cases' || type === 'offenders' ? [] : prisma.edit_requests.findMany({
        where: editWhere,
        include: {
          requested_user: { select: { id: true, full_name: true, badge_number: true, username: true } },
          approved_user: { select: { id: true, full_name: true, role: true } },
        },
        orderBy: { updated_at: 'desc' },
      }),
    ]);

    // Format results into a unified structure
    const formattedCases = casesList.map((c: any) => ({
      submissionType: 'CASE',
      id: c.id.toString(),
      title: c.fir_no,
      subtitle: c.section_of_law || c.stage,
      stage: c.stage,
      status: c.approval_status,
      approvalNotes: c.approval_notes,
      station: c.police_stations?.name || 'Assigned PS',
      submittedBy: c.users?.full_name || c.users?.username || 'Constable',
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      details: {
        contrabandType: c.contraband_type,
        quantity: c.quantity ? `${c.quantity} ${c.quantity_unit || 'KG'}` : null,
        natureOfOffence: c.nature_of_offence,
      }
    }));

    const formattedOffenders = offendersList.map((o: any) => ({
      submissionType: 'OFFENDER',
      id: o.id.toString(),
      title: o.full_name,
      subtitle: o.alias ? `Alias: ${o.alias}` : (o.category?.replace('_', ' ') || 'Offender Profile'),
      category: o.category,
      status: o.approval_status,
      approvalNotes: o.approval_notes,
      photoUrl: o.photo_url,
      station: o.police_stations?.name || 'Assigned PS',
      submittedBy: o.users?.full_name || o.users?.username || 'Constable',
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      details: {
        age: o.age,
        gender: o.gender,
        slNo: o.sl_no,
        landmarkArea: o.landmark_area,
      }
    }));

    const formattedEdits = editRequestsList.map((e: any) => ({
      submissionType: 'EDIT_REQUEST',
      id: e.id.toString(),
      entityType: e.entity_type,
      entityId: e.entity_id.toString(),
      title: `Edit ${e.entity_type} #${e.entity_id}`,
      subtitle: e.reason || 'Requested Record Update',
      status: e.status,
      approvalNotes: e.rejection_reason,
      station: 'Assigned PS',
      submittedBy: e.requested_user?.full_name || e.requested_user?.username || 'Constable',
      reviewedBy: e.approved_user?.full_name,
      createdAt: e.created_at,
      updatedAt: e.updated_at,
      changesJson: e.changes_json,
    }));

    // Calculate aggregated statistics
    const allItems = [...formattedCases, ...formattedOffenders, ...formattedEdits];
    
    // Global stats across all submissions for user
    const stats = {
      total: allItems.length,
      pending: allItems.filter(i => i.status === 'PENDING').length,
      changesRequested: allItems.filter(i => i.status === 'CHANGES_REQUESTED').length,
      approved: allItems.filter(i => i.status === 'APPROVED').length,
      rejected: allItems.filter(i => i.status === 'REJECTED').length,
    };

    res.json(successResponse({
      cases: formattedCases,
      offenders: formattedOffenders,
      editRequests: formattedEdits,
      items: allItems.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      stats,
    }));
  } catch (error) {
    console.error('getMySubmissions error:', error);
    res.status(500).json({ message: 'Server error fetching submissions' });
  }
};
