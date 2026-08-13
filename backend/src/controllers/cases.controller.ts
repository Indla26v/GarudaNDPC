import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { successResponse } from '../utils/transformers';
import { logAudit } from '../utils/audit-logger';
import { getCaseWhere } from '../utils/scope';
import { paramId } from '../utils/params';
import { broadcastEvent } from './sse.controller';
import { isValidText, isValidSectionOfLaw, isValidNumeric } from '../utils/validators';
import { handleControllerError } from '../utils/error-handler';
import { generateCasePdf, CasePdfData } from '../utils/pdf-case-summary';
import { getImageBufferAndExtension } from './export.controller';
import { maskAadhaar, canRevealAadhaar } from '../utils/pii';

function toPhysicalPaths(relevantFilesStr: string | null | undefined): string | null {
  if (!relevantFilesStr) return null;
  try {
    const files = JSON.parse(relevantFilesStr);
    if (Array.isArray(files)) {
      const mapped = files.map(f => {
        if (f.url && f.url.startsWith('/api/uploads/')) {
          return { ...f, url: `uploads/${f.url.substring('/api/uploads/'.length)}` };
        }
        return f;
      });
      return JSON.stringify(mapped);
    }
  } catch (e) {
    return relevantFilesStr.split(',').map(url => {
      if (url.startsWith('/api/uploads/')) {
        return `uploads/${url.substring('/api/uploads/'.length)}`;
      }
      return url;
    }).join(',');
  }
  return relevantFilesStr;
}

function toWebUrls(relevantFilesStr: string | null | undefined): string | null {
  if (!relevantFilesStr) return null;
  try {
    const files = JSON.parse(relevantFilesStr);
    if (Array.isArray(files)) {
      const mapped = files.map(f => {
        if (f.url && f.url.startsWith('uploads/')) {
          return { ...f, url: `/api/uploads/${f.url.substring('uploads/'.length)}` };
        }
        return f;
      });
      return JSON.stringify(mapped);
    }
  } catch (e) {
    return relevantFilesStr.split(',').map(path => {
      if (path.startsWith('uploads/')) {
        return `/api/uploads/${path.substring('uploads/'.length)}`;
      }
      return path;
    }).join(',');
  }
  return relevantFilesStr;
}

function mapCaseData(data: any) {
  const mapped: Record<string, unknown> = {};
  if (data.firNo !== undefined || data.fir_no !== undefined) mapped.fir_no = data.firNo ?? data.fir_no;
  if (data.psId !== undefined || data.ps_id !== undefined) mapped.ps_id = BigInt(data.psId ?? data.ps_id);
  if (data.sectionOfLaw !== undefined || data.section_of_law !== undefined) {
    mapped.section_of_law = data.sectionOfLaw ?? data.section_of_law;
  }
  if (data.caseDate !== undefined || data.case_date !== undefined) {
    mapped.case_date = new Date(data.caseDate ?? data.case_date);
  }
  if (data.stage !== undefined) mapped.stage = data.stage;
  if (data.isHistorySheet !== undefined || data.is_history_sheet !== undefined) {
    mapped.is_history_sheet = data.isHistorySheet ?? data.is_history_sheet;
  }
  if (data.isRowdySheet !== undefined || data.is_rowdy_sheet !== undefined) {
    mapped.is_rowdy_sheet = data.isRowdySheet ?? data.is_rowdy_sheet;
  }
  if (data.relevantFiles !== undefined || data.relevant_files !== undefined) {
    const rawVal = data.relevantFiles ?? data.relevant_files;
    mapped.relevant_files = toPhysicalPaths(rawVal);
  }
  if (data.natureOfOffence !== undefined || data.nature_of_offence !== undefined) {
    mapped.nature_of_offence = data.natureOfOffence ?? data.nature_of_offence;
  }
  if (data.contrabandType !== undefined || data.contraband_type !== undefined) {
    mapped.contraband_type = data.contrabandType ?? data.contraband_type;
  }
  if (data.quantity !== undefined) mapped.quantity = data.quantity;
  if (data.quantityUnit !== undefined || data.quantity_unit !== undefined) {
    mapped.quantity_unit = data.quantityUnit ?? data.quantity_unit;
  }
  if (data.streetValue !== undefined || data.street_value !== undefined) {
    mapped.street_value = data.streetValue ?? data.street_value;
  }
  if (data.sourceLocation !== undefined || data.source_location !== undefined) {
    mapped.source_location = data.sourceLocation ?? data.source_location;
  }
  if (data.destinationLocation !== undefined || data.destination_location !== undefined) {
    mapped.destination_location = data.destinationLocation ?? data.destination_location;
  }
  if (data.intelligenceNotes !== undefined || data.intelligence_notes !== undefined) {
    mapped.intelligence_notes = data.intelligenceNotes ?? data.intelligence_notes;
  }
  if (data.department !== undefined) mapped.department = data.department;
  return mapped;
}

