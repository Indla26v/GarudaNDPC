/**
 * GARUDA — Dashboard Domain Service
 *
 * Encapsulates aggregated KPI query logic and caching for command dashboard.
 */
import prisma from '../config/prisma';
import { getDashboardScope, ScopeUser } from '../utils/scope';

interface CacheEntry {
  data: any;
  expiry: number;
}
const dashboardCache = new Map<string, CacheEntry>();
const CACHE_TTL_SECONDS = 30;

export class DashboardService {
  /** Fetch dashboard KPIs with in-memory TTL caching. */
  static async getSummary(user: ScopeUser, timeRange = 'all', forceBypass = false) {
    const { psFilter, isStationLevel } = getDashboardScope(user);

    let dateFilter: { gte?: Date } | undefined = undefined;
    if (timeRange !== 'all') {
      const d = new Date();
      if (timeRange === 'weekly') d.setDate(d.getDate() - 7);
      else if (timeRange === 'monthly') d.setMonth(d.getMonth() - 1);
      else if (timeRange === 'yearly') d.setFullYear(d.getFullYear() - 1);
      dateFilter = { gte: d };
    }

    const psIdStr = psFilter.ps_id ? psFilter.ps_id.toString() : 'all';
    const cacheKey = `summary_${isStationLevel ? 'station' : 'district'}_${psIdStr}_${timeRange}`;

    if (!forceBypass) {
      const cached = dashboardCache.get(cacheKey);
      if (cached && Date.now() < cached.expiry) {
        return cached.data;
      }
    }

    const caseWhere: any = { ...psFilter };
    const offenderWhere: any = { ...psFilter };
    const caseAccusedWhere: any = psFilter.ps_id
      ? { cases: { ps_id: psFilter.ps_id } }
      : psFilter.police_stations
      ? { cases: { police_stations: psFilter.police_stations } }
      : {};
    const seizureWhere: any = psFilter.ps_id
      ? { cases: { ps_id: psFilter.ps_id } }
      : psFilter.police_stations
      ? { cases: { police_stations: psFilter.police_stations } }
      : {};

    if (dateFilter) {
      caseWhere.created_at = dateFilter;
      offenderWhere.created_at = dateFilter;
      caseAccusedWhere.created_at = dateFilter;
      seizureWhere.created_at = dateFilter;
    }

    const [totalCases, totalOffenders, totalArrests, seizures] = await Promise.all([
      prisma.cases.count({ where: caseWhere }),
      prisma.offenders.count({ where: offenderWhere }),
      prisma.case_accused.count({ where: caseAccusedWhere }),
      prisma.seizures.findMany({ where: seizureWhere, select: { contraband_kg: true, cash_amount: true } }),
    ]);

    let totalContrabandKg = 0;
    let totalCashAmount = 0;
    for (const s of seizures) {
      if (s.contraband_kg) totalContrabandKg += Number(s.contraband_kg);
      if (s.cash_amount) totalCashAmount += Number(s.cash_amount);
    }

    const data = {
      totalCases,
      totalOffenders,
      totalArrests,
      totalContrabandKg: Math.round(totalContrabandKg * 100) / 100,
      totalCashAmount: Math.round(totalCashAmount),
      isStationLevel,
    };

    dashboardCache.set(cacheKey, { data, expiry: Date.now() + CACHE_TTL_SECONDS * 1000 });
    return data;
  }
}
