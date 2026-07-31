/**
 * GARUDA — Reports Controller
 * 
 * Generates operational reports for absconders, pending charge sheets, etc.
 * Data is scoped by the requesting user's role/station.
 */
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import prisma from '../config/prisma';
import { successResponse } from '../utils/transformers';
import { getDashboardScope, ScopeUser } from '../utils/scope';
import { logAudit } from '../utils/audit-logger';
import { maskAadhaar, canRevealAadhaar } from '../utils/pii';

async function getImageBufferAndExtension(photoUrl: string | null | undefined): Promise<{ buffer: Buffer; extension: 'png' | 'jpeg' | 'gif' } | null> {
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

function cleanCellText(val: unknown): string {
  if (val == null) return '';
  const s = String(val);
  if (s.length > 32000) {
    return s.slice(0, 32000) + '... [TRUNCATED]';
  }
  return s;
}


function getSeverity(daysOutstanding: number): string {
  if (daysOutstanding > 90) return 'CRITICAL';
  if (daysOutstanding > 60) return 'HIGH';
  if (daysOutstanding > 30) return 'MEDIUM';
  return 'LOW';
}

export const getAbsconderReport = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);
    const format = (req.query.format as string) || 'json';
    const minDays = req.query.minDays ? parseInt(String(req.query.minDays), 10) : 0;
    const psId = req.query.psId ? BigInt(String(req.query.psId)) : null;

    // Build scoped where clause for case_accused
    let caseAccusedWhere: any = { arrest_status: 'ABSCONDING' };

    if (psId) {
      caseAccusedWhere.cases = { ps_id: psId };
    } else if (psFilter.ps_id) {
      caseAccusedWhere.cases = { ps_id: psFilter.ps_id };
    } else if (psFilter.police_stations) {
      caseAccusedWhere.cases = { police_stations: psFilter.police_stations };
    }

    const absconders = await prisma.case_accused.findMany({
      where: caseAccusedWhere,
      include: {
        offenders: {
          select: {
            full_name: true,
            alias: true,
            age: true,
            father_husband_name: true,
            full_address: true,
            photo_url: true,
          },
        },
        cases: {
          select: {
            fir_no: true,
            case_date: true,
            section_of_law: true,
            police_stations: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    // Map to report format with days outstanding
    const now = Date.now();
    let reportData = absconders.map(a => {
      const daysOutstanding = a.cases?.case_date
        ? Math.floor((now - new Date(a.cases.case_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      return {
        id: a.id.toString(),
        offenderId: a.offender_id.toString(),
        offenderName: a.offenders?.full_name || 'Unknown',
        alias: a.offenders?.alias || '',
        age: a.offenders?.age || null,
        fatherName: a.offenders?.father_husband_name || '',
        address: a.offenders?.full_address || '',
        firNo: a.cases?.fir_no || '',
        psName: a.cases?.police_stations?.name || '',
        caseDate: a.cases?.case_date ? new Date(a.cases.case_date).toISOString().split('T')[0] : '',
        sectionOfLaw: a.cases?.section_of_law || '',
        daysOutstanding,
        severity: getSeverity(daysOutstanding),
      };
    });

    // Filter by minimum days if specified
    if (minDays > 0) {
      reportData = reportData.filter(r => r.daysOutstanding >= minDays);
    }

    // Sort by days outstanding descending (most urgent first)
    reportData.sort((a, b) => b.daysOutstanding - a.daysOutstanding);

    await logAudit('VIEW', 'REPORT', null, req, `Absconder report generated: ${reportData.length} records`);

    if (format === 'csv') {
      const headers = [
        'Sl.No', 'Offender Name', 'Alias', 'Age', 'Father/Husband Name', 'Address',
        'FIR No', 'Police Station', 'Case Date', 'Section of Law',
        'Days Outstanding', 'Severity'
      ];
      const lines = [headers.join(',')];

      reportData.forEach((r, i) => {
        lines.push([
          String(i + 1),
          r.offenderName,
          r.alias,
          r.age != null ? String(r.age) : '',
          r.fatherName,
          r.address,
          r.firNo,
          r.psName,
          r.caseDate,
          r.sectionOfLaw,
          String(r.daysOutstanding),
          r.severity,
        ].map(csvEscape).join(','));
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="absconder-report-${Date.now()}.csv"`);
      res.send('\uFEFF' + lines.join('\n'));
    } else {
      res.json(successResponse({
        generatedAt: new Date().toISOString(),
        totalAbsconders: reportData.length,
        absconders: reportData,
      }));
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate absconder report' });
  }
};

export const getMonthlyAbstractReport = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const cases = await prisma.cases.findMany({
      where: {
        ...psFilter,
        case_date: { gte: startOfMonth }
      },
      include: {
        police_stations: true,
        seizures: true,
        case_accused: true
      }
    });

    const stationsMap = new Map<string, any>();
    for (const c of cases) {
      const psName = c.police_stations?.name || 'Unknown';
      if (!stationsMap.has(psName)) {
        stationsMap.set(psName, {
          stationName: psName,
          caseCount: 0,
          arrestCount: 0,
          contrabandKg: 0,
          cashAmount: 0
        });
      }
      const stat = stationsMap.get(psName);
      stat.caseCount += 1;
      stat.arrestCount += c.case_accused.filter((ca: any) => ['POLICE_CUSTODY', 'JUDICIAL_CUSTODY'].includes(ca.arrest_status)).length;
      for (const s of c.seizures) {
        stat.contrabandKg += s.contraband_kg ? Number(s.contraband_kg) : 0;
        stat.cashAmount += s.cash_amount ? Number(s.cash_amount) : 0;
      }
    }

    const data = Array.from(stationsMap.values());
    res.json(successResponse({
      generatedAt: new Date().toISOString(),
      month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
      data
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate monthly abstract' });
  }
};

export const getYearlyComparisonReport = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);

    const cases = await prisma.cases.findMany({
      where: psFilter,
      include: {
        case_accused: true
      }
    });

    const yearlyStats: Record<number, { year: number; cases: number; arrests: number; convictions: number }> = {};
    const currentYear = new Date().getFullYear();
    for (let y = currentYear - 4; y <= currentYear; y++) {
      yearlyStats[y] = { year: y, cases: 0, arrests: 0, convictions: 0 };
    }

    for (const c of cases) {
      if (c.case_date) {
        const year = new Date(c.case_date).getFullYear();
        if (yearlyStats[year]) {
          yearlyStats[year].cases += 1;
          yearlyStats[year].arrests += c.case_accused.filter((ca: any) => ['POLICE_CUSTODY', 'JUDICIAL_CUSTODY'].includes(ca.arrest_status)).length;
          if (c.stage === 'CONVICTED') {
            yearlyStats[year].convictions += 1;
          }
        }
      }
    }

    const data = Object.values(yearlyStats).sort((a, b) => a.year - b.year);
    res.json(successResponse({
      generatedAt: new Date().toISOString(),
      data
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate yearly comparison' });
  }
};

export const getPendingChargeSheetsReport = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const cases = await prisma.cases.findMany({
      where: {
        ...psFilter,
        stage: 'FIR',
        case_date: { lt: sixtyDaysAgo }
      },
      include: {
        police_stations: true,
        case_accused: { include: { offenders: true } }
      },
      orderBy: { case_date: 'asc' }
    });

    const data = cases.map((c) => {
      const daysPending = c.case_date
        ? Math.floor((Date.now() - new Date(c.case_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: c.id.toString(),
        firNo: c.fir_no,
        sectionOfLaw: c.section_of_law || '',
        caseDate: c.case_date,
        psName: c.police_stations?.name || '',
        daysPending,
        accusedNames: c.case_accused.map((ca) => ca.offenders?.full_name).join(', ')
      };
    });

    res.json(successResponse({
      generatedAt: new Date().toISOString(),
      totalPending: data.length,
      data
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate pending charge sheets report' });
  }
};

export const getBailExpiryAlertsReport = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);

    const bails = await prisma.case_accused.findMany({
      where: {
        arrest_status: 'ON_BAIL',
        cases: psFilter
      },
      include: {
        offenders: true,
        cases: {
          include: { police_stations: true }
        }
      },
      orderBy: { bail_date: 'asc' }
    });

    const data = bails.map((b) => {
      const daysSinceBail = b.bail_date
        ? Math.floor((Date.now() - new Date(b.bail_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      const daysRemaining = Math.max(0, 90 - daysSinceBail);

      return {
        id: b.id.toString(),
        offenderName: b.offenders?.full_name || 'Unknown',
        firNo: b.cases?.fir_no || '',
        psName: b.cases?.police_stations?.name || '',
        bailDate: b.bail_date,
        bailConditions: b.bail_conditions || 'None specified',
        daysSinceBail,
        daysRemaining
      };
    });

    res.json(successResponse({
      generatedAt: new Date().toISOString(),
      totalBails: data.length,
      data
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate bail expiry alerts report' });
  }
};

export const getCourtPendingReport = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);

    const cases = await prisma.cases.findMany({
      where: {
        ...psFilter,
        stage: 'TRIAL'
      },
      include: {
        police_stations: true,
        court_hearings: {
          orderBy: { hearing_date: 'desc' }
        },
        case_accused: {
          include: { offenders: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const data = cases.map((c) => {
      const latestHearing = c.court_hearings[0];
      return {
        id: c.id.toString(),
        firNo: c.fir_no,
        sectionOfLaw: c.section_of_law || '',
        psName: c.police_stations?.name || '',
        scNumber: latestHearing?.sc_number || '—',
        nextHearingDate: latestHearing?.next_hearing_date || latestHearing?.hearing_date || null,
        courtName: latestHearing?.court_name || '—',
        accusedCount: c.case_accused.length
      };
    });

    res.json(successResponse({
      generatedAt: new Date().toISOString(),
      totalCases: data.length,
      data
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate court pending report' });
  }
};

export const getDrugSeizuresReport = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);

    const seizures = await prisma.seizures.findMany({
      where: {
        cases: psFilter
      },
      include: {
        cases: true
      }
    });

    const breakdown: Record<string, number> = {};
    let totalKg = 0;

    for (const s of seizures) {
      const type = s.cases?.contraband_type || 'OTHER';
      const kg = s.contraband_kg ? Number(s.contraband_kg) : 0;
      breakdown[type] = (breakdown[type] || 0) + kg;
      totalKg += kg;
    }

    const data = Object.entries(breakdown).map(([type, amount]) => ({
      type,
      amount,
      percentage: totalKg > 0 ? Math.round((amount / totalKg) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    res.json(successResponse({
      generatedAt: new Date().toISOString(),
      totalKg,
      data
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate drug seizures report' });
  }
};

export const getTopOffendersReport = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);

    const offenders = await prisma.offenders.findMany({
      where: psFilter,
      include: {
        _count: {
          select: { case_accused: true }
        },
        police_stations: {
          select: { name: true }
        }
      },
      orderBy: {
        case_accused: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const data = offenders.map((o) => ({
      id: o.id.toString(),
      offenderName: o.full_name,
      alias: o.alias || '',
      age: o.age,
      fatherName: o.father_husband_name || '',
      psName: o.police_stations?.name || '',
      caseCount: o._count.case_accused,
      riskScore: o.risk_score || 'LOW'
    }));

    res.json(successResponse({
      generatedAt: new Date().toISOString(),
      data
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate top repeat offenders report' });
  }
};

export const getDprExport = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const userRole = req.user?.role || '';
    const { psFilter } = getDashboardScope(user);
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(String(startDate));
    if (endDate) dateFilter.lte = new Date(String(endDate));

    const whereClause: any = { ...psFilter };
    if (startDate || endDate) {
      whereClause.case_date = dateFilter;
    }

    const cases = await prisma.cases.findMany({
      where: whereClause,
      include: {
        police_stations: true,
        seizures: true,
        case_accused: {
          include: {
            offenders: {
              include: {
                police_stations: true,
                offender_contacts: true,
                offender_identity_docs: true,
                offender_drug_profile: true,
                offender_financials: true,
                social_media_intel: true,
                messaging_intel: true,
                supply_chain_links_supply_chain_links_offender_idTooffenders: true,
                case_accused: {
                  include: {
                    cases: {
                      include: { police_stations: true }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { case_date: 'asc' }
    });

    const exportRows: any[] = [];
    let slNo = 1;

    for (const c of cases) {
      const qty = c.seizures.reduce((acc: number, s: any) => acc + (s.contraband_kg ? Number(s.contraband_kg) : 0), 0) || (c.quantity ? Number(c.quantity) : 0);
      const cash = c.seizures.reduce((acc: number, s: any) => acc + (s.cash_amount ? Number(s.cash_amount) : 0), 0);
      const vehicles = c.seizures.reduce((acc: number, s: any) => acc + (s.vehicles_count ? Number(s.vehicles_count) : 0), 0);
      const caseDateStr = c.case_date ? new Date(c.case_date).toLocaleDateString('en-IN') : '';

      if (c.case_accused.length === 0) {
        exportRows.push({
          'Sl. No.': slNo++,
          'Cr. No. & Year': c.fir_no,
          'Name of the P.S.': c.police_stations?.name || '',
          'Section of Law': c.section_of_law || '',
          'Stage of Case': c.stage || '',
          'Case Date': caseDateStr,
          'Accused Photo': '',

          // 1. PERSONAL DETAILS
          'Full Name': '',
          'Alias': '',
          'Gender': '',
          'Age': '',
          'Father / Husband Name': '',
          'Category of Accused (Local Peddeler, Local Supplier, Transporter and etc.)': '',
          'Pedller/ Accused Mobile No. 1': '',
          'Pedller/ Accused Mobile No. 2': '',
          'Gmail ID / Email': '',
          'Other Contacts': '',
          'Test Results (Positive/ Negative/ Invalid)': '',

          // 2. ADDRESS DETAILS
          'Present Address (Long. & Lat.)': '',
          'Permanent Address (Long. & Lat. If Possible)': '',
          'Landmark / Area': '',
          'Mandal': '',
          'District': '',
          'State': '',

          // 6. SOCIO-ECONOMIC PROFILE
          'Occupation (Student/ Labor/ Employee/ Bussiness/ etc.)': '',

          // 7. Source of Procurement / DRUG SUPPLY CHAIN MAPPING
          'Source Location': c.source_location || '',
          'Destination Location': c.destination_location || '',

          // 9. PURCHASE MODUS OPERANDI
          'Quantity (KG)': qty > 0 ? `${qty} KG` : '',
          'Cash Seized (INR)': cash > 0 ? String(cash) : '',
          'Vehicles Seized': vehicles > 0 ? String(vehicles) : '',

          // 10. CRIME HISTORY
          'Arrest status': '',
          'Arrest Date': '',
          'Bail Date & Conditions': '',
          'History Sheet / Rowdy Sheet': c.is_history_sheet ? 'History Sheet' : (c.is_rowdy_sheet ? 'Rowdy Sheet' : 'No'),
          'Total Cases Count': '0',
          'Linked Cases / Crime History': '',
          _imageInfo: null
        });
      } else {
        for (let idx = 0; idx < c.case_accused.length; idx++) {
          const ca = c.case_accused[idx];
          if (!ca || !ca.offenders) continue;
          const o = ca.offenders;

          // Fetch photo image buffer if photo_url exists
          const imageInfo = await getImageBufferAndExtension(o.photo_url);

          // Contacts
          const mobile1Contact = o.offender_contacts?.find(ct => String(ct.contact_type) === 'MOBILE_PRIMARY') || o.offender_contacts?.find(ct => String(ct.contact_type).startsWith('MOBILE'));
          const mobile2Contact = o.offender_contacts?.find(ct => String(ct.contact_type) === 'MOBILE_SECONDARY');
          const emailContact = o.offender_contacts?.find(ct => String(ct.contact_type) === 'GMAIL');

          const mobile1 = mobile1Contact?.value || '';
          const mobile2 = mobile2Contact?.value || '';
          const email = emailContact?.value || '';

          const otherContacts = (o.offender_contacts || [])
            .filter(ct => ct.id !== mobile1Contact?.id && ct.id !== mobile2Contact?.id && ct.id !== emailContact?.id)
            .map(ct => `${ct.contact_type}: ${ct.value}${ct.notes ? ` (${ct.notes})` : ''}`)
            .join('; ');

          // Financials (only Bank Name retained per request)
          const financials = o.offender_financials || [];
          const bankNames = Array.from(new Set(financials.map(f => f.bank_name).filter(Boolean))).join('; ');

          // Crime history (linked cases)
          const linkedCasesList = (o.case_accused || []).map(link => {
            const lc = link.cases;
            if (!lc) return '';
            const psName = lc.police_stations?.name ? ` in ${lc.police_stations.name}` : '';
            const dateStr = lc.case_date ? ` on ${new Date(lc.case_date).toLocaleDateString('en-IN')}` : '';
            const lawStr = lc.section_of_law ? ` (${lc.section_of_law})` : '';
            const statusStr = link.arrest_status ? ` - ${link.arrest_status}` : '';
            return `Cr.No. ${lc.fir_no}${psName}${dateStr}${lawStr}${statusStr}`;
          }).filter(Boolean).join('; ');

          // Arrest & Bail
          const arrestDateStr = ca?.arrest_date ? new Date(ca.arrest_date).toLocaleDateString('en-IN') : '';
          const bailDateStr = ca?.bail_date ? new Date(ca.bail_date).toLocaleDateString('en-IN') : '';
          const bailDetails = ca?.bail_conditions ? `${bailDateStr} (Cond: ${ca.bail_conditions})` : bailDateStr;

          exportRows.push({
            'Sl. No.': slNo++,
            'Cr. No. & Year': c.fir_no,
            'Name of the P.S.': c.police_stations?.name || '',
            'Section of Law': c.section_of_law || '',
            'Stage of Case': c.stage || '',
            'Case Date': caseDateStr,
            'Accused Photo': '',

            // 1. PERSONAL DETAILS
            'Full Name': o.full_name || '',
            'Alias': o.alias || '',
            'Gender': o.gender || '',
            'Age': o.age != null ? String(o.age) : '',
            'Father / Husband Name': o.father_husband_name || '',
            'Category of Accused (Local Peddeler, Local Supplier, Transporter and etc.)': o.category || '',
            'Pedller/ Accused Mobile No. 1': mobile1,
            'Pedller/ Accused Mobile No. 2': mobile2,
            'Gmail ID / Email': email,
            'Other Contacts': otherContacts,
            'Test Results (Positive/ Negative/ Invalid)': o.test_result || '',

            // 2. ADDRESS DETAILS
            'Present Address (Long. & Lat.)': o.full_address || '',
            'Permanent Address (Long. & Lat. If Possible)': o.landmark_area || '',
            'Landmark / Area': o.landmark_area || '',
            'Mandal': o.mandal || '',
            'District': o.district || '',
            'State': o.state || '',

            // 6. SOCIO-ECONOMIC PROFILE
            'Occupation (Student/ Labor/ Employee/ Bussiness/ etc.)': o.occupation || '',

            // 7. Source of Procurement / DRUG SUPPLY CHAIN MAPPING
            'Source Location': c.source_location || '',
            'Destination Location': c.destination_location || '',

            // 9. PURCHASE MODUS OPERANDI
            'Quantity (KG)': qty > 0 ? `${qty} KG` : '',
            'Cash Seized (INR)': cash > 0 ? String(cash) : '',
            'Vehicles Seized': vehicles > 0 ? String(vehicles) : '',

            // 10. CRIME HISTORY
            'Arrest status': ca?.arrest_status || '',
            'Arrest Date': arrestDateStr,
            'Bail Date & Conditions': bailDetails,
            'History Sheet / Rowdy Sheet': c.is_history_sheet ? 'History Sheet' : (c.is_rowdy_sheet ? 'Rowdy Sheet' : 'No'),
            'Total Cases Count': String(o.case_accused?.length || 0),
            'Linked Cases / Crime History': linkedCasesList,
            _imageInfo: imageInfo
          });
        }
      }
    }

    await logAudit('EXPORT', 'REPORT', null, req,
      `Exported DPR Excel with ${exportRows.length} rows for ${cases.length} cases`
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'GARUDA NDPS';
    const worksheet = workbook.addWorksheet('DPR Export');

    const columnsHeader = [
      'Sl. No.',
      'Cr. No. & Year',
      'Name of the P.S.',
      'Section of Law',
      'Stage of Case',
      'Case Date',
      'Accused Photo',
      'Full Name',
      'Alias',
      'Gender',
      'Age',
      'Father / Husband Name',
      'Category of Accused (Local Peddeler, Local Supplier, Transporter and etc.)',
      'Pedller/ Accused Mobile No. 1',
      'Pedller/ Accused Mobile No. 2',
      'Gmail ID / Email',
      'Other Contacts',
      'Test Results (Positive/ Negative/ Invalid)',
      'Present Address (Long. & Lat.)',
      'Permanent Address (Long. & Lat. If Possible)',
      'Landmark / Area',
      'Mandal',
      'District',
      'State',
      'Occupation (Student/ Labor/ Employee/ Bussiness/ etc.)',
      'Source Location',
      'Destination Location',
      'Quantity (KG)',
      'Cash Seized (INR)',
      'Vehicles Seized',
      'Arrest status',
      'Arrest Date',
      'Bail Date & Conditions',
      'History Sheet / Rowdy Sheet',
      'Total Cases Count',
      'Linked Cases / Crime History'
    ];

    worksheet.columns = columnsHeader.map(header => ({
      header,
      key: header,
      width: header === 'Accused Photo' ? 18 : 22
    }));

    // Header row styling
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

    // Process data rows & images
    for (let i = 0; i < exportRows.length; i++) {
      const rowData = exportRows[i];
      const rowNumber = i + 2; // Row 1 is header
      const excelRow = worksheet.getRow(rowNumber);

      const cellValues: Record<string, string> = {};
      for (const [key, val] of Object.entries(rowData)) {
        if (key !== '_imageInfo') {
          cellValues[key] = cleanCellText(val);
        }
      }
      excelRow.values = cellValues;
      excelRow.alignment = { vertical: 'middle', wrapText: true };

      const imgInfo = rowData._imageInfo;
      if (imgInfo) {
        excelRow.height = 65;
        const imageId = workbook.addImage({
          buffer: imgInfo.buffer,
          extension: imgInfo.extension
        });
        // Column 'Accused Photo' is 7th column (index 6 0-based)
        worksheet.addImage(imageId, {
          tl: { col: 6, row: rowNumber - 1 },
          ext: { width: 55, height: 55 },
          editAs: 'oneCell'
        });
      } else {
        excelRow.height = 24;
      }
    }

    // Dynamic Column Width Adjustment
    worksheet.columns.forEach((column) => {
      if (column.header === 'Accused Photo') {
        column.width = 18;
        return;
      }
      let maxLen = column.header ? String(column.header).length : 10;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const valLen = cell.value ? String(cell.value).length : 0;
        if (valLen > maxLen) {
          maxLen = valLen;
        }
      });
      column.width = Math.min(Math.max(maxLen + 3, 14), 50);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="dpr-export-${Date.now()}.xlsx"`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('DPR Export Error:', error);
    res.status(500).json({ message: 'Failed to export DPR Excel' });
  }
};


export const getCustomReport = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);
    const { startDate, endDate, psId, contrabandType, stage, format } = req.query;

    const whereClause: any = { ...psFilter };
    if (startDate) whereClause.case_date = { ...whereClause.case_date, gte: new Date(String(startDate)) };
    if (endDate) whereClause.case_date = { ...whereClause.case_date, lte: new Date(String(endDate)) };
    if (psId && psId !== 'ALL') whereClause.ps_id = BigInt(String(psId));
    if (contrabandType && contrabandType !== 'ALL') whereClause.contraband_type = contrabandType;
    if (stage && stage !== 'ALL') whereClause.stage = stage;

    const cases = await prisma.cases.findMany({
      where: whereClause,
      include: {
        police_stations: { select: { name: true } },
        seizures: true,
        case_accused: {
          include: { offenders: true }
        }
      },
      orderBy: { case_date: 'desc' }
    });

    const reportRows = [];
    for (const c of cases) {
      const qty = c.seizures.reduce((acc: number, s: any) => acc + (s.contraband_kg ? Number(s.contraband_kg) : 0), 0);
      const cash = c.seizures.reduce((acc: number, s: any) => acc + (s.cash_amount ? Number(s.cash_amount) : 0), 0);
      const vehicles = c.seizures.reduce((acc: number, s: any) => acc + (s.vehicles_count ? Number(s.vehicles_count) : 0), 0);

      if (c.case_accused.length === 0) {
        reportRows.push({
          'FIR No': c.fir_no,
          'Case Date': c.case_date ? new Date(c.case_date).toISOString().split('T')[0] : '—',
          'Section of Law': c.section_of_law || '—',
          'Stage': c.stage,
          'Police Station': c.police_stations?.name || '—',
          'Accused Name': '—',
          'Age': '—',
          'Category': '—',
          'Risk Score': '—',
          'Status': '—',
          'Contraband Type': c.contraband_type || '—',
          'Quantity (KG)': qty > 0 ? `${qty} KG` : '0 KG',
          'Cash (INR)': cash > 0 ? String(cash) : '0',
          'Vehicles Seized': String(vehicles)
        });
      } else {
        for (const ca of c.case_accused) {
          reportRows.push({
            'FIR No': c.fir_no,
            'Case Date': c.case_date ? new Date(c.case_date).toISOString().split('T')[0] : '—',
            'Section of Law': c.section_of_law || '—',
            'Stage': c.stage,
            'Police Station': c.police_stations?.name || '—',
            'Accused Name': ca.offenders?.full_name || '—',
            'Age': ca.offenders?.age ? String(ca.offenders.age) : '—',
            'Category': ca.offenders?.category || '—',
            'Risk Score': ca.offenders?.risk_score || '—',
            'Status': ca.offenders?.status || '—',
            'Contraband Type': c.contraband_type || '—',
            'Quantity (KG)': qty > 0 ? `${qty} KG` : '0 KG',
            'Cash (INR)': cash > 0 ? String(cash) : '0',
            'Vehicles Seized': String(vehicles)
          });
        }
      }
    }

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(reportRows);
      XLSX.utils.book_append_sheet(wb, ws, 'Custom Report');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="custom-report-${Date.now()}.xlsx"`);
      return res.send(buf);
    }

    res.json(successResponse({
      generatedAt: new Date().toISOString(),
      totalRecords: reportRows.length,
      records: reportRows
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate custom report' });
  }
};

export const getCourtDiary = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);
    const days = req.query.days ? parseInt(String(req.query.days), 10) : 30;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    endDate.setHours(23, 59, 59, 999);

    const hearings = await prisma.court_hearings.findMany({
      where: {
        hearing_date: {
          gte: startDate,
          lte: endDate
        },
        cases: psFilter
      },
      include: {
        cases: {
          include: {
            police_stations: { select: { name: true } },
            case_accused: { include: { offenders: true } }
          }
        }
      },
      orderBy: { hearing_date: 'asc' }
    });

    const data = hearings.map((h) => ({
      id: h.id.toString(),
      scNumber: h.sc_number || '—',
      courtName: h.court_name || '—',
      hearingDate: h.hearing_date ? new Date(h.hearing_date).toISOString().split('T')[0] : '—',
      judgeName: h.judge_name || '—',
      orderText: h.order_text || '',
      nextHearingDate: h.next_hearing_date ? new Date(h.next_hearing_date).toISOString().split('T')[0] : null,
      caseId: h.case_id.toString(),
      firNo: h.cases?.fir_no || '—',
      psName: h.cases?.police_stations?.name || '—',
      accusedNames: h.cases?.case_accused.map(ca => ca.offenders?.full_name).join(', ') || '—'
    }));

    res.json(successResponse({
      generatedAt: new Date().toISOString(),
      totalHearings: data.length,
      daysFilter: days,
      hearings: data
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch court diary' });
  }
};

export const getPerformanceMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const user: ScopeUser = req.user! || {};
    const { psFilter } = getDashboardScope(user);

    const cases = await prisma.cases.findMany({
      where: psFilter,
      include: {
        police_stations: { select: { name: true } },
        seizures: true
      }
    });

    const totalCases = cases.length;
    let chargeSheetedCases = 0;
    let convictedCases = 0;
    let acquittedCases = 0;

    const stationStats: Record<string, { stationName: string; casesCount: number; contrabandKg: number }> = {};

    cases.forEach((c) => {
      if (c.stage !== 'FIR') {
        chargeSheetedCases++;
      }
      if (c.stage === 'CONVICTED') {
        convictedCases++;
      } else if (c.stage === 'ACQUITTED') {
        acquittedCases++;
      }

      const psName = c.police_stations?.name || 'Unknown';
      if (!stationStats[psName]) {
        stationStats[psName] = { stationName: psName, casesCount: 0, contrabandKg: 0 };
      }
      
      stationStats[psName].casesCount++;
      const qty = c.seizures.reduce((acc, s) => acc + (s.contraband_kg ? Number(s.contraband_kg) : 0), 0);
      stationStats[psName].contrabandKg += qty;
    });

    const totalDecided = convictedCases + acquittedCases;
    const convictionRate = totalDecided > 0 ? Math.round((convictedCases / totalDecided) * 100) : 0;
    const chargeSheetRate = totalCases > 0 ? Math.round((chargeSheetedCases / totalCases) * 100) : 0;

    const leaderboard = Object.values(stationStats)
      .sort((a, b) => b.casesCount - a.casesCount)
      .slice(0, 10);

    res.json(successResponse({
      generatedAt: new Date().toISOString(),
      summary: {
        totalCases,
        chargeSheetedCases,
        convictedCases,
        acquittedCases,
        convictionRate,
        chargeSheetRate
      },
      leaderboard
    }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to calculate performance metrics' });
  }
};

