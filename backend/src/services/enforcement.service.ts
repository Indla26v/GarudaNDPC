/**
 * GARUDA — Enforcement Domain Service
 *
 * Encapsulates field enforcement checks, identity lookups, drug test result submissions,
 * SHO review workflows, and offender creation from positive enforcement tests.
 * Decouples business logic from HTTP controller routing (SRP + DIP).
 */
import prisma from '../config/prisma';
import { ScopeUser } from '../utils/scope';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/error-handler';

export interface CreateEnforcementInput {
  matchedOffenderId?: string | number;
  subjectName: string;
  subjectAge?: string | number;
  subjectGender?: string;
  subjectAadhaar?: string;
  placeOfEnforcement: string;
  photoUrl?: string;
  subjectPhone?: string;
  subjectPan?: string;
  subjectVoterId?: string;
  subjectAddress?: string;
  subjectFatherName?: string;
  subjectLandmark?: string;
  subjectDistrict?: string;
  subjectOccupation?: string;
  addictionType?: string;
  consumptionFrequency?: string;
  sourceOfProcurement?: string;
  modeOfPurchase?: string;
  usualConsumptionSpot?: string;
  testResult?: 'POSITIVE' | 'NEGATIVE';
  noSuspiciousActivity?: boolean;
  geo_lat?: number | string;
  geo_lng?: number | string;
}

export class EnforcementService {
  /**
   * Run identity lookups against Aadhaar, fuzzy name search, and criminal history.
   */
  static async performIdentityLookup(
    subjectAadhaar?: string,
    subjectName?: string,
    explicitMatchedId?: bigint | null
  ) {
    let ndpsMatch = false;
    let finalMatchedId: bigint | null = explicitMatchedId || null;
    let criminalRecordFound = false;
    const lookupResults: string[] = [];

    if (!finalMatchedId) {
      // 1. Aadhaar lookup
      if (subjectAadhaar && subjectAadhaar.length === 12) {
        const aadhaarHit = await prisma.offender_identity_docs.findFirst({
          where: { aadhaar_no: subjectAadhaar },
          include: { offenders: { select: { id: true, full_name: true, category: true, status: true } } },
        });
        if (aadhaarHit) {
          ndpsMatch = true;
          finalMatchedId = aadhaarHit.offenders.id;
          lookupResults.push(
            `Aadhaar match: ${aadhaarHit.offenders.full_name} (${aadhaarHit.offenders.category || 'Unknown category'}, Status: ${aadhaarHit.offenders.status})`
          );
        }
      }

      // 2. Name-based fuzzy match
      if (!finalMatchedId && subjectName) {
        const nameHits = await prisma.offenders.findMany({
          where: {
            full_name: { contains: subjectName, mode: 'insensitive' },
          },
          take: 5,
          select: { id: true, full_name: true, category: true, status: true, ps_id: true },
        });
        if (nameHits.length > 0) {
          ndpsMatch = true;
          finalMatchedId = nameHits[0]?.id || null;
          nameHits.forEach((h) => {
            lookupResults.push(`Name match: ${h.full_name} (${h.category || 'N/A'}, Status: ${h.status})`);
          });
        }
      }
    } else {
      ndpsMatch = true;
      lookupResults.push(`Explicitly matched to offender ID: ${finalMatchedId}`);
    }

    // 3. Criminal record check via case_accused
    if (finalMatchedId) {
      const accusedRecords = await prisma.case_accused.findMany({
        where: { offender_id: finalMatchedId },
        include: { cases: { select: { fir_no: true, stage: true } } },
        take: 5,
      });
      if (accusedRecords.length > 0) {
        criminalRecordFound = true;
        accusedRecords.forEach((r) => {
          lookupResults.push(`Criminal record: FIR ${r.cases.fir_no} (Stage: ${r.cases.stage})`);
        });
      }
    }

    return {
      ndpsMatch,
      finalMatchedId,
      criminalRecordFound,
      lookupResults,
      lookupSummary: lookupResults.length > 0 ? lookupResults.join(' | ') : 'No prior records found',
    };
  }

