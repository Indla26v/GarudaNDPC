import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { convertBigIntsToNumbers, successResponse } from '../utils/transformers';
import { logAudit } from '../utils/audit-logger';

function formatEditRequest(r: any) {
  return {
    id: r.id.toString(),
    entity_type: r.entity_type,
    entity_id: r.entity_id.toString(),
    changes_json: r.changes_json,
    reason: r.reason,
    status: r.status,
    requested_by: r.requested_by.toString(),
    requested_at: r.requested_at,
    approved_by: r.approved_by?.toString() ?? null,
    approved_at: r.approved_at,
    rejection_reason: r.rejection_reason,
    created_at: r.created_at,
    requested_user: r.requested_user
      ? {
          id: r.requested_user.id.toString(),
          username: r.requested_user.username,
          full_name: r.requested_user.full_name,
          role: r.requested_user.role,
          police_station_id: r.requested_user.police_station_id?.toString() ?? null,
        }
      : null,
    approved_user: r.approved_user
      ? {
          id: r.approved_user.id.toString(),
          username: r.approved_user.username,
          full_name: r.approved_user.full_name,
          role: r.approved_user.role,
        }
      : null,
  };
}

async function applyEntityChanges(entityType: string, entityId: bigint, changesJson: string) {
  // ── SECURITY FIX #11: Mitigate insecure deserialization
  let changes: any;
  try {
    changes = JSON.parse(changesJson);
  } catch (err) {
    throw new Error('Invalid changes JSON');
  }

  if (typeof changes !== 'object' || changes === null || Array.isArray(changes)) {
    throw new Error('Changes must be an object');
  }

  if (entityType === 'CASE') {
    const data: Record<string, unknown> = {};
    if (typeof changes.firNo === 'string') data.fir_no = changes.firNo;
    else if (typeof changes.fir_no === 'string') data.fir_no = changes.fir_no;
    
    if (changes.psId) data.ps_id = BigInt(changes.psId);
    else if (changes.ps_id) data.ps_id = BigInt(changes.ps_id);
    
    if (typeof changes.sectionOfLaw === 'string') data.section_of_law = changes.sectionOfLaw;
    else if (typeof changes.section_of_law === 'string') data.section_of_law = changes.section_of_law;
    
    if (typeof changes.caseDate === 'string' || typeof changes.caseDate === 'number') data.case_date = new Date(changes.caseDate);
    else if (typeof changes.case_date === 'string' || typeof changes.case_date === 'number') data.case_date = new Date(changes.case_date);
    
    if (typeof changes.stage === 'string') data.stage = changes.stage;

    if (Object.keys(data).length > 0) {
      await prisma.cases.update({ where: { id: entityId }, data: data as any });
    }
  } else if (entityType === 'OFFENDER') {
    const dataObj: Record<string, unknown> = {};
    if (changes.fullName !== undefined) dataObj.full_name = changes.fullName;
    else if (changes.full_name !== undefined) dataObj.full_name = changes.full_name;
    
    if (changes.alias !== undefined) dataObj.alias = changes.alias;
    if (changes.fatherHusbandName !== undefined) dataObj.father_husband_name = changes.fatherHusbandName;
    else if (changes.father_husband_name !== undefined) dataObj.father_husband_name = changes.father_husband_name;

    if (changes.age !== undefined && changes.age !== null && changes.age !== '') dataObj.age = Number(changes.age);
    if (changes.gender !== undefined) dataObj.gender = changes.gender;
    if (changes.category !== undefined) dataObj.category = changes.category;
    if (changes.status !== undefined) dataObj.status = changes.status;
    if (changes.fullAddress !== undefined) dataObj.full_address = changes.fullAddress;
    if (changes.landmark !== undefined || changes.landmarkArea !== undefined) dataObj.landmark_area = changes.landmark || changes.landmarkArea;
    if (changes.district !== undefined) dataObj.district = changes.district;
    if (changes.state !== undefined) dataObj.state = changes.state;
    if (changes.occupation !== undefined) dataObj.occupation = changes.occupation;
    if (changes.monthlyIncome !== undefined && changes.monthlyIncome !== null && changes.monthlyIncome !== '') dataObj.monthly_income = Number(changes.monthlyIncome);
    if (changes.photoUrl !== undefined) dataObj.photo_url = changes.photoUrl;

    if (Object.keys(dataObj).length > 0) {
      await prisma.offenders.update({ where: { id: entityId }, data: dataObj as any });
    }

    if (changes.contacts && Array.isArray(changes.contacts)) {
      await prisma.offender_contacts.deleteMany({ where: { offender_id: entityId } });
      if (changes.contacts.length > 0) {
        await prisma.offender_contacts.createMany({
          data: changes.contacts.map((c: any) => ({
            offender_id: entityId,
            contact_type: c.contactType || c.contact_type,
            value: c.value,
            notes: c.notes
          }))
        });
      }
    }

    if (changes.financials && Array.isArray(changes.financials)) {
      await prisma.offender_financials.deleteMany({ where: { offender_id: entityId } });
      const filteredFin = changes.financials.filter((f: any) => (f.value ?? '').trim() !== '');
      if (filteredFin.length > 0) {
        await prisma.offender_financials.createMany({
          data: filteredFin.map((f: any) => ({
            offender_id: entityId,
            fin_type: f.finType || f.fin_type,
            value: f.value,
            bank_name: f.bankName || f.bank_name || null,
            notes: f.notes || null
          }))
        });
      }
    }
  }
}

