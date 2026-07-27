/**
 * GARUDA — Offenders Domain Service
 *
 * Encapsulates offender creation, updates, government ID generation,
 * scoped search, and identity document management.
 */
import prisma from '../config/prisma';
import { ScopeUser, getOffenderWhere } from '../utils/scope';
import { ValidationError, NotFoundError } from '../utils/error-handler';
import { validateAadhaar, isValidText, isValidPan, isValidIfsc, isValidUpiId, isValidNumeric, isValidPhone, isValidEmail } from '../utils/validators';
import { getStateCode, getDistrictNumber } from '../config/constants';

export class OffendersService {
  /** Generate a standardized Government ID for offenders (e.g., AP-39-OFF-2026-0001). */
  static async generateGovId(stateName?: string, districtName?: string): Promise<string> {
    const stateCode = getStateCode(stateName || '') || 'AP';
    const districtCode = getDistrictNumber(districtName || '') || '39';
    const currentYear = new Date().getFullYear();
    const prefix = `${stateCode}-${districtCode}-OFF-${currentYear}-`;

    const latest = await prisma.offenders.findFirst({
      where: { gov_id: { startsWith: prefix } },
      orderBy: { gov_id: 'desc' },
      select: { gov_id: true },
    });

    let nextNumber = 1;
    if (latest && latest.gov_id) {
      const parts = latest.gov_id.split('-');
      const lastSeqStr = parts[parts.length - 1];
      if (lastSeqStr && !isNaN(parseInt(lastSeqStr, 10))) {
        nextNumber = parseInt(lastSeqStr, 10) + 1;
      }
    }

    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }

  /** Get paginated list of offenders. */
  static async getOffenders(user: ScopeUser, query?: string, psId?: string, category?: string, page = 0, size = 10) {
    let whereClause: any = { ...getOffenderWhere(user) };
    if (psId) {
      whereClause.ps_id = BigInt(psId);
    }
    if (category) {
      whereClause.category = category as any;
    }
    if (query) {
      const q = String(query);
      whereClause.OR = [
        { full_name: { contains: q, mode: 'insensitive' } },
        { alias: { contains: q, mode: 'insensitive' } },
        {
          offender_identity_docs: {
            some: {
              OR: [
                { aadhaar_no: { contains: q, mode: 'insensitive' } },
                { voter_id: { contains: q, mode: 'insensitive' } },
                { pan_card: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
        },
        { offender_contacts: { some: { value: { contains: q, mode: 'insensitive' } } } },
        { case_accused: { some: { cases: { fir_no: { contains: q, mode: 'insensitive' } } } } },
      ];
    }

    const skip = Number(page) * Number(size);

    const [totalElements, offenders] = await Promise.all([
      prisma.offenders.count({ where: whereClause }),
      prisma.offenders.findMany({
        where: whereClause,
        skip,
        take: Number(size),
        orderBy: { created_at: 'desc' },
        include: {
          police_stations: { select: { name: true, ps_code: true } },
          offender_identity_docs: true,
          offender_contacts: true,
          offender_financials: true,
          case_accused: { include: { cases: { select: { fir_no: true, stage: true } } } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalElements / Number(size));
    return { offenders, totalElements, totalPages, page: Number(page), size: Number(size) };
  }

  /** Get offender by ID. */
  static async getOffenderById(id: bigint, user: ScopeUser) {
    const scope = getOffenderWhere(user);
    const offender = await prisma.offenders.findFirst({
      where: { id, ...scope },
      include: {
        police_stations: { select: { name: true, ps_code: true } },
        offender_identity_docs: true,
        offender_contacts: true,
        offender_financials: true,
        offender_associates: true,
        case_accused: { include: { cases: true } },
      },
    });

    if (!offender) throw new NotFoundError('Offender not found or access denied');
    return offender;
  }
}