const caseInclude = {
  police_stations: true,
  users: true,
  case_accused: {
    include: {
      police_stations: true,
      offenders: {
        include: {
          offender_contacts: true,
          offender_identity_docs: true,
        }
      }
    }
  },
  seizures: true,
  seized_vehicles: true,
  charge_sheets: true,
  court_hearings: { orderBy: { hearing_date: 'desc' as const } },
  bail_records: { orderBy: { created_at: 'desc' as const } },
};

export const createCase = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    if (data.firNo && !isValidText(data.firNo)) return res.status(400).json({ message: 'FIR Number contains invalid special characters' });
    if (data.sectionOfLaw && !isValidSectionOfLaw(data.sectionOfLaw)) return res.status(400).json({ message: 'Section of Law contains invalid characters' });
    if (data.quantity && !/^\d*\.?\d*$/.test(String(data.quantity))) return res.status(400).json({ message: 'Quantity must be a valid number' });
    if (data.streetValue && !isValidNumeric(data.streetValue)) return res.status(400).json({ message: 'Street Value must be a valid number' });
    if (data.sourceLocation && !isValidText(data.sourceLocation)) return res.status(400).json({ message: 'Source Location contains invalid special characters' });
    if (data.destinationLocation && !isValidText(data.destinationLocation)) return res.status(400).json({ message: 'Destination Location contains invalid special characters' });
    
    // Seizure
    if (data.seizures && Array.isArray(data.seizures)) {
      for (const s of data.seizures) {
        if (s.contrabandKg && !/^\d*\.?\d*$/.test(String(s.contrabandKg))) return res.status(400).json({ message: 'Seizure contraband quantity must be a valid number' });
        if (s.cashAmount && !isValidNumeric(s.cashAmount)) return res.status(400).json({ message: 'Seizure cash amount must be a valid number' });
        if (s.vehiclesCount && !isValidNumeric(s.vehiclesCount)) return res.status(400).json({ message: 'Seizure vehicles count must be a valid number' });
      }
    }

    // Seized Vehicles
    if (data.seizedVehicles && Array.isArray(data.seizedVehicles)) {
      for (const v of data.seizedVehicles) {
        if (v.registrationNo && !/^[a-zA-Z0-9\s-]*$/.test(v.registrationNo)) return res.status(400).json({ message: `Vehicle Registration Number "${v.registrationNo}" contains invalid characters` });
        if (v.makeModel && !isValidText(v.makeModel)) return res.status(400).json({ message: `Vehicle Make/Model "${v.makeModel}" contains invalid characters` });
        if (v.color && !/^[a-zA-Z\s]*$/.test(v.color)) return res.status(400).json({ message: `Vehicle Color "${v.color}" contains invalid characters` });
        if (v.ownerName && !isValidText(v.ownerName)) return res.status(400).json({ message: `Vehicle Owner Name "${v.ownerName}" contains invalid characters` });
        if (v.seizureLocation && !isValidText(v.seizureLocation)) return res.status(400).json({ message: `Vehicle Seizure Location "${v.seizureLocation}" contains invalid characters` });
      }
    }

    const user = req.user!;
    const userId = user?.userId ? BigInt(user.userId) : null;

    let firNo = data.firNo || data.fir_no;
    if (!firNo && data.psId) {
      const ps = await prisma.police_stations.findUnique({ where: { id: BigInt(data.psId || data.ps_id) } });
      const year = new Date().getFullYear();
      const count = await prisma.cases.count({
        where: { ps_id: BigInt(data.psId || data.ps_id), case_date: { gte: new Date(`${year}-01-01`) } },
      });
      firNo = `${ps?.ps_code || 'PS'}/${year}/${count + 1}`;
    }

    const accusedList = Array.isArray(data.accused) ? data.accused : [];
    const seizureList = data.seizures
      ? Array.isArray(data.seizures)
        ? data.seizures
        : [data.seizures]
      : [];

    const newCase = await prisma.$transaction(async (tx) => {
      const created = await tx.cases.create({
        data: {
          ...mapCaseData({ ...data, firNo }),
          fir_no: firNo,
          created_by: userId,
          approval_status: user.role === 'CONSTABLE' ? 'PENDING' : 'APPROVED',
        } as any,
      });

      if (accusedList.length) {
        await tx.case_accused.createMany({
          data: accusedList.map((a: any) => ({
            case_id: created.id,
            offender_id: BigInt(a.offenderId || a.offender_id),
            arrest_status: a.arrestStatus || a.arrest_status || 'POLICE_CUSTODY',
            arrest_date: a.arrestDate || a.arrest_date ? new Date(a.arrestDate || a.arrest_date) : null,
          })),
        });
      }

      if (seizureList.length) {
        await tx.seizures.createMany({
          data: seizureList.map((s: any) => ({
            case_id: created.id,
            contraband_kg: s.contrabandKg ?? s.contraband_kg ?? null,
            vehicles_count: s.vehiclesCount ?? s.vehicles_count ?? 0,
            cash_amount: s.cashAmount ?? s.cash_amount ?? 0,
            parcels_count: s.parcelsCount ?? s.parcels_count ?? 0,
            other_items: s.otherItems ?? s.other_items ?? null,
            seizure_date: s.seizureDate || s.seizure_date ? new Date(s.seizureDate || s.seizure_date) : null,
          })),
        });
      }

      // Create seized vehicles if provided
      const vehicleList = Array.isArray(data.seizedVehicles) ? data.seizedVehicles : [];
      if (vehicleList.length) {
        await tx.seized_vehicles.createMany({
          data: vehicleList.map((v: any) => ({
            case_id: created.id,
            vehicle_type: v.vehicleType || v.vehicle_type || 'OTHER',
            registration_no: v.registrationNo || v.registration_no || 'UNKNOWN',
            make_model: v.makeModel || v.make_model || null,
            color: v.color || null,
            chassis_no: v.chassisNo || v.chassis_no || null,
            engine_no: v.engineNo || v.engine_no || null,
            owner_name: v.ownerName || v.owner_name || null,
            owner_address: v.ownerAddress || v.owner_address || null,
            seizure_location: v.seizureLocation || v.seizure_location || null,
            seizure_date: v.seizureDate || v.seizure_date ? new Date(v.seizureDate || v.seizure_date) : null,
            current_status: 'SEIZED',
            remarks: v.remarks || null,
          })),
        });
      }

      return created;
    }, { maxWait: 15000, timeout: 60000 });

    await logAudit('CREATE', 'CASE', newCase.id, req);
    broadcastEvent('case_created', { id: newCase.id.toString(), firNo: newCase.fir_no });
    res.status(201).json(successResponse({ id: newCase.id.toString(), firNo: newCase.fir_no }, 'Case created'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCase = async (req: AuthRequest, res: Response) => {
  try {
    const id = paramId(req);
    const scope = getCaseWhere(req.user!);
    const existing = await prisma.cases.findFirst({ where: { id, ...scope } });
    if (!existing) return res.status(404).json({ message: 'Case not found or access denied' });

    const data = req.body;
    if (data.firNo && !isValidText(data.firNo)) return res.status(400).json({ message: 'FIR Number contains invalid special characters' });
    if (data.sectionOfLaw && !isValidSectionOfLaw(data.sectionOfLaw)) return res.status(400).json({ message: 'Section of Law contains invalid characters' });
    if (data.quantity && !/^\d*\.?\d*$/.test(String(data.quantity))) return res.status(400).json({ message: 'Quantity must be a valid number' });
    if (data.streetValue && !isValidNumeric(data.streetValue)) return res.status(400).json({ message: 'Street Value must be a valid number' });
    if (data.sourceLocation && !isValidText(data.sourceLocation)) return res.status(400).json({ message: 'Source Location contains invalid special characters' });
    if (data.destinationLocation && !isValidText(data.destinationLocation)) return res.status(400).json({ message: 'Destination Location contains invalid special characters' });
    
    // Seizure
    if (data.seizures && Array.isArray(data.seizures)) {
      for (const s of data.seizures) {
        if (s.contrabandKg && !/^\d*\.?\d*$/.test(String(s.contrabandKg))) return res.status(400).json({ message: 'Seizure contraband quantity must be a valid number' });
        if (s.cashAmount && !isValidNumeric(s.cashAmount)) return res.status(400).json({ message: 'Seizure cash amount must be a valid number' });
        if (s.vehiclesCount && !isValidNumeric(s.vehiclesCount)) return res.status(400).json({ message: 'Seizure vehicles count must be a valid number' });
      }
    }

    // Seized Vehicles
    if (data.seizedVehicles && Array.isArray(data.seizedVehicles)) {
      for (const v of data.seizedVehicles) {
        if (v.registrationNo && !/^[a-zA-Z0-9\s-]*$/.test(v.registrationNo)) return res.status(400).json({ message: `Vehicle Registration Number "${v.registrationNo}" contains invalid characters` });
        if (v.makeModel && !isValidText(v.makeModel)) return res.status(400).json({ message: `Vehicle Make/Model "${v.makeModel}" contains invalid characters` });
        if (v.color && !/^[a-zA-Z\s]*$/.test(v.color)) return res.status(400).json({ message: `Vehicle Color "${v.color}" contains invalid characters` });
        if (v.ownerName && !isValidText(v.ownerName)) return res.status(400).json({ message: `Vehicle Owner Name "${v.ownerName}" contains invalid characters` });
        if (v.seizureLocation && !isValidText(v.seizureLocation)) return res.status(400).json({ message: `Vehicle Seizure Location "${v.seizureLocation}" contains invalid characters` });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedCase = await tx.cases.update({
        where: { id },
        data: { ...mapCaseData(req.body), updated_at: new Date() } as any,
        include: caseInclude,
      });

      // Handle seized vehicles sync if provided
      if (req.body.seizedVehicles && Array.isArray(req.body.seizedVehicles)) {
        const incoming = req.body.seizedVehicles;
        const incomingIds = incoming.filter((v: any) => v.id).map((v: any) => BigInt(v.id));

        // Delete vehicles that are not in the incoming array anymore
        await tx.seized_vehicles.deleteMany({
          where: {
            case_id: id,
            id: { notIn: incomingIds }
          }
        });

        // Upsert incoming vehicles
        for (const v of incoming) {
          const vData = {
            vehicle_type: v.vehicleType || v.vehicle_type || 'OTHER',
            registration_no: v.registrationNo || v.registration_no || 'UNKNOWN',
            make_model: v.makeModel || v.make_model || null,
            color: v.color || null,
            chassis_no: v.chassisNo || v.chassis_no || null,
            engine_no: v.engineNo || v.engine_no || null,
            owner_name: v.ownerName || v.owner_name || null,
            owner_address: v.ownerAddress || v.owner_address || null,
            seizure_location: v.seizureLocation || v.seizure_location || null,
            seizure_date: v.seizureDate || v.seizure_date ? new Date(v.seizureDate || v.seizure_date) : null,
            remarks: v.remarks || null,
          };

          if (v.id) {
            await tx.seized_vehicles.update({
              where: { id: BigInt(v.id) },
              data: vData
            });
          } else {
            await tx.seized_vehicles.create({
              data: {
                ...vData,
                case_id: id,
                current_status: 'SEIZED',
              }
            });
          }
        }
      }

      return tx.cases.findUnique({
        where: { id },
        include: caseInclude,
      });
    }, { maxWait: 15000, timeout: 60000 });

    if (!updated) throw new Error('Failed to fetch updated case');

    await logAudit('UPDATE', 'CASE', updated.id, req);
    broadcastEvent('data_updated', { entity: 'case', id: updated.id.toString() });
    res.json(successResponse(toCaseResponse(updated)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

import ExcelJS from 'exceljs';

export const getCases = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 0, size = 30, stage, search, timeRange, month, year, approvalStatus, psId } = req.query;
    const skip = Number(page) * Number(size);
    const take = Number(size);
    const scope = getCaseWhere(req.user!) as any;

    if (psId) {
      scope.ps_id = BigInt(psId as string);
    } else if (psId === '') {
      delete scope.ps_id;
    }

    if (approvalStatus) {
      scope.approval_status = String(approvalStatus);
    } else {
      scope.approval_status = 'APPROVED';
    }

    if (search) {
      scope.OR = [
        { fir_no: { contains: String(search), mode: 'insensitive' } },
        { section_of_law: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (timeRange === 'monthly') {
      const monthStr = month ? String(month) : new Date().toISOString().substring(0, 7);
      const [y, m] = monthStr.split('-').map(Number);
      if (y && m) {
        const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        scope.case_date = { gte: start, lte: end };
      }
    } else if (timeRange === 'yearly') {
      const y = year ? Number(year) : new Date().getFullYear();
      const start = new Date(y, 0, 1, 0, 0, 0, 0);
      const end = new Date(y, 11, 31, 23, 59, 59, 999);
      scope.case_date = { gte: start, lte: end };
    }

    // countScope is used to compute total stageCounts across all stages
    const countScope = { ...scope };

    // Specifically apply stage filter for the paginated table items
    if (stage) scope.stage = String(stage);

    const [cases, total, stageGroups] = await Promise.all([
      prisma.cases.findMany({
        where: scope,
        include: caseInclude,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      prisma.cases.count({ where: scope }),
      prisma.cases.groupBy({
        by: ['stage'],
        where: countScope,
        _count: { id: true },
      }),
    ]);

    const stageCounts: Record<string, number> = {
      FIR: 0,
      CHARGESHEET: 0,
      TRIAL: 0,
      CONVICTED: 0,
      ACQUITTED: 0,
      CLOSED: 0,
    };
    for (const group of stageGroups) {
      if (group.stage) {
        stageCounts[group.stage] = group._count.id;
      }
    }

    res.json(successResponse({
      content: cases.map((c) => toCaseResponse(c)),
      totalElements: total,
      totalPages: Math.ceil(total / take),
      stageCounts,
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const exportCasesExcel = async (req: AuthRequest, res: Response) => {
  try {
    const { stage, search, timeRange, month, year, approvalStatus } = req.query;
    const scope = getCaseWhere(req.user!) as any;

    if (approvalStatus) {
      scope.approval_status = String(approvalStatus);
    } else {
      scope.approval_status = 'APPROVED';
    }

    if (stage) scope.stage = String(stage);
    if (search) {
      scope.OR = [
        { fir_no: { contains: String(search), mode: 'insensitive' } },
        { section_of_law: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (timeRange === 'monthly') {
      const monthStr = month ? String(month) : new Date().toISOString().substring(0, 7);
      const [y, m] = monthStr.split('-').map(Number);
      if (y && m) {
        const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        scope.case_date = { gte: start, lte: end };
      }
    } else if (timeRange === 'yearly') {
      const y = year ? Number(year) : new Date().getFullYear();
      const start = new Date(y, 0, 1, 0, 0, 0, 0);
      const end = new Date(y, 11, 31, 23, 59, 59, 999);
      scope.case_date = { gte: start, lte: end };
    }

    const cases = await prisma.cases.findMany({
      where: scope,
      include: caseInclude,
      orderBy: { case_date: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cases Register');

    // Title Row
    worksheet.mergeCells('A1:L1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'GARUDA NDPS — CASE MANAGEMENT REGISTER';
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Headers
    const headers = [
      'Sl. No',
      'FIR No.',
      'Police Station',
      'Case Date',
      'Section of Law',
      'Stage',
      'Nature of Offence',
      'Contraband Type',
      'Quantity (Kg/Units)',
      'Street Value (₹)',
      'Accused Persons',
      'Seizure Summary',
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8750A' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    cases.forEach((c, index) => {
      const formattedDate = c.case_date ? new Date(c.case_date).toLocaleDateString('en-GB') : '-';
      const accusedNames = c.case_accused?.map((ca: any) => ca.offenders?.full_name).filter(Boolean).join(', ') || '-';
      const seizureSummary = c.seizures?.map((s: any) => `${s.contraband_kg ? s.contraband_kg + 'kg' : ''} ${s.cash_amount ? '₹' + s.cash_amount : ''}`).filter(Boolean).join('; ') || '-';

      const row = worksheet.addRow([
        index + 1,
        c.fir_no || '-',
        c.police_stations?.name || '-',
        formattedDate,
        c.section_of_law || '-',
        c.stage || '-',
        c.nature_of_offence || '-',
        c.contraband_type || '-',
        c.quantity ? `${c.quantity} ${c.quantity_unit || ''}` : '-',
        c.street_value ? Number(c.street_value) : 0,
        accusedNames,
        seizureSummary,
      ]);

      row.height = 22;
      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          vertical: 'middle',
          horizontal: colNumber === 1 || colNumber === 4 || colNumber === 6 ? 'center' : (colNumber === 10 ? 'right' : 'left'),
        };
        cell.font = { name: 'Arial', size: 9.5 };
      });
    });

    worksheet.columns = [
      { width: 8 },  // Sl. No
      { width: 22 }, // FIR No
      { width: 22 }, // Police Station
      { width: 14 }, // Case Date
      { width: 28 }, // Section of Law
      { width: 16 }, // Stage
      { width: 20 }, // Nature of Offence
      { width: 18 }, // Contraband Type
      { width: 18 }, // Quantity
      { width: 16 }, // Street Value
      { width: 30 }, // Accused
      { width: 28 }, // Seizure
    ];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="cases-export-${Date.now()}.xlsx"`);

    await logAudit('EXPORT', 'CASE', null, req, `Exported ${cases.length} cases to Excel`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting cases:', error);
    res.status(500).json({ message: 'Failed to export cases to Excel' });
  }
};

export const getCaseById = async (req: AuthRequest, res: Response) => {
  try {
    const id = paramId(req);
    const scope = getCaseWhere(req.user!);
    const caseItem = await prisma.cases.findFirst({
      where: { id, ...scope },
      include: caseInclude,
    });

    if (!caseItem) return res.status(404).json({ message: 'Case not found' });
    res.json(successResponse(toCaseResponse(caseItem)));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAccused = async (req: AuthRequest, res: Response) => {
  try {
    const id = paramId(req);
    const accusedData = Array.isArray(req.body) ? req.body : [req.body];

    // ── SECURITY FIX #15: Verify user has jurisdiction over this case
    const scope = getCaseWhere(req.user!);
    const caseRecord = await prisma.cases.findFirst({ where: { id, ...scope } });
    if (!caseRecord) return res.status(404).json({ message: 'Case not found or access denied' });

    // ── Fetch existing accused to detect status transitions ──────────────
    const existingAccused = await prisma.case_accused.findMany({
      where: { case_id: id },
      include: { offenders: { select: { full_name: true } } },
    });
    const existingMap = new Map(
      existingAccused.map(ea => [ea.offender_id.toString(), ea])
    );

    // ── Detect and log arrest status transitions ─────────────────────────
    for (const incoming of accusedData) {
      const offId = String(incoming.offenderId || incoming.offender_id);
      const newStatus = incoming.arrestStatus || incoming.arrest_status || 'POLICE_CUSTODY';
      const existing = existingMap.get(offId);

      if (existing && existing.arrest_status !== newStatus) {
        const offenderName = existing.offenders?.full_name || `#${offId}`;
        await logAudit(
          'UPDATE',
          'CASE_ACCUSED',
          id,
          req,
          `Arrest status changed: ${existing.arrest_status} → ${newStatus} for ${offenderName} (offender #${offId}) in case #${id}`
        );
      }
    }

    await prisma.case_accused.deleteMany({ where: { case_id: id } });

    const creates = accusedData.map((a: any) => {
      const offIdStr = String(a.offenderId || a.offender_id);
      const existing = existingMap.get(offIdStr);

      return {
        case_id: id,
        offender_id: BigInt(offIdStr),
        previous_cr_no: a.previousCrNo || a.previous_cr_no || existing?.previous_cr_no || null,
        previous_ps_id: a.previousPsId || a.previous_ps_id 
          ? BigInt(a.previousPsId || a.previous_ps_id) 
          : existing?.previous_ps_id 
            ? BigInt(existing.previous_ps_id) 
            : null,
        arrest_status: a.arrestStatus || a.arrest_status || existing?.arrest_status || 'POLICE_CUSTODY',
        arrest_date: a.arrestDate || a.arrest_date 
          ? new Date(a.arrestDate || a.arrest_date) 
          : existing?.arrest_date 
            ? new Date(existing.arrest_date) 
            : null,
        bail_date: a.bailDate || a.bail_date 
          ? new Date(a.bailDate || a.bail_date) 
          : existing?.bail_date 
            ? new Date(existing.bail_date) 
            : null,
        bail_conditions: a.bailConditions || a.bail_conditions || existing?.bail_conditions || null,
      };
    });

    if (creates.length > 0) await prisma.case_accused.createMany({ data: creates });
    await logAudit('UPDATE', 'CASE', id, req, 'Accused list updated');
    broadcastEvent('data_updated', { entity: 'case', id: id.toString() });
    res.json(successResponse({ id: id.toString() }, 'Accused list updated'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSeizure = async (req: AuthRequest, res: Response) => {
  try {
    const id = paramId(req);
    const seizureData = req.body;

    // ── SECURITY FIX #15: Verify user has jurisdiction over this case
    const scope = getCaseWhere(req.user!);
    const caseRecord = await prisma.cases.findFirst({ where: { id, ...scope } });
    if (!caseRecord) return res.status(404).json({ message: 'Case not found or access denied' });

    await prisma.seizures.deleteMany({ where: { case_id: id } });

    const dataArr = Array.isArray(seizureData) ? seizureData : [seizureData];
    if (dataArr.length > 0) {
      await prisma.seizures.createMany({
        data: dataArr.map((s: any) => ({
          case_id: id,
          contraband_kg: s.contrabandKg ?? s.contraband_kg,
          vehicles_count: s.vehiclesCount ?? s.vehicles_count ?? 0,
          cash_amount: s.cashAmount ?? s.cash_amount ?? 0,
          parcels_count: s.parcelsCount ?? s.parcels_count ?? 0,
          other_items: s.otherItems ?? s.other_items,
          seizure_date: s.seizureDate || s.seizure_date ? new Date(s.seizureDate || s.seizure_date) : null,
        })),
      });
    }

    await logAudit('UPDATE_SEIZURE', 'CASE', id, req);
    broadcastEvent('data_updated', { entity: 'case', id: id.toString() });
    res.json(successResponse({ id: id.toString() }, 'Seizure updated'));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCasesByOffender = async (req: AuthRequest, res: Response) => {
  try {
    const offenderId = paramId(req, 'offenderId');

    // ── SECURITY FIX #15: Scope cases to user's jurisdiction
    const scope = getCaseWhere(req.user!);
    const cases = await prisma.cases.findMany({
      where: {
        ...scope,
        case_accused: { some: { offender_id: offenderId } },
      },
      include: caseInclude,
      orderBy: { case_date: 'desc' },
    });
    res.json(successResponse(cases.map((c) => toCaseResponse(c))));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

function toCaseResponse(c: any) {
  return {
    id: c.id.toString(),
    firNo: c.fir_no,
    psId: c.ps_id.toString(),
    psName: c.police_stations?.name,
    stationType: c.police_stations?.station_type,
    sectionOfLaw: c.section_of_law,
    caseDate: c.case_date,
    stage: c.stage,
    natureOfOffence: c.nature_of_offence,
    contrabandType: c.contraband_type,
    quantity: c.quantity,
    quantityUnit: c.quantity_unit,
    streetValue: c.street_value,
    sourceLocation: c.source_location,
    destinationLocation: c.destination_location,
    intelligenceNotes: c.intelligence_notes,
    department: c.department,
    isHistorySheet: c.is_history_sheet,
    isRowdySheet: c.is_rowdy_sheet,
    relevantFiles: toWebUrls(c.relevant_files),
    createdByName: c.users?.full_name,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    accused: c.case_accused?.map((ca: any) => ({
      id: ca.id.toString(),
      offenderId: ca.offender_id.toString(),
      offenderName: ca.offenders?.full_name,
      previousCrNo: ca.previous_cr_no,
      previousPsId: ca.previous_ps_id?.toString(),
      arrestStatus: ca.arrest_status,
      arrestDate: ca.arrest_date,
      bailDate: ca.bail_date,
      bailConditions: ca.bail_conditions,
    })) ?? [],
    seizures: c.seizures?.map((s: any) => ({
      id: s.id.toString(),
      contrabandKg: s.contraband_kg,
      vehiclesCount: s.vehicles_count,
      cashAmount: s.cash_amount,
      parcelsCount: s.parcels_count,
      otherItems: s.other_items,
      seizureDate: s.seizure_date,
    })) ?? [],
    chargeSheet: c.charge_sheets
      ? {
          id: c.charge_sheets.id.toString(),
          expectedSubmissionDate: c.charge_sheets.expected_submission_date,
          actualSubmissionDate: c.charge_sheets.actual_submission_date,
          missingDocuments: c.charge_sheets.missing_documents,
          prosecutorName: c.charge_sheets.prosecutor_name,
          notes: c.charge_sheets.notes,
        }
      : null,
    courtHearings: c.court_hearings?.map((h: any) => ({
      id: h.id.toString(),
      scNumber: h.sc_number,
      courtName: h.court_name,
      hearingDate: h.hearing_date,
      judgeName: h.judge_name,
      orderText: h.order_text,
      nextHearingDate: h.next_hearing_date,
    })) ?? [],
    bailRecords: c.bail_records?.map((b: any) => ({
      id: b.id.toString(),
      caseAccusedId: b.case_accused_id?.toString(),
      applicationDate: b.application_date,
      status: b.status,
      grantedDate: b.granted_date,
      courtName: b.court_name,
      suretyDetails: b.surety_details,
      conditions: b.conditions,
      notes: b.notes,
    })) ?? [],
    seizedVehicles: c.seized_vehicles?.map((v: any) => ({
      id: v.id.toString(),
      caseId: v.case_id.toString(),
      vehicleType: v.vehicle_type,
      registrationNo: v.registration_no,
      makeModel: v.make_model,
      color: v.color,
      chassisNo: v.chassis_no,
      engineNo: v.engine_no,
      ownerName: v.owner_name,
      ownerAddress: v.owner_address,
      seizureLocation: v.seizure_location,
      seizureDate: v.seizure_date,
      currentStatus: v.current_status,
      courtOrderNo: v.court_order_no,
      remarks: v.remarks,
      createdAt: v.created_at,
    })) ?? [],
  };
}

export const exportCasePdf = async (req: AuthRequest, res: Response) => {
  try {
    const id = paramId(req);
    const scope = getCaseWhere(req.user!);
    const caseRecord = await prisma.cases.findFirst({
      where: { id, ...scope },
      include: caseInclude,
    });

    if (!caseRecord) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const userRole = req.user?.role || '';
    const userName = (req.user as any)?.name || req.user?.username || 'Officer';

    // Prepare Accused Data list with photo buffers
    const accusedList = [];
    if (caseRecord.case_accused && Array.isArray(caseRecord.case_accused)) {
      for (const ca of caseRecord.case_accused) {
        const o = ca.offenders;
        let photoBuffer: Buffer | null = null;

        if (o?.photo_url) {
          const imgInfo = await getImageBufferAndExtension(o.photo_url);
          if (imgInfo) {
            photoBuffer = imgInfo.buffer;
          }
        }

        const contacts = o?.offender_contacts || [];
        const primaryContactObj = contacts.find((c: any) => c.contact_type === 'MOBILE_PRIMARY')
                                || contacts.find((c: any) => c.contact_type?.startsWith('MOBILE'))
                                || contacts[0];
        const primaryContact = primaryContactObj?.value || '—';

        const docs = o?.offender_identity_docs || [];
        const aadhaar = docs[0]?.aadhaar_no || docs.find((d: any) => d.aadhaar_no)?.aadhaar_no;
        const formattedAadhaar = aadhaar
          ? (canRevealAadhaar(userRole) ? aadhaar : (maskAadhaar(aadhaar) || '—'))
          : '—';

        let arrestDateStr = '—';
        if (ca.arrest_date) {
          const d = new Date(ca.arrest_date);
          if (!isNaN(d.getTime())) {
            arrestDateStr = d.toLocaleDateString('en-IN');
          }
        }

        accusedList.push({
          fullName: o?.full_name || 'Unknown',
          alias: o?.alias,
          category: o?.category,
          arrestStatus: ca.arrest_status,
          arrestDate: arrestDateStr,
          psName: ca.police_stations?.name || caseRecord.police_stations?.name,
          mobile: primaryContact,
          aadhaarNo: formattedAadhaar,
          photoBuffer,
        });
      }
    }

    const cs = caseRecord.charge_sheets;
    const latestHearing = caseRecord.court_hearings?.[0];

    const pdfData: CasePdfData = {
      caseInfo: {
        firNo: caseRecord.fir_no,
        psName: caseRecord.police_stations?.name || '—',
        caseDate: caseRecord.case_date ? new Date(caseRecord.case_date).toLocaleDateString('en-IN') : '—',
        stage: caseRecord.stage,
        sectionOfLaw: caseRecord.section_of_law || '—',
        contrabandType: caseRecord.contraband_type,
        quantity: caseRecord.quantity ? String(caseRecord.quantity) : null,
        quantityUnit: caseRecord.quantity_unit,
        streetValue: caseRecord.street_value ? String(caseRecord.street_value) : null,
        sourceLocation: caseRecord.source_location,
        destinationLocation: caseRecord.destination_location,
        intelligenceNotes: caseRecord.intelligence_notes,
      },
      accusedList,
      chargeSheetInfo: cs ? {
        chargeSheetNo: cs.actual_submission_date ? `Submitted on ${new Date(cs.actual_submission_date).toLocaleDateString('en-IN')}` : 'Filing In Progress',
        filingDate: cs.actual_submission_date ? new Date(cs.actual_submission_date).toLocaleDateString('en-IN') : null,
        courtName: latestHearing?.court_name || null,
        ccStNo: latestHearing?.sc_number || null,
        nextHearingDate: latestHearing?.hearing_date ? new Date(latestHearing.hearing_date).toLocaleDateString('en-IN') : null,
        dispositionSentence: cs.notes || cs.missing_documents || null,
      } : null,
      generatedAt: new Date().toLocaleString('en-IN'),
      generatedBy: userName,
      watermark: `${userName} | ${new Date().toISOString().substring(0, 10)}`,
    };

    await logAudit('EXPORT', 'CASE', id, req, `Exported PDF Case Report for FIR ${caseRecord.fir_no}`);

    const doc = generateCasePdf(pdfData);

    const safeFir = caseRecord.fir_no.replace(/[/\\?%*:|"<>]/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Case_Report_${safeFir}.pdf"`);

    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Error generating Case PDF:', error);
    res.status(500).json({ message: 'Failed to generate Case PDF report' });
  }
};