export const getEditRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!.role;
    const userId = req.user!.userId;
    const psId = req.user!.policeStationId;
    const { status, entityType, page = 0, size = 20 } = req.query;

    const where: any = {};
    if (status) {
      const parts = String(status).split(',').map(s => s.trim()).filter(Boolean);
      if (parts.includes('ALL')) {
        // no status filter
      } else if (parts.length > 1) {
        where.status = { in: parts };
      } else if (parts.length === 1) {
        where.status = parts[0];
      }
    }
    if (entityType) where.entity_type = String(entityType);

    if (['SHO', 'SDPO', 'ASP', 'DSP'].includes(userRole)) {
      if (psId) {
        where.requested_user = { police_station_id: BigInt(psId) };
      }
    } else if (userRole === 'CONSTABLE') {
      where.requested_by = BigInt(userId);
    } else if (userRole === 'SP') {
      // SP sees all edit requests
    }

    const skip = Number(page) * Number(size);
    const take = Number(size);

    const [requests, total] = await Promise.all([
      prisma.edit_requests.findMany({
        where,
        include: {
          requested_user: {
            select: { id: true, username: true, full_name: true, role: true, police_station_id: true },
          },
          approved_user: { select: { id: true, username: true, full_name: true, role: true } },
        },
        orderBy: { requested_at: 'desc' },
        skip,
        take,
      }),
      prisma.edit_requests.count({ where }),
    ]);

    res.json(
      successResponse({
        content: requests.map(formatEditRequest),
        totalElements: total,
        totalPages: Math.ceil(total / take),
      })
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getEditRequestById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const request = await prisma.edit_requests.findUnique({
      where: { id: BigInt(id as string) },
      include: {
        requested_user: true,
        approved_user: true,
      },
    });

    if (!request) return res.status(404).json({ message: 'Edit request not found' });

    res.json(successResponse(formatEditRequest(request)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createEditRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, entityId, changes, changesJson, reason } = req.body;
    const userId = req.user!.userId;

    const payload = changesJson ?? (changes ? JSON.stringify(changes) : null);
    if (!entityType || !entityId || !payload || !reason) {
      return res.status(400).json({ message: 'Missing required fields: entityType, entityId, changes/changesJson, reason' });
    }

    const newReq = await prisma.edit_requests.create({
      data: {
        entity_type: entityType,
        entity_id: BigInt(entityId),
        changes_json: typeof payload === 'string' ? payload : JSON.stringify(payload),
        reason,
        status: 'PENDING',
        requested_by: BigInt(userId),
      },
    });

    await logAudit('EDIT_REQUESTED', 'EDIT_REQUEST', newReq.id, req, `Edit request for ${entityType} ${entityId}`);

    res.status(201).json(successResponse({ id: newReq.id.toString() }, 'Edit request submitted'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveEditRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const approverId = req.user!.userId;
    const approverRole = req.user!.role;
    const approverPsId = req.user!.policeStationId;

    if (!['SDPO', 'SP', 'SHO', 'ASP', 'DSP'].includes(approverRole)) {
      return res.status(403).json({ message: 'Only SHO, SDPO, ASP, or SP can approve edit requests' });
    }

    const request = await prisma.edit_requests.findUnique({
      where: { id: BigInt(id as string) },
      include: { requested_user: true },
    });

    if (!request) return res.status(404).json({ message: 'Edit request not found' });
    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: `Cannot approve request in ${request.status} state` });
    }

    if (['SHO', 'SDPO', 'DSP'].includes(approverRole) && approverPsId) {
      if (request.requested_user?.police_station_id && String(request.requested_user.police_station_id) !== String(approverPsId)) {
        return res.status(403).json({ message: 'You can only approve edit requests for your assigned police station' });
      }
    }

    await prisma.$transaction(async (tx) => {
      await applyEntityChanges(request.entity_type, request.entity_id, request.changes_json);

      await tx.edit_requests.update({
        where: { id: BigInt(id as string) },
        data: {
          status: 'APPROVED',
          approved_by: BigInt(approverId),
          approved_at: new Date(),
        },
      });
    }, { maxWait: 15000, timeout: 60000 });

    await logAudit('EDIT_APPROVED', 'EDIT_REQUEST', BigInt(id as string), req, `Approved ${request.entity_type} ${request.entity_id}`);

    res.json(successResponse({ id }, 'Edit request approved and changes committed to database'));
  } catch (error: any) {
    console.error('approveEditRequest error:', error);
    res.status(500).json({ message: 'Failed to process edit request' });
  }
};

