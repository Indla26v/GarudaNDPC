import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { successResponse } from '../utils/transformers';
import { logAudit } from '../utils/audit-logger';
import { getOffenderWhere } from '../utils/scope';
import { paramId } from '../utils/params';
import { maskAadhaar, canRevealAadhaar } from '../utils/pii';
import { broadcastEvent } from './sse.controller';
import {
  isValidText, isValidSectionOfLaw, isValidPan, isValidIfsc,
  isValidUpiId, isValidNumeric, isValidPhone, isValidEmail, validateAadhaar,
} from '../utils/validators';
import { STATE_CODES, DISTRICT_NUMBERS } from '../config/constants';
import { handleControllerError } from '../utils/error-handler';

export const getOffenders = async (req: AuthRequest, res: Response) => {
  try {
    const { query, psId, category, page = 0, size = 10, timeRange, month, year } = req.query;
    
    let whereClause: any = { ...getOffenderWhere(req.user!) };

    if (req.query.approvalStatus) {
      whereClause.approval_status = String(req.query.approvalStatus);
    } else {
      whereClause.approval_status = 'APPROVED';
    }

    if (psId) {
      whereClause.ps_id = BigInt(psId as string);
    } else if (psId === '') {
      delete whereClause.ps_id;
    }
    if (category) {
      whereClause.category = category as any;
    }
    if (query) {
      const q = String(query);
      whereClause.OR = [
        { full_name: { contains: q, mode: 'insensitive' } },
        { alias: { contains: q, mode: 'insensitive' } },
        { offender_identity_docs: { some: { OR: [
          { aadhaar_no: { contains: q, mode: 'insensitive' } },
          { voter_id: { contains: q, mode: 'insensitive' } },
          { pan_card: { contains: q, mode: 'insensitive' } }
        ] } } },
        { offender_contacts: { some: { value: { contains: q, mode: 'insensitive' } } } },
        { case_accused: { some: { cases: { fir_no: { contains: q, mode: 'insensitive' } } } } }
      ];
    }

    if (timeRange === 'monthly') {
      const monthStr = month ? String(month) : new Date().toISOString().substring(0, 7);
      const [y, m] = monthStr.split('-').map(Number);
      if (y && m) {
        const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
        const end = new Date(y, m, 0, 23, 59, 59, 999);
        whereClause.created_at = { gte: start, lte: end };
      }
    } else if (timeRange === 'yearly') {
      const y = year ? Number(year) : new Date().getFullYear();
      const start = new Date(y, 0, 1, 0, 0, 0, 0);
      const end = new Date(y, 11, 31, 23, 59, 59, 999);
      whereClause.created_at = { gte: start, lte: end };
    }

    const skip = Number(page) * Number(size);
    const take = Number(size);

    const [offenders, total] = await Promise.all([
      prisma.offenders.findMany({
        where: whereClause,
        include: {
          police_stations: true,
          offender_contacts: { where: { contact_type: 'MOBILE_PRIMARY' } },
          case_accused: {
            include: {
              cases: {
                select: {
                  fir_no: true
                }
              }
            }
          }
        },
        skip,
        take
      }),
      prisma.offenders.count({ where: whereClause })
    ]);

    const formatted = offenders.map(o => ({
      id: o.id.toString(),
      slNo: o.sl_no,
      crNo: o.case_accused.map(ca => ca.cases?.fir_no).filter(Boolean).join(', ') || null,
      fullName: o.full_name,
      alias: o.alias,
      category: o.category,
      status: o.status,
      riskScore: o.risk_score,
      psName: o.police_stations?.name,
      district: o.district,
      mobile: o.offender_contacts?.[0]?.value || null,
      totalCases: o.case_accused.length,
      photoUrl: o.photo_url
    }));

    res.json(successResponse({ content: formatted, totalElements: total, totalPages: Math.ceil(total / take) }));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getOffenderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // ── SECURITY FIX #5: Apply row-level scope to prevent IDOR
    // (Bypassed by request to allow SHO, SDPO and other roles to view offender profiles)
    const o = await prisma.offenders.findFirst({
      where: { id: BigInt(id as string) },
      include: {
        police_stations: true,
        users: true,
        offender_identity_docs: true,
        offender_contacts: true,
        offender_financials: true,
        offender_drug_profile: true,
        supply_chain_links_supply_chain_links_offender_idTooffenders: true,
        case_accused: true
      }
    });

    if (!o) return res.status(404).json({ message: 'Offender not found' });

    const userRole = req.user?.role || '';
    const reveal = req.query.reveal === 'true' && canRevealAadhaar(userRole);
    const rawAadhaar = o.offender_identity_docs?.[0]?.aadhaar_no ?? null;

    if (reveal && rawAadhaar) {
      await logAudit('VIEW', 'OFFENDER', o.id, req, 'PII_REVEALED: aadhaar');
    }
    
    // Transform to response like OffenderResponse
    const response = {
      id: o.id.toString(),
      slNo: o.sl_no,
      psId: o.ps_id.toString(),
      psName: o.police_stations?.name,
      fullName: o.full_name,
      alias: o.alias,
      fatherHusbandName: o.father_husband_name,
      age: o.age,
      gender: o.gender,
      category: o.category,
      testResult: o.test_result,
      fullAddress: o.full_address,
      landmarkArea: o.landmark_area,
      district: o.district,
      state: o.state,
      occupation: o.occupation,
      monthlyIncome: o.monthly_income,
      photoUrl: o.photo_url,
      status: o.status,
      riskScore: o.risk_score,
      createdByName: o.users?.full_name,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      identityDocs: o.offender_identity_docs?.[0]
        ? {
            id: o.offender_identity_docs[0].id.toString(),
            aadhaarNo: reveal ? rawAadhaar : maskAadhaar(rawAadhaar),
            aadhaarMasked: !reveal,
            voterId: o.offender_identity_docs[0].voter_id,
            panCard: o.offender_identity_docs[0].pan_card,
          }
        : null,
      aadhaarNo: reveal ? rawAadhaar : maskAadhaar(rawAadhaar),
      voterId: o.offender_identity_docs?.[0]?.voter_id || null,
      panCard: o.offender_identity_docs?.[0]?.pan_card || null,
      addictionType: o.offender_drug_profile?.addiction_type || null,
      consumptionFrequency: o.offender_drug_profile?.consumption_frequency || null,
      sourceOfProcurement: o.offender_drug_profile?.source_of_procurement || null,
      modeOfPurchase: o.offender_drug_profile?.mode_of_purchase || null,
      usualConsumptionSpot: o.offender_drug_profile?.usual_consumption_spot || null,
      sectionOfLaw: o.offender_drug_profile?.section_of_law || null,
      drugProfile: o.offender_drug_profile
        ? {
            id: o.offender_drug_profile.id.toString(),
            addictionType: o.offender_drug_profile.addiction_type,
            consumptionFrequency: o.offender_drug_profile.consumption_frequency,
            sourceOfProcurement: o.offender_drug_profile.source_of_procurement,
            modeOfPurchase: o.offender_drug_profile.mode_of_purchase,
            usualConsumptionSpot: o.offender_drug_profile.usual_consumption_spot,
            sectionOfLaw: o.offender_drug_profile.section_of_law,
          }
        : null,
      contacts: o.offender_contacts.map(c => ({
        id: c.id.toString(),
        contactType: c.contact_type,
        value: c.value,
        notes: c.notes
      })),
      financials: o.offender_financials.map(f => ({
        id: f.id.toString(),
        finType: f.fin_type,
        value: f.value,
        bankName: f.bank_name,
        notes: f.notes
      })),
      supplyChainLinks: o.supply_chain_links_supply_chain_links_offender_idTooffenders.map(link => ({
        id: link.id.toString(),
        linkedOffenderId: link.linked_offender_id?.toString(),
        linkType: link.link_type,
        linkedName: link.linked_person_name,
        linkedContact: link.linked_person_contact,
        notes: link.notes
      })),
      totalCases: o.case_accused.length
    };

    res.json(successResponse(response));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createOffender = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;

    const aadhaarNo = (data.aadhaarNo ?? data.identityDocs?.aadhaarNo ?? '') || null;
    const aadhaarErr = validateAadhaar(aadhaarNo);
    if (aadhaarErr) {
      return res.status(400).json({ message: aadhaarErr });
    }

    if (!isValidText(data.fullName || data.full_name)) return res.status(400).json({ message: 'Full Name contains invalid special characters' });
    if (!isValidText(data.alias)) return res.status(400).json({ message: 'Alias contains invalid special characters' });
    if (!isValidText(data.fatherHusbandName || data.father_husband_name)) return res.status(400).json({ message: "Father/Husband's Name contains invalid special characters" });
    if (data.age && !isValidNumeric(data.age)) return res.status(400).json({ message: 'Age must be a valid number' });
    if (!isValidText(data.occupation)) return res.status(400).json({ message: 'Occupation contains invalid special characters' });
    if (data.monthlyIncome && !isValidNumeric(data.monthlyIncome)) return res.status(400).json({ message: 'Monthly Income must be a valid number' });
    if (!isValidText(data.landmark || data.landmarkArea || data.landmark_area)) return res.status(400).json({ message: 'Landmark contains invalid special characters' });
    if (!isValidText(data.district)) return res.status(400).json({ message: 'District contains invalid special characters' });
    if (!isValidText(data.state)) return res.status(400).json({ message: 'State contains invalid special characters' });
    if (!isValidText(data.voterId || (data.identityDocs && data.identityDocs.voterId))) return res.status(400).json({ message: 'Voter ID contains invalid special characters' });
    
    const pan = data.panCard ?? data.identityDocs?.panCard;
    if (pan && !isValidPan(pan)) return res.status(400).json({ message: 'PAN Card must be exactly 10 alphanumeric characters' });
    
    const secLaw = data.sectionOfLaw ?? data.drugProfile?.sectionOfLaw;
    if (secLaw && !isValidSectionOfLaw(secLaw)) return res.status(400).json({ message: 'Section of Law contains invalid characters' });

    // Validate contacts
    if (data.contacts && Array.isArray(data.contacts)) {
      for (const c of data.contacts) {
        if (c.value) {
          const type = c.contactType || c.contact_type;
          if (type === 'GMAIL') {
            if (!isValidEmail(c.value)) return res.status(400).json({ message: 'Invalid email address' });
          } else if (['MOBILE_PRIMARY', 'MOBILE_SECONDARY', 'MOBILE_SIBLING'].includes(type)) {
            if (!isValidPhone(c.value)) return res.status(400).json({ message: 'Phone number must contain only numbers' });
            const valStr = String(c.value).trim().replace(/\s+/g, '');
            const backendCountryCodes = [
              { code: '+91', length: 10 },
              { code: '+1', length: 10 },
              { code: '+44', length: 10 },
              { code: '+971', length: 9 },
              { code: '+880', length: 10 },
              { code: '+977', length: 10 },
              { code: '+94', length: 9 }
            ];
            let matched = false;
            for (const cc of backendCountryCodes) {
              if (valStr.startsWith(cc.code)) {
                matched = true;
                const digits = valStr.substring(cc.code.length);
                if (digits.length !== cc.length) {
                  return res.status(400).json({ message: `Phone number for ${type.replace('_', ' ')} must be exactly ${cc.length} digits for ${cc.code}` });
                }
                break;
              }
            }
            if (!matched) {
              if (valStr.startsWith('+')) {
                if (valStr.replace(/[^0-9]/g, '').length < 7) {
                  return res.status(400).json({ message: 'Invalid phone number length' });
                }
              } else {
                if (valStr.length !== 10) {
                  return res.status(400).json({ message: 'Phone number must be exactly 10 digits for India (+91)' });
                }
              }
            }
          }
        }
      }
    }

    // Validate financials
    if (data.financials && Array.isArray(data.financials)) {
      for (const f of data.financials) {
        const type = f.finType || f.fin_type;
        if (f.value) {
          if (type === 'BANK_ACCOUNT_NO') {
            if (!isValidNumeric(f.value)) return res.status(400).json({ message: 'Bank Account Number must contain only numbers' });
          } else if (type === 'UPI_ID') {
            if (!isValidUpiId(f.value)) return res.status(400).json({ message: 'UPI ID contains invalid characters' });
          } else if (type === 'IFSC_CODE') {
            if (!isValidIfsc(f.value)) return res.status(400).json({ message: 'IFSC Code must be exactly 11 alphanumeric characters' });
          } else if (type === 'UPI_LINKED_MOBILE') {
            if (!isValidPhone(f.value)) return res.status(400).json({ message: 'UPI Linked Phone Number must contain only numbers' });
          }
        }
        if (f.bankName && !isValidText(f.bankName)) return res.status(400).json({ message: 'Bank Name contains invalid special characters' });
      }
    }

    // Validate criminal histories
    if (data.criminalHistories && Array.isArray(data.criminalHistories)) {
      for (const ch of data.criminalHistories) {
        if (ch.previousCrNo && !isValidText(ch.previousCrNo)) return res.status(400).json({ message: 'Previous CR No contains invalid characters' });
        if (ch.previousPs && !isValidText(ch.previousPs)) return res.status(400).json({ message: 'Previous PS contains invalid characters' });
        if (ch.sectionsOfLaw && !isValidSectionOfLaw(ch.sectionsOfLaw)) return res.status(400).json({ message: 'Criminal History Section of Law contains invalid characters' });
        if (ch.caseStage && !isValidText(ch.caseStage)) return res.status(400).json({ message: 'Case Stage contains invalid characters' });
      }
    }

    // Validate supply chain links
    if (data.supplyChainLinks && Array.isArray(data.supplyChainLinks)) {
      for (const l of data.supplyChainLinks) {
        const name = l.linkedName || l.linkedPersonName || l.linked_person_name;
        const contact = l.linkedContact || l.linkedPersonContact || l.linked_person_contact;
        if (name && !isValidText(name)) return res.status(400).json({ message: 'Linked person name contains invalid characters' });
        if (contact && !isValidPhone(contact)) return res.status(400).json({ message: 'Linked person contact must contain only numbers' });
      }
    }

    if (data.financials && Array.isArray(data.financials)) {
      const hasBankAccount = data.financials.some((f: any) => (f.finType === 'BANK_ACCOUNT_NO' || f.fin_type === 'BANK_ACCOUNT_NO') && f.value?.trim());
      const hasIfsc = data.financials.some((f: any) => (f.finType === 'IFSC_CODE' || f.fin_type === 'IFSC_CODE') && f.value?.trim());
      
      if (hasBankAccount && !hasIfsc) {
        return res.status(400).json({ message: 'An IFSC Code is required when a Bank Account Number is provided.' });
      }

      const hasUpiId = data.financials.some((f: any) => (f.finType === 'UPI_ID' || f.fin_type === 'UPI_ID') && f.value?.trim());
      const hasUpiMobile = data.financials.some((f: any) => (f.finType === 'UPI_LINKED_MOBILE' || f.fin_type === 'UPI_LINKED_MOBILE') && f.value?.trim());
      
      if (hasUpiId && !hasUpiMobile) {
        return res.status(400).json({ message: 'A UPI Linked Phone Number is required when a UPI ID is provided.' });
      }
    }
    
    let userId = null;
    if (req.user) {
       userId = BigInt(req.user.userId);
    }
    
    // Build nested creations safely
    const contactsCreate = data.contacts ? data.contacts.map((c: any) => ({
      contact_type: c.contactType || c.contact_type,
      value: c.value,
      notes: c.notes
    })) : [];

    const voterId = (data.voterId ?? data.identityDocs?.voterId ?? '') || null;
    const panCard = (data.panCard ?? data.identityDocs?.panCard ?? '') || null;

    const identityDocsCreate = (aadhaarNo || voterId || panCard) ? {
      aadhaar_no: aadhaarNo,
      voter_id: voterId,
      pan_card: panCard
    } : undefined;

    const financialsCreate = data.financials
      ? data.financials
          .filter((f: any) => (f.value ?? '').trim() !== '')
          .map((f: any) => ({
            fin_type: f.finType || f.fin_type,
            value: f.value,
            bank_name: (f.bankName || f.bank_name) || null,
            notes: f.notes || null
          }))
      : [];

    const toEnum = (v: any): string | null => (v && typeof v === 'string' && v.trim()) ? v.trim().toUpperCase() : null;
    const addictionType = toEnum(data.addictionType ?? data.drugProfile?.addictionType);
    const consumptionFrequency = toEnum(data.consumptionFrequency ?? data.drugProfile?.consumptionFrequency);
    const sourceOfProcurement = toEnum(data.sourceOfProcurement ?? data.drugProfile?.sourceOfProcurement);
    const modeOfPurchase = toEnum(data.modeOfPurchase ?? data.drugProfile?.modeOfPurchase);
    const usualConsumptionSpot = (data.usualConsumptionSpot ?? data.drugProfile?.usualConsumptionSpot) || null;
    const sectionOfLaw = (data.sectionOfLaw ?? data.drugProfile?.sectionOfLaw) || null;
 
    const drugProfileCreate = (addictionType || consumptionFrequency || sourceOfProcurement || modeOfPurchase || usualConsumptionSpot || sectionOfLaw) ? {
      addiction_type: addictionType as any,
      consumption_frequency: consumptionFrequency as any,
      source_of_procurement: sourceOfProcurement as any,
      mode_of_purchase: modeOfPurchase as any,
      usual_consumption_spot: usualConsumptionSpot,
      section_of_law: sectionOfLaw
    } : undefined;

    let slNo = data.slNo || data.sl_no || null;
    if (!slNo) {
      let offenderDistrict = data.district || '';
      let offenderState = data.state || '';
      
      if (!offenderDistrict || !offenderState) {
        const ps = await prisma.police_stations.findUnique({
          where: { id: BigInt(data.psId || data.ps_id) }
        });
        if (ps) {
          if (!offenderDistrict) offenderDistrict = ps.district;
          if (!offenderState) offenderState = ps.state;
        }
      }

      const stateCode = STATE_CODES[offenderState.toLowerCase().trim()];
      const districtNum = DISTRICT_NUMBERS[offenderDistrict.toLowerCase().trim()];

      // ── SECURITY FIX #9: Race Condition in SL No Generation
      // Instead of count() + 1, we save the prefix and update after creation
      let prefix = 'SL-';
      if (stateCode && districtNum) {
        prefix = `${stateCode}${districtNum}-`;
      }
      
      // Temporary sl_no if needed, but it's optional in schema. We omit it here.
      slNo = null as any; // Will be set after creation
    }

    const dataObj: any = {
      // sl_no: slNo, (omitted to set atomically)
      full_name: data.fullName || data.full_name,
      alias: data.alias || null,
      father_husband_name: data.fatherHusbandName || data.father_husband_name || null,
      age: data.age,
      gender: data.gender,
      category: data.category,
      test_result: (data.testResult || data.test_result)?.toUpperCase?.() || null,
      full_address: data.fullAddress || data.full_address || null,
      landmark_area: data.landmarkArea || data.landmark_area || null,
      district: data.district,
      state: data.state,
      occupation: data.occupation,
      monthly_income: data.monthlyIncome || data.monthly_income || null,
      photo_url: data.photoUrl || data.photo_url || null,
      status: data.status || 'ACTIVE',
      risk_score: data.riskScore || data.risk_score,
      ps_id: BigInt(data.psId || data.ps_id),
      created_by: userId,
      approval_status: req.user?.role === 'CONSTABLE' ? 'PENDING' : 'APPROVED',
    };

    if (slNo && data.slNo) {
       dataObj.sl_no = slNo; // if it was explicitly provided
    }

    if (contactsCreate.length > 0) dataObj.offender_contacts = { create: contactsCreate };
    if (identityDocsCreate) dataObj.offender_identity_docs = { create: identityDocsCreate };
    if (financialsCreate.length > 0) dataObj.offender_financials = { create: financialsCreate };
    if (drugProfileCreate) dataObj.offender_drug_profile = { create: drugProfileCreate };

    const newOffender = await prisma.offenders.create({
      data: dataObj
    });

    // ── SECURITY FIX #9: Set SL No using atomic ID
    if (!data.sl_no && !data.slNo) {
      const stateCode = STATE_CODES[(data.state || 'Andhra Pradesh').toLowerCase().trim()];
      const districtNum = DISTRICT_NUMBERS[(data.district || '').toLowerCase().trim()];
      
      let finalSlNo = `SL-${100 + Number(newOffender.id)}`;
      if (stateCode && districtNum) {
        finalSlNo = `${stateCode}${districtNum}-${String(newOffender.id).padStart(4, '0')}`;
      }

      await prisma.offenders.update({
        where: { id: newOffender.id },
        data: { sl_no: finalSlNo }
      });
    }
    
    if (data.supplyChainLinks && data.supplyChainLinks.length > 0) {
       await prisma.supply_chain_links.createMany({
          data: data.supplyChainLinks.map((s: any) => ({
            offender_id: newOffender.id,
            linked_offender_id: s.linkedOffenderId ? BigInt(s.linkedOffenderId) : null,
            link_type: s.linkType || s.link_type,
            linked_person_name: s.linkedName || s.linkedPersonName || s.linked_person_name,
            linked_person_contact: s.linkedContact || s.linkedPersonContact || s.linked_person_contact,
            notes: s.notes
          }))
       });
    }

    await logAudit('CREATE', 'OFFENDER', newOffender.id, req);
    broadcastEvent('offender_created', { id: newOffender.id.toString() });
    res.status(201).json(successResponse({ id: newOffender.id.toString() }, 'Offender created successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOffender = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) return res.status(400).json({ message: 'Missing ID parameter' });
    const data = req.body;
    const secParam = (req.query.section as string | undefined)?.trim();
    const userRole = req.user!.role;
    const userPsId = req.user!.policeStationId ? BigInt(req.user!.policeStationId) : null;

    const existingOffender = await prisma.offenders.findUnique({ where: { id: BigInt(id) } });
    if (!existingOffender) {
      return res.status(404).json({ message: 'Offender not found' });
    }

    if (['SHO', 'CONSTABLE'].includes(userRole) && existingOffender.ps_id !== userPsId) {
      return res.status(403).json({ message: 'You do not have permission to edit data from other police stations' });
    }

    const isSec = (sec: string) => !secParam || secParam === sec;

    // Validate Basic Information
    if (isSec('Basic Information')) {
      const aadhaarNo = (data.aadhaarNo ?? data.identityDocs?.aadhaarNo ?? '') || null;
      const aadhaarErr = validateAadhaar(aadhaarNo);
      if (aadhaarErr) {
        return res.status(400).json({ message: aadhaarErr });
      }

      if (data.fullName !== undefined && !isValidText(data.fullName)) return res.status(400).json({ message: 'Full Name contains invalid special characters' });
      if (data.alias !== undefined && !isValidText(data.alias)) return res.status(400).json({ message: 'Alias contains invalid special characters' });
      if (data.fatherHusbandName !== undefined && !isValidText(data.fatherHusbandName)) return res.status(400).json({ message: "Father/Husband's Name contains invalid special characters" });
      if (data.age !== undefined && data.age !== null && !isValidNumeric(data.age)) return res.status(400).json({ message: 'Age must be a valid number' });
      if (data.occupation !== undefined && !isValidText(data.occupation)) return res.status(400).json({ message: 'Occupation contains invalid special characters' });
      if (data.monthlyIncome !== undefined && data.monthlyIncome !== null && !isValidNumeric(data.monthlyIncome)) return res.status(400).json({ message: 'Monthly Income must be a valid number' });
      if (data.voterId !== undefined && !isValidText(data.voterId)) return res.status(400).json({ message: 'Voter ID contains invalid special characters' });
      
      const pan = data.panCard ?? data.identityDocs?.panCard;
      if (pan && !isValidPan(pan)) return res.status(400).json({ message: 'PAN Card must be exactly 10 alphanumeric characters' });
    }

    // Validate Address Details
    if (isSec('Address Details')) {
      if (data.landmarkArea !== undefined && !isValidText(data.landmarkArea)) return res.status(400).json({ message: 'Landmark contains invalid special characters' });
      if (data.district !== undefined && !isValidText(data.district)) return res.status(400).json({ message: 'District contains invalid special characters' });
      if (data.state !== undefined && !isValidText(data.state)) return res.status(400).json({ message: 'State contains invalid special characters' });
    }

    // Validate Drug Profile
    if (isSec('Drug Profile')) {
      const secLaw = data.sectionOfLaw ?? data.drugProfile?.sectionOfLaw;
      if (secLaw && !isValidSectionOfLaw(secLaw)) return res.status(400).json({ message: 'Section of Law contains invalid characters' });
    }

    // Validate contacts
    if (isSec('Phone & Email Contacts') || isSec('Social Media & Messaging Profiles')) {
      if (data.contacts && Array.isArray(data.contacts)) {
        for (const c of data.contacts) {
          if (c.value) {
            const type = c.contactType || c.contact_type;
            if (type === 'GMAIL') {
              if (!isValidEmail(c.value)) return res.status(400).json({ message: 'Invalid email address' });
            } else if (['MOBILE_PRIMARY', 'MOBILE_SECONDARY', 'MOBILE_SIBLING'].includes(type)) {
              if (!isValidPhone(c.value)) return res.status(400).json({ message: 'Phone number must contain only numbers' });
              const valStr = String(c.value).trim().replace(/\s+/g, '');
              const backendCountryCodes = [
                { code: '+91', length: 10 },
                { code: '+1', length: 10 },
                { code: '+44', length: 10 },
                { code: '+971', length: 9 },
                { code: '+880', length: 10 },
                { code: '+977', length: 10 },
                { code: '+94', length: 9 }
              ];
              let matched = false;
              for (const cc of backendCountryCodes) {
                if (valStr.startsWith(cc.code)) {
                  matched = true;
                  const digits = valStr.substring(cc.code.length);
                  if (digits.length !== cc.length) {
                    return res.status(400).json({ message: `Phone number for ${type.replace('_', ' ')} must be exactly ${cc.length} digits for ${cc.code}` });
                  }
                  break;
                }
              }
              if (!matched) {
                if (valStr.startsWith('+')) {
                  if (valStr.replace(/[^0-9]/g, '').length < 7) {
                    return res.status(400).json({ message: 'Invalid phone number length' });
                  }
                } else {
                  if (valStr.length !== 10) {
                    return res.status(400).json({ message: 'Phone number must be exactly 10 digits for India (+91)' });
                  }
                }
              }
            }
          }
        }
      }
    }

    // Validate financials
    if (isSec('Financial Details')) {
      if (data.financials && Array.isArray(data.financials)) {
        for (const f of data.financials) {
          const type = f.finType || f.fin_type;
          if (f.value) {
            if (type === 'BANK_ACCOUNT_NO') {
              if (!isValidNumeric(f.value)) return res.status(400).json({ message: 'Bank Account Number must contain only numbers' });
            } else if (type === 'UPI_ID') {
              if (!isValidUpiId(f.value)) return res.status(400).json({ message: 'UPI ID contains invalid characters' });
            } else if (type === 'IFSC_CODE') {
              if (!isValidIfsc(f.value)) return res.status(400).json({ message: 'IFSC Code must be exactly 11 alphanumeric characters' });
            } else if (type === 'UPI_LINKED_MOBILE') {
              if (!isValidPhone(f.value)) return res.status(400).json({ message: 'UPI Linked Phone Number must contain only numbers' });
            }
          }
          if (f.bankName && !isValidText(f.bankName)) return res.status(400).json({ message: 'Bank Name contains invalid special characters' });
        }

        const hasBankAccount = data.financials.some((f: any) => (f.finType === 'BANK_ACCOUNT_NO' || f.fin_type === 'BANK_ACCOUNT_NO') && f.value?.trim());
        const hasIfsc = data.financials.some((f: any) => (f.finType === 'IFSC_CODE' || f.fin_type === 'IFSC_CODE') && f.value?.trim());
        
        if (hasBankAccount && !hasIfsc) {
          return res.status(400).json({ message: 'An IFSC Code is required when a Bank Account Number is provided.' });
        }

        const hasUpiId = data.financials.some((f: any) => (f.finType === 'UPI_ID' || f.fin_type === 'UPI_ID') && f.value?.trim());
        const hasUpiMobile = data.financials.some((f: any) => (f.finType === 'UPI_LINKED_MOBILE' || f.fin_type === 'UPI_LINKED_MOBILE') && f.value?.trim());
        
        if (hasUpiId && !hasUpiMobile) {
          return res.status(400).json({ message: 'A UPI Linked Phone Number is required when a UPI ID is provided.' });
        }
      }
    }

    // Validate criminal histories
    if (isSec('Criminal History')) {
      if (data.criminalHistories && Array.isArray(data.criminalHistories)) {
        for (const ch of data.criminalHistories) {
          if (ch.previousCrNo && !isValidText(ch.previousCrNo)) return res.status(400).json({ message: 'Previous CR No contains invalid characters' });
          if (ch.previousPs && !isValidText(ch.previousPs)) return res.status(400).json({ message: 'Previous PS contains invalid characters' });
          if (ch.sectionsOfLaw && !isValidSectionOfLaw(ch.sectionsOfLaw)) return res.status(400).json({ message: 'Criminal History Section of Law contains invalid characters' });
          if (ch.caseStage && !isValidText(ch.caseStage)) return res.status(400).json({ message: 'Case Stage contains invalid characters' });
        }
      }
    }

    // Validate supply chain links
    if (isSec('Supply Chain Links')) {
      if (data.supplyChainLinks && Array.isArray(data.supplyChainLinks)) {
        for (const l of data.supplyChainLinks) {
          const name = l.linkedName || l.linkedPersonName || l.linked_person_name;
          const contact = l.linkedContact || l.linkedPersonContact || l.linked_person_contact;
          if (name && !isValidText(name)) return res.status(400).json({ message: 'Linked person name contains invalid characters' });
          if (contact && !isValidPhone(contact)) return res.status(400).json({ message: 'Linked person contact must contain only numbers' });
        }
      }
    }
    
    // ── SECURITY FIX #8: Apply row-level scope to prevent cross-PS record tampering
    const scope = getOffenderWhere(req.user!);
    const existing = await prisma.offenders.findFirst({ where: { id: BigInt(id as string), ...scope } });
    if (!existing) return res.status(404).json({ message: 'Offender not found or access denied' });

    // Transaction for safe nested updates
    await prisma.$transaction(async (tx) => {
       const updateDataObj: any = {};
       
       if (isSec('Basic Information')) {
         if (data.fullName || data.full_name) updateDataObj.full_name = String(data.fullName || data.full_name || '').slice(0, 500);
         if (data.status) updateDataObj.status = data.status;
         if (data.psId || data.ps_id) updateDataObj.ps_id = BigInt(data.psId || data.ps_id);
         if (data.slNo !== undefined || data.sl_no !== undefined) updateDataObj.sl_no = (data.slNo || data.sl_no) ? String(data.slNo || data.sl_no).slice(0, 200) : null;
         if (data.alias !== undefined) updateDataObj.alias = data.alias ? String(data.alias).slice(0, 500) : null;
         if (data.fatherHusbandName !== undefined || data.father_husband_name !== undefined) {
           updateDataObj.father_husband_name = (data.fatherHusbandName || data.father_husband_name) ? String(data.fatherHusbandName || data.father_husband_name).slice(0, 500) : null;
         }
         if (data.age !== undefined) updateDataObj.age = data.age ? Number(data.age) : null;
         if (data.gender !== undefined) updateDataObj.gender = data.gender;
         if (data.category !== undefined) updateDataObj.category = data.category;
         if (data.occupation !== undefined) updateDataObj.occupation = data.occupation ? String(data.occupation).slice(0, 300) : null;
         if (data.monthlyIncome !== undefined || data.monthly_income !== undefined) {
           updateDataObj.monthly_income = (data.monthlyIncome || data.monthly_income) ? String(data.monthlyIncome || data.monthly_income) : null;
         }
         if (data.photoUrl !== undefined || data.photo_url !== undefined) {
           updateDataObj.photo_url = (data.photoUrl || data.photo_url) ? String(data.photoUrl || data.photo_url) : null;
         }
         if (data.riskScore !== undefined || data.risk_score !== undefined) {
           updateDataObj.risk_score = data.riskScore || data.risk_score;
         }
       }

       if (isSec('Address Details')) {
         if (data.fullAddress !== undefined || data.full_address !== undefined) {
           updateDataObj.full_address = (data.fullAddress || data.full_address) ? String(data.fullAddress || data.full_address) : null;
         }
         if (data.landmarkArea !== undefined || data.landmark_area !== undefined) {
           updateDataObj.landmark_area = (data.landmarkArea || data.landmark_area) ? String(data.landmarkArea || data.landmark_area).slice(0, 500) : null;
         }
         if (data.district !== undefined) updateDataObj.district = data.district ? String(data.district).slice(0, 200) : null;
         if (data.state !== undefined) updateDataObj.state = data.state ? String(data.state).slice(0, 200) : null;
       }

       if (isSec('Drug Profile')) {
         if (data.testResult !== undefined || data.test_result !== undefined) {
           updateDataObj.test_result = data.testResult || data.test_result;
         }
       }

       if (Object.keys(updateDataObj).length > 0) {
         await tx.offenders.update({
            where: { id: BigInt(id as string) },
            data: updateDataObj
         });
       }

       // Identity docs (Basic Information)
       if (isSec('Basic Information')) {
         const existingDocs = await tx.offender_identity_docs.findFirst({
           where: { offender_id: BigInt(id as string) }
         });
         await tx.offender_identity_docs.deleteMany({ where: { offender_id: BigInt(id as string) } });

         let aadhaarNo = (data.aadhaarNo ?? data.identityDocs?.aadhaarNo ?? '') || null;
         if (aadhaarNo && (aadhaarNo.includes('X') || aadhaarNo.includes('x') || aadhaarNo.includes('*'))) {
           aadhaarNo = existingDocs?.aadhaar_no ?? null;
         }
         const voterId = (data.voterId ?? data.identityDocs?.voterId ?? '') || null;
         const panCard = (data.panCard ?? data.identityDocs?.panCard ?? '') || null;

         if (aadhaarNo || voterId || panCard) {
           await tx.offender_identity_docs.create({
             data: {
               offender_id: BigInt(id as string),
               aadhaar_no: aadhaarNo,
               voter_id: voterId,
               pan_card: panCard
             }
           });
         }
       }

       // Contacts
       if (isSec('Phone & Email Contacts') || isSec('Social Media & Messaging Profiles')) {
         await tx.offender_contacts.deleteMany({ where: { offender_id: BigInt(id as string) } });
         if (data.contacts) {
           await tx.offender_contacts.createMany({
             data: data.contacts.map((c: any) => ({
               offender_id: BigInt(id as string),
               contact_type: c.contactType || c.contact_type,
               value: c.value,
               notes: c.notes
             }))
           });
         }
       }

       // Financials
       if (isSec('Financial Details')) {
         await tx.offender_financials.deleteMany({ where: { offender_id: BigInt(id as string) } });
         if (data.financials) {
           const filteredFin = data.financials.filter((f: any) => (f.value ?? '').trim() !== '');
           if (filteredFin.length > 0) {
             await tx.offender_financials.createMany({
               data: filteredFin.map((f: any) => ({
                offender_id: BigInt(id as string),
                fin_type: f.finType || f.fin_type,
                value: f.value,
                bank_name: (f.bankName || f.bank_name) || null,
                notes: f.notes || null
               }))
             });
           }
         }
       }

       // Drug Profile
       if (isSec('Drug Profile')) {
         await tx.offender_drug_profile.deleteMany({ where: { offender_id: BigInt(id as string) } });
         const toEnumU = (v: any): string | null => (v && typeof v === 'string' && v.trim()) ? v.trim().toUpperCase() : null;
         const addictionType = toEnumU(data.addictionType ?? data.drugProfile?.addictionType);
         const consumptionFrequency = toEnumU(data.consumptionFrequency ?? data.drugProfile?.consumptionFrequency);
         const sourceOfProcurement = toEnumU(data.sourceOfProcurement ?? data.drugProfile?.sourceOfProcurement);
         const modeOfPurchase = toEnumU(data.modeOfPurchase ?? data.drugProfile?.modeOfPurchase);
         const usualConsumptionSpot = (data.usualConsumptionSpot ?? data.drugProfile?.usualConsumptionSpot) || null;
         const sectionOfLaw = (data.sectionOfLaw ?? data.drugProfile?.sectionOfLaw) || null;

         if (addictionType || consumptionFrequency || sourceOfProcurement || modeOfPurchase || usualConsumptionSpot || sectionOfLaw) {
           await tx.offender_drug_profile.create({
             data: {
               offender_id: BigInt(id as string),
               addiction_type: addictionType as any,
               consumption_frequency: consumptionFrequency as any,
               source_of_procurement: sourceOfProcurement as any,
               mode_of_purchase: modeOfPurchase as any,
               usual_consumption_spot: usualConsumptionSpot,
               section_of_law: sectionOfLaw
             }
           });
         }
       }

       // Supply Chain Links
       if (isSec('Supply Chain Links')) {
         await tx.supply_chain_links.deleteMany({ where: { offender_id: BigInt(id as string) } });
         if (data.supplyChainLinks) {
           await tx.supply_chain_links.createMany({
            data: data.supplyChainLinks.map((s: any) => ({
              offender_id: BigInt(id as string),
              linked_offender_id: s.linkedOffenderId ? BigInt(s.linkedOffenderId) : null,
              link_type: s.linkType || s.link_type,
              linked_person_name: s.linkedName || s.linkedPersonName || s.linked_person_name,
              linked_person_contact: s.linkedContact || s.linkedPersonContact || s.linked_person_contact,
              notes: s.notes
            }))
           });
         }
       }
    }, { maxWait: 15000, timeout: 60000 });

    await logAudit('UPDATE', 'OFFENDER', BigInt(id as string), req);
    broadcastEvent('data_updated', { entity: 'offender', id });
    res.json(successResponse({ id }, 'Offender updated successfully'));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDatabankRecords = async (req: AuthRequest, res: Response) => {
  try {
    const records = await (prisma as any).south_india_databank.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    const serializedRecords = records.map((r: any) => ({
      id: Number(r.id),
      crNo: r.crNo,
      secOfLaw: r.secOfLaw,
      policeStation: r.policeStation,
      psDistrict: r.district,
      accusedDetails: r.accusedDetails,
      mandal: r.mandal,
      accusedDistrict: r.accusedDistrict,
      state: r.state,
      branch: r.branch,
      name: r.accusedDetails.split(',')[0]?.replace(/^A\d+\.\s*/, '') || 'Unknown',
      district: r.accusedDistrict || r.district,
      contraband: 'Ganja',
      casesCount: 1,
      lastSighting: r.created_at.toISOString().split('T')[0],
      risk: 'Medium',
      aadhaar: 'XXXX-XXXX-XXXX',
      phone: 'Not specified',
      vehicles: 'Not specified',
      associates: 'Not specified',
      history: []
    }));

    res.json(successResponse(serializedRecords));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
