/**
 * GARUDA — Cases Domain Service
 *
 * Encapsulates case creation, updates, querying, file path transformations,
 * and scope enforcement for NDPS cases.
 */
import prisma from '../config/prisma';
import { ScopeUser, getCaseWhere } from '../utils/scope';
import { ValidationError, NotFoundError } from '../utils/error-handler';
import { isValidText, isValidSectionOfLaw, isValidNumeric } from '../utils/validators';

export function toPhysicalPaths(relevantFilesStr: string | null | undefined): string | null {
  if (!relevantFilesStr) return null;
  try {
    const files = JSON.parse(relevantFilesStr);
    if (Array.isArray(files)) {
      const mapped = files.map((f: any) => {
        if (f.url && f.url.startsWith('/api/uploads/')) {
          return { ...f, url: `uploads/${f.url.substring('/api/uploads/'.length)}` };
        }
        return f;
      });
      return JSON.stringify(mapped);
    }
  } catch (e) {
    return relevantFilesStr
      .split(',')
      .map((url) => {
        if (url.startsWith('/api/uploads/')) {
          return `uploads/${url.substring('/api/uploads/'.length)}`;
        }
        return url;
      })
      .join(',');
  }
  return relevantFilesStr;
}

export function toWebUrls(relevantFilesStr: string | null | undefined): string | null {
  if (!relevantFilesStr) return null;
  try {
    const files = JSON.parse(relevantFilesStr);
    if (Array.isArray(files)) {
      const mapped = files.map((f: any) => {
        if (f.url && f.url.startsWith('uploads/')) {
          return { ...f, url: `/api/uploads/${f.url.substring('uploads/'.length)}` };
        }
        return f;
      });
      return JSON.stringify(mapped);
    }
  } catch (e) {
    return relevantFilesStr
      .split(',')
      .map((path) => {
        if (path.startsWith('uploads/')) {
          return `/api/uploads/${path.substring('uploads/'.length)}`;
        }
        return path;
      })
      .join(',');
  }
  return relevantFilesStr;
}

export class CasesService {
  /** Validate case input payload. */
  static validateCasePayload(data: any) {
    if (data.firNo && !isValidText(data.firNo)) {
      throw new ValidationError('FIR Number contains invalid special characters');
    }
    if (data.sectionOfLaw && !isValidSectionOfLaw(data.sectionOfLaw)) {
      throw new ValidationError('Section of Law contains invalid characters');
    }
    if (data.quantity && !/^\d*\.?\d*$/.test(String(data.quantity))) {
      throw new ValidationError('Quantity must be a valid number');
    }
    if (data.streetValue && !isValidNumeric(data.streetValue)) {
      throw new ValidationError('Street Value must be a valid number');
    }
    if (data.sourceLocation && !isValidText(data.sourceLocation)) {
      throw new ValidationError('Source Location contains invalid special characters');
    }
    if (data.destinationLocation && !isValidText(data.destinationLocation)) {
      throw new ValidationError('Destination Location contains invalid special characters');
    }
  }

  /** Get cases with pagination and scope filtering. */
  static async getCases(user: ScopeUser, page = 0, size = 30, stage?: string, search?: string) {
    const skip = Number(page) * Number(size);
    const scope = getCaseWhere(user) as any;

    if (stage) scope.stage = String(stage);
    if (search) {
      scope.OR = [
        { fir_no: { contains: String(search), mode: 'insensitive' } },
        { section_of_law: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const countScope = getCaseWhere(user) as any;
    if (search) {
      countScope.OR = [
        { fir_no: { contains: String(search), mode: 'insensitive' } },
        { section_of_law: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const [totalElements, cases] = await Promise.all([
      prisma.cases.count({ where: countScope }),
      prisma.cases.findMany({
        where: scope,
        skip,
        take: Number(size),
        orderBy: { created_at: 'desc' },
        include: {
          police_stations: { select: { name: true, ps_code: true } },
          case_accused: {
            include: {
              offenders: {
                select: {
                  id: true,
                  full_name: true,
                  category: true,
                  status: true,
                  offender_identity_docs: { select: { aadhaar_no: true } },
                },
              },
            },
          },
          seizures: true,
          seized_vehicles: true,
          charge_sheets: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalElements / Number(size));
    return { cases, totalElements, totalPages, page: Number(page), size: Number(size) };
  }

  /** Get a single case by ID with full details. */
  static async getCaseById(id: bigint, user: ScopeUser) {
    const scope = getCaseWhere(user);
    const caseItem = await prisma.cases.findFirst({
      where: { id, ...scope },
      include: {
        police_stations: { select: { name: true, ps_code: true } },
        case_accused: {
          include: {
            offenders: {
              select: {
                id: true,
                full_name: true,
                category: true,
                status: true,
                offender_identity_docs: { select: { aadhaar_no: true } },
              },
            },
          },
        },
        seizures: true,
        seized_vehicles: true,
        charge_sheets: true,
        court_hearings: { orderBy: { created_at: 'desc' as const } },
        bail_records: { orderBy: { created_at: 'desc' as const } },
      },
    });

    if (!caseItem) throw new NotFoundError('Case not found or access denied');
    return caseItem;
  }
}