export const rejectEditRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const userPsId = req.user!.policeStationId;
    const { rejectionReason, notes, reason } = req.body;

    if (!['SDPO', 'SP', 'SHO', 'ASP', 'DSP'].includes(userRole)) {
      return res.status(403).json({ message: 'Only SHO, SDPO, ASP, or SP can reject edit requests' });
    }

    const request = await prisma.edit_requests.findUnique({
      where: { id: BigInt(id as string) },
      include: { requested_user: true },
    });

    if (!request) return res.status(404).json({ message: 'Edit request not found' });

    if (['SHO', 'SDPO', 'DSP'].includes(userRole) && userPsId) {
      if (request.requested_user?.police_station_id && String(request.requested_user.police_station_id) !== String(userPsId)) {
        return res.status(403).json({ message: 'You can only reject edit requests for your assigned police station' });
      }
    }

    const noteText = rejectionReason || notes || reason || 'Rejected by SHO';

    await prisma.edit_requests.update({
      where: { id: BigInt(id as string) },
      data: {
        status: 'REJECTED',
        approved_by: BigInt(userId),
        approved_at: new Date(),
        rejection_reason: noteText,
      },
    });

    await logAudit('EDIT_REJECTED', 'EDIT_REQUEST', BigInt(id as string), req, `Edit request rejected: ${noteText}`);

    res.json(successResponse({ id }, 'Edit request rejected'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const requestChangesEditRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const userPsId = req.user!.policeStationId;
    const { notes, reason, rejectionReason } = req.body;

    if (!['SDPO', 'SP', 'SHO', 'ASP', 'DSP'].includes(userRole)) {
      return res.status(403).json({ message: 'Only SHO, SDPO, ASP, or SP can request changes on edit requests' });
    }

    const noteText = notes || reason || rejectionReason;
    if (!noteText || !noteText.trim()) {
      return res.status(400).json({ message: 'Please provide instructions/notes about the required changes' });
    }

    const request = await prisma.edit_requests.findUnique({
      where: { id: BigInt(id as string) },
      include: { requested_user: true },
    });

    if (!request) return res.status(404).json({ message: 'Edit request not found' });

    if (['SHO', 'SDPO', 'DSP'].includes(userRole) && userPsId) {
      if (request.requested_user?.police_station_id && String(request.requested_user.police_station_id) !== String(userPsId)) {
        return res.status(403).json({ message: 'You can only review edit requests for your assigned police station' });
      }
    }

    await prisma.edit_requests.update({
      where: { id: BigInt(id as string) },
      data: {
        status: 'CHANGES_REQUESTED',
        approved_by: BigInt(userId),
        approved_at: new Date(),
        rejection_reason: noteText.trim(),
      },
    });

    await logAudit('EDIT_REJECTED', 'EDIT_REQUEST', BigInt(id as string), req, `Changes requested on edit request: ${noteText.trim()}`);

    res.json(successResponse({ id }, 'Changes requested successfully. Sent back to Constable for revision.'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
