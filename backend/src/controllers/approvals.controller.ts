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
      data: { approval_status: 'APPROVED' }
    });

    await logAudit('UPDATE', 'CASE', BigInt(id), req, 'Approved pending case');
    broadcastEvent('data_updated', { entity: 'case', id });

    res.json(successResponse({ id }, 'Case approved successfully'));
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

    if (!['SHO', 'SDPO', 'SP', 'ASP'].includes(userRole)) {
      return res.status(403).json({ message: 'Only SHO and above can reject records' });
    }

    const existingCase = await prisma.cases.findUnique({ where: { id: BigInt(id) } });
    if (!existingCase) return res.status(404).json({ message: 'Case not found' });

    if (userRole === 'SHO' && existingCase.ps_id !== userPsId) {
      return res.status(403).json({ message: 'You can only reject records from your own police station' });
    }

    await prisma.cases.update({
      where: { id: BigInt(id) },
      data: { approval_status: 'REJECTED' }
    });

    await logAudit('UPDATE', 'CASE', BigInt(id), req, 'Rejected pending case');
    broadcastEvent('data_updated', { entity: 'case', id });

    res.json(successResponse({ id }, 'Case rejected successfully'));
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
      data: { approval_status: 'APPROVED' }
    });

    await logAudit('UPDATE', 'OFFENDER', BigInt(id), req, 'Approved pending offender');
    broadcastEvent('offender_created', { id: id.toString() });

    res.json(successResponse({ id }, 'Offender approved successfully'));
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

    if (!['SHO', 'SDPO', 'SP', 'ASP'].includes(userRole)) {
      return res.status(403).json({ message: 'Only SHO and above can reject records' });
    }

    const existingOffender = await prisma.offenders.findUnique({ where: { id: BigInt(id) } });
    if (!existingOffender) return res.status(404).json({ message: 'Offender not found' });

    if (userRole === 'SHO' && existingOffender.ps_id !== userPsId) {
      return res.status(403).json({ message: 'You can only reject records from your own police station' });
    }

    await prisma.offenders.update({
      where: { id: BigInt(id) },
      data: { approval_status: 'REJECTED' }
    });

    await logAudit('UPDATE', 'OFFENDER', BigInt(id), req, 'Rejected pending offender');
    broadcastEvent('offender_created', { id: id.toString() });

    res.json(successResponse({ id }, 'Offender rejected successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
