import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { successResponse } from '../utils/transformers';
import { logAudit } from '../utils/audit-logger';
import { paramId } from '../utils/params';
import { broadcastEvent } from './sse.controller';

export const getChargeSheet = async (req: AuthRequest, res: Response) => {
  try {
    const caseId = paramId(req);
    const cs = await prisma.charge_sheets.findUnique({
      where: { case_id: caseId },
    });
    res.json(
      successResponse(
        cs
          ? {
              id: cs.id.toString(),
              caseId: cs.case_id.toString(),
              expectedSubmissionDate: cs.expected_submission_date,
              actualSubmissionDate: cs.actual_submission_date,
              missingDocuments: cs.missing_documents,
              prosecutorName: cs.prosecutor_name,
              notes: cs.notes,
              createdAt: cs.created_at,
              updatedAt: cs.updated_at,
            }
          : null
      )
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const upsertChargeSheet = async (req: AuthRequest, res: Response) => {
  try {
    const caseId = paramId(req);
    const d = req.body;
    const updateData: Record<string, unknown> = { updated_at: new Date() };
    if (d.expectedSubmissionDate !== undefined || d.expected_submission_date !== undefined) {
      const dateVal = d.expectedSubmissionDate ?? d.expected_submission_date;
      updateData.expected_submission_date = dateVal ? new Date(dateVal) : null;
    }
    if (d.actualSubmissionDate !== undefined || d.actual_submission_date !== undefined) {
      const dateVal = d.actualSubmissionDate ?? d.actual_submission_date;
      updateData.actual_submission_date = dateVal ? new Date(dateVal) : null;
    }
    if (d.missingDocuments !== undefined || d.missing_documents !== undefined) {
      updateData.missing_documents = d.missingDocuments ?? d.missing_documents;
    }
    if (d.prosecutorName !== undefined || d.prosecutor_name !== undefined) {
      updateData.prosecutor_name = d.prosecutorName ?? d.prosecutor_name;
    }
    if (d.notes !== undefined) updateData.notes = d.notes;

    const cs = await prisma.charge_sheets.upsert({
      where: { case_id: caseId },
      create: {
        case_id: caseId,
        expected_submission_date: d.expectedSubmissionDate || d.expected_submission_date ? new Date(d.expectedSubmissionDate || d.expected_submission_date) : null,
        actual_submission_date: d.actualSubmissionDate || d.actual_submission_date ? new Date(d.actualSubmissionDate || d.actual_submission_date) : null,
        missing_documents: d.missingDocuments ?? d.missing_documents,
        prosecutor_name: d.prosecutorName ?? d.prosecutor_name,
        notes: d.notes,
      },
      update: updateData as any,
    });

    // Auto update stage to CHARGESHEET if case is currently in FIR stage
    const currentCase = await prisma.cases.findUnique({ where: { id: caseId } });
    if (currentCase && currentCase.stage === 'FIR') {
      await prisma.cases.update({
        where: { id: caseId },
        data: { stage: 'CHARGESHEET', updated_at: new Date() },
      });
    }

    await logAudit('UPDATE', 'CHARGE_SHEET', cs.id, req);
    broadcastEvent('data_updated', { entity: 'charge_sheet', id: cs.id.toString(), caseId: caseId.toString() });
    res.json(successResponse({ id: cs.id.toString() }, 'Charge sheet saved'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCourtHearings = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.court_hearings.findMany({
      where: { case_id: paramId(req) },
      orderBy: { hearing_date: 'desc' },
    });
    res.json(
      successResponse(
        rows.map((h) => ({
          id: h.id.toString(),
          caseId: h.case_id.toString(),
          scNumber: h.sc_number,
          courtName: h.court_name,
          hearingDate: h.hearing_date,
          judgeName: h.judge_name,
          orderText: h.order_text,
          nextHearingDate: h.next_hearing_date,
          createdAt: h.created_at,
        }))
      )
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addCourtHearing = async (req: AuthRequest, res: Response) => {
  try {
    const caseId = paramId(req);
    const d = req.body;
    const h = await prisma.court_hearings.create({
      data: {
        case_id: caseId,
        sc_number: d.scNumber ?? d.sc_number,
        court_name: d.courtName ?? d.court_name,
        hearing_date: d.hearingDate || d.hearing_date ? new Date(d.hearingDate || d.hearing_date) : null,
        judge_name: d.judgeName ?? d.judge_name,
        order_text: d.orderText ?? d.order_text,
        next_hearing_date: d.nextHearingDate || d.next_hearing_date ? new Date(d.nextHearingDate || d.next_hearing_date) : null,
      },
    });

    // Auto update stage to TRIAL if case is currently in FIR or CHARGESHEET stage
    const currentCase = await prisma.cases.findUnique({ where: { id: caseId } });
    if (currentCase && (currentCase.stage === 'FIR' || currentCase.stage === 'CHARGESHEET')) {
      await prisma.cases.update({
        where: { id: caseId },
        data: { stage: 'TRIAL', updated_at: new Date() },
      });
    }

    await logAudit('CREATE', 'COURT_HEARING', h.id, req);
    broadcastEvent('data_updated', { entity: 'court_hearing', id: h.id.toString(), caseId: h.case_id.toString() });
    res.status(201).json(successResponse({ id: h.id.toString() }, 'Hearing added'));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBailRecords = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.bail_records.findMany({
      where: { case_id: paramId(req) },
      orderBy: { created_at: 'desc' },
    });
    res.json(
      successResponse(
        rows.map((b) => ({
          id: b.id.toString(),
          caseId: b.case_id.toString(),
          caseAccusedId: b.case_accused_id?.toString() ?? null,
          applicationDate: b.application_date,
          status: b.status,
          grantedDate: b.granted_date,
          courtName: b.court_name,
          suretyDetails: b.surety_details,
          conditions: b.conditions,
          notes: b.notes,
          createdAt: b.created_at,
        }))
      )
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addBailRecord = async (req: AuthRequest, res: Response) => {
  try {
    const d = req.body;
    const b = await prisma.bail_records.create({
      data: {
        case_id: paramId(req),
        case_accused_id: d.caseAccusedId || d.case_accused_id ? BigInt(d.caseAccusedId || d.case_accused_id) : null,
        application_date: d.applicationDate || d.application_date ? new Date(d.applicationDate || d.application_date) : null,
        status: d.status || 'PENDING',
        granted_date: d.grantedDate || d.granted_date ? new Date(d.grantedDate || d.granted_date) : null,
        court_name: d.courtName ?? d.court_name,
        surety_details: d.suretyDetails ?? d.surety_details,
        conditions: d.conditions,
        notes: d.notes,
      },
    });
    await logAudit('CREATE', 'BAIL_RECORD', b.id, req);
    broadcastEvent('data_updated', { entity: 'bail_record', id: b.id.toString(), caseId: b.case_id.toString() });
    res.status(201).json(successResponse({ id: b.id.toString() }, 'Bail record added'));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInterrogations = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.interrogation_sessions.findMany({
      where: { offender_id: paramId(req, 'offenderId') },
      include: { users: { select: { full_name: true } } },
      orderBy: { session_at: 'desc' },
    });
    res.json(successResponse(rows.map((s) => ({
      id: s.id.toString(),
      offenderId: s.offender_id.toString(),
      caseId: s.case_id?.toString() ?? null,
      officerName: s.users?.full_name,
      sessionAt: s.session_at,
      sourceInfo: s.source_info,
      purchasePrice: s.purchase_price,
      sellingPrice: s.selling_price,
      deliveryMode: s.delivery_mode,
      paymentMode: s.payment_mode,
      networkMembers: s.network_members,
      mobilesDisclosed: s.mobiles_disclosed,
      intelInputs: s.intel_inputs,
      notes: s.notes,
    }))));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addInterrogation = async (req: AuthRequest, res: Response) => {
  try {
    const d = req.body;
    const userId = req.user!?.userId;
    const s = await prisma.interrogation_sessions.create({
      data: {
        offender_id: paramId(req, 'offenderId'),
        case_id: d.caseId || d.case_id ? BigInt(d.caseId || d.case_id) : null,
        officer_id: userId ? BigInt(userId) : null,
        session_at: d.sessionAt || d.session_at ? new Date(d.sessionAt || d.session_at) : new Date(),
        source_info: d.sourceInfo ?? d.source_info,
        purchase_price: d.purchasePrice ?? d.purchase_price,
        selling_price: d.sellingPrice ?? d.selling_price,
        delivery_mode: d.deliveryMode ?? d.delivery_mode,
        payment_mode: d.paymentMode ?? d.payment_mode,
        network_members: d.networkMembers ?? d.network_members,
        mobiles_disclosed: d.mobilesDisclosed ?? d.mobiles_disclosed,
        intel_inputs: d.intelInputs ?? d.intel_inputs,
        notes: d.notes,
      },
    });
    await logAudit('CREATE', 'INTERROGATION', s.id, req);
    res.status(201).json(successResponse({ id: s.id.toString() }, 'Interrogation session saved'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
