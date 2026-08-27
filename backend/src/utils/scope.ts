/**
 * GARUDA — Extensible Scope Strategy (OCP)
 *
 * Implements the Strategy pattern for row-level authorization scoping.
 * New roles or jurisdiction levels can be added by registering a new `ScopeStrategy`
 * without modifying existing getter functions (Open/Closed Principle).
 */

export interface ScopeUser {
  userId: number | string;
  role: string;
  department?: string | null;
  policeStationId?: number | string | null;
  district?: string | null;
  divisionId?: string | null;
}

export type ScopeEntity = 'case' | 'offender' | 'enforcement';

export interface ScopeStrategy {
  /** Check if this strategy applies to the given user context. */
  appliesTo(user: ScopeUser): boolean;

  /** Build the Prisma `where` filter for a domain entity. */
  buildWhere(user: ScopeUser, entity: ScopeEntity): Record<string, any>;

  /** Determine if this strategy is station-level or district-level for dashboard KPI aggregation. */
  isStationLevel(user: ScopeUser): boolean;
}

// ── Strategy Implementations ──────────────────────────────────────────

/** District-level strategy (SP, ASP, CYBER_ANALYTICS). */
class DistrictScopeStrategy implements ScopeStrategy {
  appliesTo(user: ScopeUser): boolean {
    return user.role === 'SP' || user.role === 'ASP' || user.department === 'CYBER_ANALYTICS';
  }

  buildWhere(user: ScopeUser, entity: ScopeEntity): Record<string, any> {
    if (user.district) {
      if (entity === 'enforcement') {
        return { police_station: { district: user.district } };
      }
      return { police_stations: { district: user.district } };
    }
    return {};
  }

  isStationLevel(): boolean {
    return false;
  }
}

/** Subdivision-level strategy (SDPO / DSP). */
class SubdivisionScopeStrategy implements ScopeStrategy {
  appliesTo(user: ScopeUser): boolean {
    return user.role === 'SDPO' || user.role === 'DSP';
  }

  buildWhere(user: ScopeUser, entity: ScopeEntity): Record<string, any> {
    if (user.divisionId) {
      if (entity === 'enforcement') {
        return { police_station: { sdpo: user.divisionId } };
      }
      return { police_stations: { sdpo: user.divisionId } };
    }
    if (user.district) {
      if (entity === 'enforcement') {
        return { police_station: { district: user.district } };
      }
      return { police_stations: { district: user.district } };
    }
    // Fallback: If no division or district is assigned, scope to default district
    if (entity === 'enforcement') {
      return { police_station: { district: 'Tirupati' } };
    }
    return { police_stations: { district: 'Tirupati' } };
  }

  isStationLevel(): boolean {
    return false;
  }
}

/** Police Station-level strategy (SHO, Constable). */
class StationScopeStrategy implements ScopeStrategy {
  appliesTo(user: ScopeUser): boolean {
    return !!user.policeStationId;
  }

  buildWhere(user: ScopeUser, entity: ScopeEntity): Record<string, any> {
    // Allow viewing all cases/offenders across police stations as per cross-PS requirement
    return {};
  }

  isStationLevel(): boolean {
    return true;
  }
}

/** Fallback strategy for unauthenticated/unscoped context. */
class DefaultScopeStrategy implements ScopeStrategy {
  appliesTo(): boolean {
    return true; // Catch-all fallback
  }

  buildWhere(): Record<string, any> {
    return { id: BigInt(-1) }; // Restrictive default query
  }

  isStationLevel(): boolean {
    return true;
  }
}

// ── Strategy Registry (Priority Order) ────────────────────────────────

const STRATEGY_REGISTRY: ScopeStrategy[] = [
  new DistrictScopeStrategy(),
  new SubdivisionScopeStrategy(),
  new StationScopeStrategy(),
  new DefaultScopeStrategy(),
];

/** Resolve the appropriate strategy for a user. */
function resolveStrategy(user: ScopeUser): ScopeStrategy {
  if (!user || !user.role) return new DefaultScopeStrategy();
  return STRATEGY_REGISTRY.find((s) => s.appliesTo(user)) || new DefaultScopeStrategy();
}

// ── Public API (Preserves backwards compatibility) ─────────────────────

/** Returns a Prisma `where` clause scoping cases. */
export function getCaseWhere(user: ScopeUser): Record<string, any> {
  return resolveStrategy(user).buildWhere(user, 'case');
}

/** Returns a Prisma `where` clause scoping offenders. */
export function getOffenderWhere(user: ScopeUser): Record<string, any> {
  return resolveStrategy(user).buildWhere(user, 'offender');
}

/** Returns a Prisma `where` clause scoping enforcement checks. */
export function getEnforcementWhere(user: ScopeUser): Record<string, any> {
  return resolveStrategy(user).buildWhere(user, 'enforcement');
}

/** Returns a Prisma `where` clause and station-level flag for dashboard metrics. */
export function getDashboardScope(user: ScopeUser): { psFilter: Record<string, any>; isStationLevel: boolean } {
  const strategy = resolveStrategy(user);
  const isStation = strategy.isStationLevel(user);
  if (isStation && user.policeStationId) {
    return {
      psFilter: { ps_id: BigInt(user.policeStationId) },
      isStationLevel: true,
    };
  }
  return {
    psFilter: strategy.buildWhere(user, 'case'),
    isStationLevel: isStation,
  };
}