  /**
   * Create a field enforcement check record.
   */
  static async createCheck(input: CreateEnforcementInput, user: ScopeUser) {
    if (!input.subjectName || !input.placeOfEnforcement) {
      throw new ValidationError('Subject name and place of enforcement are required');
    }

    const psId = user.policeStationId;
    if (!psId) {
      throw new ValidationError('Officer must be assigned to a police station');
    }

    const matchedId = input.matchedOffenderId ? BigInt(input.matchedOffenderId) : null;
    const lookup = await this.performIdentityLookup(input.subjectAadhaar, input.subjectName, matchedId);

    const isPositive = input.testResult === 'POSITIVE';
    const finalStatus = isPositive
      ? 'PENDING_SHO_REVIEW'
      : input.testResult === 'NEGATIVE'
      ? 'NEGATIVE_CLOSED'
      : 'FIELD_CREATED';

    let findingsData = lookup.lookupSummary;
    let consumptionTypeJson: string | null = null;
    if (isPositive && !lookup.finalMatchedId) {
      consumptionTypeJson = JSON.stringify({
        addiction_type: input.addictionType || 'GANJA_ONLY',
        consumption_frequency: input.consumptionFrequency || null,
        source_of_procurement: input.sourceOfProcurement || null,
        mode_of_purchase: input.modeOfPurchase || null,
        usual_consumption_spot: input.usualConsumptionSpot || null,
      });
      findingsData +=
        '\n\n' +
        `=== CONSUMER DETAILS FOR DB CREATION ===\n` +
        `Phone: ${input.subjectPhone || 'N/A'}\n` +
        `Aadhaar: ${input.subjectAadhaar || 'N/A'}\n` +
        `PAN: ${input.subjectPan || 'N/A'}\n` +
        `Voter ID: ${input.subjectVoterId || 'N/A'}\n` +
        `Address: ${input.subjectAddress || 'N/A'}\n` +
        `Landmark: ${input.subjectLandmark || 'N/A'}\n` +
        `District: ${input.subjectDistrict || 'N/A'}\n` +
        `Father's Name: ${input.subjectFatherName || 'N/A'}\n` +
        `Occupation: ${input.subjectOccupation || 'N/A'}\n` +
        `Addiction Type: ${input.addictionType || 'GANJA_ONLY'}\n` +
        `Frequency: ${input.consumptionFrequency || 'N/A'}\n` +
        `Procurement Source: ${input.sourceOfProcurement || 'N/A'}\n` +
        `Purchase Mode: ${input.modeOfPurchase || 'N/A'}\n` +
        `Consumption Spot: ${input.usualConsumptionSpot || 'N/A'}`;
    }

    const check = await (prisma as any).enforcement_checks.create({
      data: {
        ps_id: BigInt(psId),
        created_by: BigInt(user.userId),
        subject_name: input.subjectName,
        subject_age: input.subjectAge ? parseInt(String(input.subjectAge)) : null,
        subject_gender: input.subjectGender || null,
        subject_aadhaar: input.subjectAadhaar || null,
        photo_url: input.photoUrl || null,
        place_of_enforcement: input.placeOfEnforcement,
        geo_lat: input.geo_lat ? parseFloat(String(input.geo_lat)) : null,
        geo_lng: input.geo_lng ? parseFloat(String(input.geo_lng)) : null,
        subject_phone: input.subjectPhone || null,
        subject_pan: input.subjectPan || null,
        subject_address: input.subjectAddress || null,
        subject_father_name: input.subjectFatherName || null,
        subject_landmark: input.subjectLandmark || null,
        subject_occupation: input.subjectOccupation || null,
        district: input.subjectDistrict || undefined,
        ndps_match: lookup.ndpsMatch,
        criminal_record_found: lookup.criminalRecordFound,
        matched_offender_id: lookup.finalMatchedId,
        test_result: input.testResult || null,
        consumption_type: consumptionTypeJson,
        status: finalStatus,
        lookup_summary: findingsData,
      },
      include: {
        police_station: { select: { name: true, ps_code: true } },
        officer: { select: { full_name: true, role: true } },
      },
    });

    return {
      ...check,
      id: check.id.toString(),
      lookupResults: lookup.lookupResults,
    };
  }

  /**
   * Submit drug test result for an enforcement check.
   */
  static async submitTestResult(checkId: string, testResult: string, consumptionType?: string) {
    if (!['POSITIVE', 'NEGATIVE'].includes(testResult)) {
      throw new ValidationError('testResult must be POSITIVE or NEGATIVE');
    }

    const check = await prisma.enforcement_checks.findUnique({ where: { id: BigInt(checkId) } });
    if (!check) throw new NotFoundError('Enforcement check not found');
    if (check.status !== 'FIELD_CREATED') {
      throw new ValidationError('Test result can only be submitted for FIELD_CREATED checks');
    }

    const updateData: any = {
      test_result: testResult,
      updated_at: new Date(),
    };

    if (testResult === 'NEGATIVE') {
      updateData.status = 'NEGATIVE_CLOSED';
    } else {
      updateData.status = 'PENDING_SHO_REVIEW';
      updateData.consumption_type = consumptionType || null;
    }

    const updated = await prisma.enforcement_checks.update({
      where: { id: BigInt(checkId) },
      data: updateData,
      include: {
        police_station: { select: { name: true } },
        officer: { select: { full_name: true } },
      },
    });

    return updated;
  }
}
