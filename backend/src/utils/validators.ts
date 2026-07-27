/**
 * GARUDA — Shared Input Validators
 *
 * Consolidated validation helpers used across controllers.
 * Previously duplicated in cases.controller.ts and offenders.controller.ts.
 */

/** Alphanumeric text with basic punctuation (spaces, commas, periods, hyphens, slashes). */
export const isValidText = (val: any): boolean => !val || /^[a-zA-Z0-9\s.,/-]*$/.test(String(val));

/** Section of law references (adds parentheses to the valid set). */
export const isValidSectionOfLaw = (val: any): boolean => !val || /^[a-zA-Z0-9\s()./,-]*$/.test(String(val));

/** Numeric-only string (or empty/null). */
export const isValidNumeric = (val: any): boolean => {
  if (val === undefined || val === null || val === '') return true;
  return /^\d*$/.test(String(val));
};

/** PAN format: exactly 10 alphanumeric characters. */
export const isValidPan = (val: any): boolean => !val || /^[a-zA-Z0-9]{10}$/.test(String(val));

/** IFSC format: exactly 11 alphanumeric characters. */
export const isValidIfsc = (val: any): boolean => !val || /^[a-zA-Z0-9]{11}$/.test(String(val));

/** UPI ID: alphanumeric with @, dots, underscores, hyphens. */
export const isValidUpiId = (val: any): boolean => !val || /^[a-zA-Z0-9@._-]*$/.test(String(val));

/** Phone number: optional +, digits, spaces, hyphens. */
export const isValidPhone = (val: any): boolean => !val || /^\+?[0-9\s-]*$/.test(String(val));

/** Basic email validation. */
export const isValidEmail = (val: any): boolean => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val));

/**
 * Validate Aadhaar number.
 * Returns null if valid, or an error message string if invalid.
 * Accepts both raw 12-digit and masked (X/x/*) formats.
 */
export const validateAadhaar = (val: any): string | null => {
  if (!val) return null;
  const s = String(val).trim();
  const isMasked = s.includes('X') || s.includes('x') || s.includes('*');
  if (isMasked) {
    const cleanMasked = s.replace(/[^a-zA-Z0-9*]/g, '');
    if (cleanMasked.length !== 12) {
      return 'Aadhaar must be exactly 12 digits';
    }
  } else {
    if (!/^\d{12}$/.test(s)) {
      return 'Aadhaar must be exactly 12 digits and contain only numbers';
    }
  }
  return null;
};
