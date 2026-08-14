import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { getOffenderWhere } from '../utils/scope';
import { maskAadhaar, canRevealAadhaar, canExportOffenders } from '../utils/pii';
import { logAudit } from '../utils/audit-logger';
import { generateHistorySheetPdf } from '../utils/pdf-history-sheet';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

export async function getImageBufferAndExtension(photoUrl: string | null | undefined): Promise<{ buffer: Buffer; extension: 'png' | 'jpeg' | 'gif' } | null> {
  if (!photoUrl || typeof photoUrl !== 'string' || !photoUrl.trim()) return null;
  const cleanedUrl = photoUrl.trim();

  try {
    if (cleanedUrl.startsWith('data:image/')) {
      const matches = cleanedUrl.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/i);
      if (matches && matches[1] && matches[2]) {
        let extStr = matches[1].toLowerCase();
        if (extStr === 'jpg' || extStr === 'webp') extStr = 'jpeg';
        const extension = extStr as 'png' | 'jpeg' | 'gif';
        const buffer = Buffer.from(matches[2], 'base64');
        return { buffer, extension };
      }
    }

    let relPath = cleanedUrl;
    if (relPath.startsWith('/api/uploads/')) {
      relPath = relPath.replace('/api/uploads/', 'uploads/');
    } else if (relPath.startsWith('/uploads/')) {
      relPath = relPath.substring(1);
    } else if (relPath.startsWith('api/uploads/')) {
      relPath = relPath.replace('api/uploads/', 'uploads/');
    }

    const possiblePaths = [
      path.resolve(process.cwd(), relPath),
      path.resolve(process.cwd(), 'uploads', path.basename(relPath)),
      path.resolve(relPath)
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const extName = path.extname(p).toLowerCase().replace('.', '');
        let extension: 'png' | 'jpeg' | 'gif' = 'jpeg';
        if (extName === 'png') extension = 'png';
        else if (extName === 'gif') extension = 'gif';
        const buffer = fs.readFileSync(p);
        return { buffer, extension };
      }
    }

    if (cleanedUrl.startsWith('http://') || cleanedUrl.startsWith('https://')) {
      const response = await fetch(cleanedUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || '';
        let extension: 'png' | 'jpeg' | 'gif' = 'jpeg';
        if (contentType.includes('png')) extension = 'png';
        else if (contentType.includes('gif')) extension = 'gif';
        return { buffer, extension };
      }
    }
  } catch (err) {
    console.error('Error fetching image for Excel export:', err);
  }
  return null;
}

