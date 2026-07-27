/**
 * GARUDA — Shared Domain Constants
 *
 * Consolidated lookup tables used across controllers.
 * Previously duplicated in enforcement.controller.ts, offenders.controller.ts,
 * and import.controller.ts.
 */

/** Indian state name → 2-letter code mapping (case-insensitive input keys). */
export const STATE_CODES: Record<string, string> = {
  'andhra pradesh': 'AP',
  'ap': 'AP',
  'kerala': 'KL',
  'kl': 'KL',
  'karnataka': 'KA',
  'ka': 'KA',
  'telangana': 'TS',
  'ts': 'TS',
};

/** District name → numeric code mapping (for government ID generation). */
export const DISTRICT_NUMBERS: Record<string, string> = {
  'tirupati': '39',
  'chittoor': '03',
};

/**
 * Look up a state code from a raw state name.
 * Returns the 2-letter code or undefined if not found.
 */
export function getStateCode(rawState: string): string | undefined {
  return STATE_CODES[rawState.toLowerCase().trim()];
}

/**
 * Look up a district number from a raw district name.
 * Returns the numeric code or undefined if not found.
 */
export function getDistrictNumber(rawDistrict: string): string | undefined {
  return DISTRICT_NUMBERS[rawDistrict.toLowerCase().trim()];
}