function csvEscape(v: unknown): string {
  let s = v == null ? '' : String(v);

  if (/^[=+\-@\t\r]/.test(s)) {
    s = `'${s}`;
  }

  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes("'")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatMobileForCsv(val: string | null | undefined): string {
  if (!val) return '';
  let clean = val.trim();
  if (/e/i.test(clean)) {
    const parsed = Number(clean);
    if (!isNaN(parsed)) {
      clean = String(parsed);
    }
  }
  const digits = clean.replace(/\D/g, '');
  if (digits.length >= 10) {
    const tenDigits = digits.slice(-10);
    return `'+91${tenDigits}`;
  }
  return clean ? `'${clean}` : '';
}

function formatAadhaarForCsv(val: string | null | undefined): string {
  if (!val) return '';
  let clean = val.trim();
  if (/e/i.test(clean)) {
    const parsed = Number(clean);
    if (!isNaN(parsed)) {
      clean = String(parsed);
    }
  }
  const digits = clean.replace(/\D/g, '');
  if (digits.length === 12) {
    return `'${digits}`;
  }
  return `'${clean}`;
}

export const exportOffendersCsv = async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user!?.role || '';
    if (!canExportOffenders(userRole)) {
      return res.status(403).json({ message: 'You do not have permission to export offender data' });
    }

    const where: any = { ...getOffenderWhere(req.user!) };
    const { psId, query, category, format, timeRange, month, year, arrestStatus } = req.query;
    const formatType = String(format || 'xlsx').toLowerCase();
    const isCsv = formatType === 'csv';
    const isConsumer = category === 'CONSUMER';

    if (psId && String(psId).trim() !== '' && !isNaN(Number(psId))) {
      where.ps_id = BigInt(String(psId));
    } else if (psId === '') {
      delete where.ps_id;
    }

    const andConditions: any[] = [];

    if (category && category !== 'ABSCONDER') {
      where.category = String(category) as any;
    }

    if (query) {
      const q = String(query);
      andConditions.push({
        OR: [
          { full_name: { contains: q, mode: 'insensitive' } },
          { alias: { contains: q, mode: 'insensitive' } },
        ]
      });
    }

    let dateFilter: any = null;
    if (timeRange === 'monthly') {
      const monthStr = month ? String(month) : new Date().toISOString().substring(0, 7);
      const [y, m] = monthStr.split('-').map(Number);
      if (y && m) {
        const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        dateFilter = { gte: start, lte: end };
      }
    } else if (timeRange === 'yearly') {
      const y = year ? Number(year) : new Date().getFullYear();
      const start = new Date(y, 0, 1, 0, 0, 0, 0);
      const end = new Date(y, 11, 31, 23, 59, 59, 999);
      dateFilter = { gte: start, lte: end };
    }

    const isArrestFilter = arrestStatus === 'ARRESTED' || arrestStatus === 'CUSTODY' || req.query.arrested === 'true';

    if (isArrestFilter) {
      andConditions.push({
        case_accused: {
          some: {
            arrest_status: { in: ['POLICE_CUSTODY', 'JUDICIAL_CUSTODY'] },
            ...(dateFilter ? { cases: { OR: [{ case_date: dateFilter }, { case_date: null, created_at: dateFilter }] } } : {})
          }
        }
      });
    } else if (category === 'ABSCONDER' || arrestStatus === 'ABSCONDING') {
      andConditions.push({
        case_accused: {
          some: {
            arrest_status: 'ABSCONDING',
            ...(dateFilter ? { cases: { OR: [{ case_date: dateFilter }, { case_date: null, created_at: dateFilter }] } } : {})
          }
        }
      });
    } else if (dateFilter) {
      andConditions.push({
        OR: [
          { case_accused: { some: { cases: { OR: [{ case_date: dateFilter }, { case_date: null, created_at: dateFilter }] } } } },
          { case_accused: { none: {} }, created_at: dateFilter }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const offenders = await prisma.offenders.findMany({
      where,
      include: {
        police_stations: true,
        offender_contacts: true,
        offender_identity_docs: true,
        offender_drug_profile: true,
        offender_financials: true,
        supply_chain_links_supply_chain_links_offender_idTooffenders: true,
        case_accused: {
          include: {
            cases: {
              include: {
                police_stations: true,
              },
            },
          },
        },
        interrogation_sessions: {
          include: {
            users: true,
          },
        },
      },
      orderBy: { full_name: 'asc' },
      take: 5000,
    });

    if (isCsv) {
      const headers = [
        'SL No', 'Full Name', 'Alias', 'Father/Husband Name', 'Age', 'Gender', 'Category', 'Status',
        'Police Station', 'District', 'State', 'Occupation', 'Monthly Income', 'Full Address', 'Landmark/Area',
        'Primary Mobile', 'Secondary Mobile', 'Other Contacts', 'Aadhaar No', 'Voter ID', 'PAN Card',
        'Photo URL', 'Test Result', 'Risk Score', 'Addiction Type', 'Consumption Frequency',
        'Source of Procurement', 'Mode of Purchase', 'Usual Consumption Spot', 'Financial Details',
        'Supply Chain Links', 'Total Cases', 'Linked Cases / FIRs', 'Interrogation Sessions'
      ];
      const lines = [headers.join(',')];

      for (const o of offenders) {
        const slNo = o.sl_no || '';
        const fullName = o.full_name || '';
        const alias = o.alias || '';
        const fatherHusbandName = o.father_husband_name || '';
        const age = o.age != null ? String(o.age) : '';
        const gender = o.gender || '';
        const categoryVal = o.category || '';
        const statusVal = o.status || '';
        const psName = o.police_stations?.name || '';
        const district = o.district || '';
        const state = o.state || '';
        const occupation = o.occupation || '';
        const monthlyIncome = o.monthly_income != null ? String(o.monthly_income) : '';
        const fullAddress = o.full_address || '';
        const landmarkArea = o.landmark_area || '';

        const primaryMobileContact = o.offender_contacts.find(c => c.contact_type === 'MOBILE_PRIMARY') || o.offender_contacts.find(c => c.contact_type.startsWith('MOBILE'));
        const primaryMobile = formatMobileForCsv(primaryMobileContact?.value);
        
        const secondaryMobileContact = o.offender_contacts.find(c => c.contact_type === 'MOBILE_SECONDARY');
        const secondaryMobile = formatMobileForCsv(secondaryMobileContact?.value);
        
        const otherContacts = o.offender_contacts
          .filter(c => c.id !== primaryMobileContact?.id && c.id !== secondaryMobileContact?.id)
          .map(c => `${c.contact_type}: ${c.value}${c.notes ? ` (${c.notes})` : ''}`)
          .join('; ');

        const aadhaar = o.offender_identity_docs?.[0]?.aadhaar_no;
        const formattedAadhaar = canRevealAadhaar(userRole)
          ? formatAadhaarForCsv(aadhaar)
          : (maskAadhaar(aadhaar) || '');
        const voterId = o.offender_identity_docs?.[0]?.voter_id ? `'${o.offender_identity_docs[0].voter_id}` : '';
        const panCard = o.offender_identity_docs?.[0]?.pan_card ? `'${o.offender_identity_docs[0].pan_card}` : '';

        const photoUrl = o.photo_url || '';
        const testResult = o.test_result || '';
        const riskScore = o.risk_score || '';

        const addictionType = o.offender_drug_profile?.addiction_type || '';
        const consumptionFrequency = o.offender_drug_profile?.consumption_frequency || '';
        const sourceOfProcurement = o.offender_drug_profile?.source_of_procurement || '';
        const modeOfPurchase = o.offender_drug_profile?.mode_of_purchase || '';
        const usualConsumptionSpot = o.offender_drug_profile?.usual_consumption_spot || '';

        const financialDetails = o.offender_financials.map(f => {
          const bank = f.bank_name ? ` (${f.bank_name})` : '';
          const notes = f.notes ? ` - ${f.notes}` : '';
          return `${f.fin_type}: ${f.value}${bank}${notes}`;
        }).join('; ');

        const supplyChainLinks = o.supply_chain_links_supply_chain_links_offender_idTooffenders.map(s => {
          const name = s.linked_person_name ? ` ${s.linked_person_name}` : '';
          const contact = s.linked_person_contact ? ` (${s.linked_person_contact})` : '';
          const notes = s.notes ? ` - ${s.notes}` : '';
          return `${s.link_type}:${name}${contact}${notes}`;
        }).join('; ');

        const totalCases = String(o.case_accused.length);

        const linkedCases = o.case_accused.map(ca => {
          const c = ca.cases;
          if (!c) return '';
          const ps = c.police_stations?.name ? ` in ${c.police_stations.name}` : '';
          const date = c.case_date ? ` on ${new Date(c.case_date).toLocaleDateString('en-IN')}` : '';
          const law = c.section_of_law ? ` (Sec: ${c.section_of_law})` : '';
          return `FIR ${c.fir_no}${ps}${date}${law}`;
        }).filter(Boolean).join('; ');

        const interrogationSessions = o.interrogation_sessions.map(s => {
          const date = new Date(s.session_at).toLocaleDateString('en-IN');
          const officer = s.users?.full_name ? ` by ${s.users.full_name}` : '';
          const info = s.source_info ? ` [Source: ${s.source_info}]` : '';
          const notes = s.notes ? `: ${s.notes}` : '';
          return `${date}${officer}${info}${notes}`;
        }).join('; ');

        lines.push(
          [
            slNo,
            fullName,
            alias,
            fatherHusbandName,
            age,
            gender,
            categoryVal,
            statusVal,
            psName,
            district,
            state,
            occupation,
            monthlyIncome,
            fullAddress,
            landmarkArea,
            primaryMobile,
            secondaryMobile,
            otherContacts,
            formattedAadhaar,
            voterId,
            panCard,
            photoUrl,
            testResult,
            riskScore,
            addictionType,
            consumptionFrequency,
            sourceOfProcurement,
            modeOfPurchase,
            usualConsumptionSpot,
            financialDetails,
            supplyChainLinks,
            totalCases,
            linkedCases,
            interrogationSessions
          ]
            .map(csvEscape)
            .join(',')
        );
      }

      await logAudit('EXPORT', 'OFFENDER', null, req,
        `Exported ${offenders.length} offenders CSV — PII ${canRevealAadhaar(userRole) ? 'REVEALED' : 'MASKED'}`
      );

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${isConsumer ? 'consumers' : 'offenders'}-${Date.now()}.csv"`);
      return res.send('\uFEFF' + lines.join('\n'));
    }

    // Excel (.xlsx) export with embedded photos
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'GARUDA NDPS';
    const sheetName = isConsumer ? 'Consumer Database' : 'Offender Database';
    const worksheet = workbook.addWorksheet(sheetName);

    const headers = [
      'SL No', 'Accused Photo', 'Full Name', 'Alias', 'Father/Husband Name', 'Age', 'Gender', 'Category', 'Status',
      'Police Station', 'District', 'State', 'Occupation', 'Monthly Income', 'Full Address', 'Landmark/Area',
      'Primary Mobile', 'Secondary Mobile', 'Other Contacts', 'Aadhaar No', 'Voter ID', 'PAN Card',
      'Photo URL', 'Test Result', 'Risk Score', 'Addiction Type', 'Consumption Frequency',
      'Source of Procurement', 'Mode of Purchase', 'Usual Consumption Spot', 'Financial Details',
      'Supply Chain Links', 'Total Cases', 'Linked Cases / FIRs', 'Interrogation Sessions'
    ];

    worksheet.columns = headers.map(h => ({
      header: h,
      key: h,
      width: h === 'Accused Photo' ? 18 : 22
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.height = 32;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E79' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    for (let i = 0; i < offenders.length; i++) {
      const o = offenders[i];
      if (!o) continue;
      const rowNumber = i + 2;
      const excelRow = worksheet.getRow(rowNumber);

      const imgInfo = await getImageBufferAndExtension(o.photo_url);

      const slNo = o.sl_no || String(i + 1);
      const fullName = o.full_name || '';
      const alias = o.alias || '';
      const fatherHusbandName = o.father_husband_name || '';
      const age = o.age != null ? String(o.age) : '';
      const gender = o.gender || '';
      const categoryVal = o.category || '';
      const statusVal = o.status || '';
      const psName = o.police_stations?.name || '';
      const district = o.district || '';
      const state = o.state || '';
      const occupation = o.occupation || '';
      const monthlyIncome = o.monthly_income != null ? String(o.monthly_income) : '';
      const fullAddress = o.full_address || '';
      const landmarkArea = o.landmark_area || '';

      const primaryMobileContact = o.offender_contacts.find(c => c.contact_type === 'MOBILE_PRIMARY') || o.offender_contacts.find(c => c.contact_type.startsWith('MOBILE'));
      const primaryMobile = formatMobileForCsv(primaryMobileContact?.value);

      const secondaryMobileContact = o.offender_contacts.find(c => c.contact_type === 'MOBILE_SECONDARY');
      const secondaryMobile = formatMobileForCsv(secondaryMobileContact?.value);

      const otherContacts = o.offender_contacts
        .filter(c => c.id !== primaryMobileContact?.id && c.id !== secondaryMobileContact?.id)
        .map(c => `${c.contact_type}: ${c.value}${c.notes ? ` (${c.notes})` : ''}`)
        .join('; ');

      const aadhaar = o.offender_identity_docs?.[0]?.aadhaar_no;
      const formattedAadhaar = canRevealAadhaar(userRole)
        ? formatAadhaarForCsv(aadhaar)
        : (maskAadhaar(aadhaar) || '');
      const voterId = o.offender_identity_docs?.[0]?.voter_id ? `'${o.offender_identity_docs[0].voter_id}` : '';
      const panCard = o.offender_identity_docs?.[0]?.pan_card ? `'${o.offender_identity_docs[0].pan_card}` : '';

      const photoUrl = o.photo_url || '';
      const testResult = o.test_result || '';
      const riskScore = o.risk_score || '';

      const addictionType = o.offender_drug_profile?.addiction_type || '';
      const consumptionFrequency = o.offender_drug_profile?.consumption_frequency || '';
      const sourceOfProcurement = o.offender_drug_profile?.source_of_procurement || '';
      const modeOfPurchase = o.offender_drug_profile?.mode_of_purchase || '';
      const usualConsumptionSpot = o.offender_drug_profile?.usual_consumption_spot || '';

      const financialDetails = o.offender_financials.map(f => {
        const bank = f.bank_name ? ` (${f.bank_name})` : '';
        const notes = f.notes ? ` - ${f.notes}` : '';
        return `${f.fin_type}: ${f.value}${bank}${notes}`;
      }).join('; ');

      const supplyChainLinks = o.supply_chain_links_supply_chain_links_offender_idTooffenders.map(s => {
        const name = s.linked_person_name ? ` ${s.linked_person_name}` : '';
        const contact = s.linked_person_contact ? ` (${s.linked_person_contact})` : '';
        const notes = s.notes ? ` - ${s.notes}` : '';
        return `${s.link_type}:${name}${contact}${notes}`;
      }).join('; ');

      const totalCases = String(o.case_accused.length);

      const linkedCases = o.case_accused.map(ca => {
        const c = ca.cases;
        if (!c) return '';
        const ps = c.police_stations?.name ? ` in ${c.police_stations.name}` : '';
        const date = c.case_date ? ` on ${new Date(c.case_date).toLocaleDateString('en-IN')}` : '';
        const law = c.section_of_law ? ` (Sec: ${c.section_of_law})` : '';
        return `FIR ${c.fir_no}${ps}${date}${law}`;
      }).filter(Boolean).join('; ');

      const interrogationSessions = o.interrogation_sessions.map(s => {
        const date = new Date(s.session_at).toLocaleDateString('en-IN');
        const officer = s.users?.full_name ? ` by ${s.users.full_name}` : '';
        const info = s.source_info ? ` [Source: ${s.source_info}]` : '';
        const notes = s.notes ? `: ${s.notes}` : '';
        return `${date}${officer}${info}${notes}`;
      }).join('; ');

      const rowValues = {
        'SL No': slNo,
        'Accused Photo': '',
        'Full Name': fullName,
        'Alias': alias,
        'Father/Husband Name': fatherHusbandName,
        'Age': age,
        'Gender': gender,
        'Category': categoryVal,
        'Status': statusVal,
        'Police Station': psName,
        'District': district,
        'State': state,
        'Occupation': occupation,
        'Monthly Income': monthlyIncome,
        'Full Address': fullAddress,
        'Landmark/Area': landmarkArea,
        'Primary Mobile': primaryMobile,
        'Secondary Mobile': secondaryMobile,
        'Other Contacts': otherContacts,
        'Aadhaar No': formattedAadhaar,
        'Voter ID': voterId,
        'PAN Card': panCard,
        'Photo URL': photoUrl,
        'Test Result': testResult,
        'Risk Score': riskScore,
        'Addiction Type': addictionType,
        'Consumption Frequency': consumptionFrequency,
        'Source of Procurement': sourceOfProcurement,
        'Mode of Purchase': modeOfPurchase,
        'Usual Consumption Spot': usualConsumptionSpot,
        'Financial Details': financialDetails,
        'Supply Chain Links': supplyChainLinks,
        'Total Cases': totalCases,
        'Linked Cases / FIRs': linkedCases,
        'Interrogation Sessions': interrogationSessions
      };

      excelRow.values = rowValues;
      excelRow.alignment = { vertical: 'middle', wrapText: true };

      if (imgInfo) {
        excelRow.height = 65;
        const imageId = workbook.addImage({
          buffer: imgInfo.buffer as any,
          extension: imgInfo.extension,
        });
        worksheet.addImage(imageId, {
          tl: { col: 1, row: rowNumber - 1 },
          ext: { width: 55, height: 55 },
          editAs: 'oneCell',
        });
      } else {
        excelRow.height = 28;
      }
    }

    await logAudit('EXPORT', 'OFFENDER', null, req,
      `Exported ${offenders.length} offenders Excel — PII ${canRevealAadhaar(userRole) ? 'REVEALED' : 'MASKED'}`
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${isConsumer ? 'consumers' : 'offenders'}-${Date.now()}.xlsx"`);
    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Export failed' });
  }
};

export const getOffenderHistorySheetPdf = async (req: AuthRequest, res: Response) => {
  try {
    const id = BigInt(String(req.params.id));
    const offender = await prisma.offenders.findUnique({
      where: { id },
      include: {
        police_stations: true,
        offender_contacts: true,
        case_accused: {
          include: {
            cases: { include: { police_stations: true, seizures: true } },
          },
        },
      },
    });

    if (!offender) return res.status(404).json({ message: 'Offender not found' });

    const timeline = offender.case_accused
      .map((ca) => ca.cases)
      .filter(Boolean)
      .sort((a, b) => (b!.case_date?.getTime() || 0) - (a!.case_date?.getTime() || 0))
      .map((c) => ({
        firNo: c!.fir_no,
        psName: c!.police_stations?.name || null,
        caseDate: c!.case_date || null,
        stage: c!.stage || null,
        sectionOfLaw: c!.section_of_law || null,
        contrabandType: c!.contraband_type || null,
        arrestStatus: offender.case_accused.find((ca) => ca.case_id === c!.id)?.arrest_status || null,
      }));

    const data = {
      generatedAt: new Date().toISOString(),
      offender: {
        fullName: offender.full_name,
        alias: offender.alias || '',
        fatherHusbandName: offender.father_husband_name || '',
        age: offender.age,
        category: offender.category ? String(offender.category) : '',
        address: offender.full_address || '',
        psName: offender.police_stations?.name || '',
        mobile: offender.offender_contacts.find((c) => c.contact_type === 'MOBILE_PRIMARY')?.value || '',
      },
      timeline,
      // ── SECURITY: Watermark with exporting user's identity for leak traceability ──
      watermark: `${(req as any).user?.username || 'SYSTEM'} | ${new Date().toLocaleString('en-IN')}`,
    };

    await logAudit('EXPORT', 'OFFENDER', id, req, `PDF history sheet exported for ${offender.full_name}`);

    const doc = generateHistorySheetPdf(data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="history-sheet-${offender.full_name.replace(/\s/g, '_')}.pdf"`);
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};

export const getOffenderHistorySheet = async (req: AuthRequest, res: Response) => {
  try {
    const id = BigInt(String(req.params.id));
    const offender = await prisma.offenders.findUnique({
      where: { id },
      include: {
        police_stations: true,
        offender_contacts: true,
        offender_identity_docs: true,
        case_accused: {
          include: {
            cases: { include: { police_stations: true, seizures: true } },
          },
        },
      },
    });

    if (!offender) return res.status(404).json({ message: 'Offender not found' });

    const timeline = offender.case_accused
      .map((ca) => ca.cases)
      .filter(Boolean)
      .sort((a, b) => (b!.case_date?.getTime() || 0) - (a!.case_date?.getTime() || 0))
      .map((c) => ({
        firNo: c!.fir_no,
        psName: c!.police_stations?.name,
        caseDate: c!.case_date,
        stage: c!.stage,
        sectionOfLaw: c!.section_of_law,
        contrabandType: c!.contraband_type,
        arrestStatus: offender.case_accused.find((ca) => ca.case_id === c!.id)?.arrest_status,
      }));

    res.json({
      generatedAt: new Date().toISOString(),
      offender: {
        fullName: offender.full_name,
        alias: offender.alias,
        fatherHusbandName: offender.father_husband_name,
        age: offender.age,
        category: offender.category,
        address: offender.full_address,
        psName: offender.police_stations?.name,
        mobile: offender.offender_contacts.find((c) => c.contact_type === 'MOBILE_PRIMARY')?.value,
      },
      timeline,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
