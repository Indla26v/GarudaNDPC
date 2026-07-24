/**
 * GARUDA — Password Policy Validator
 * 
 * Enforces standard password complexity rules:
 *  - Min 10 characters, Max 18 characters
 *  - At least 1 uppercase letter (A-Z)
 *  - At least 1 lowercase letter (a-z)
 *  - At least 1 digit (0-9)
 *  - At least 1 special character
 *  - No spaces allowed
 */

export interface PasswordPolicyResult {
  valid: boolean;
  violations: string[];
}

const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?\/\\`~]/;

export function validatePassword(password: string): PasswordPolicyResult {
  const violations: string[] = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, violations: ['Password is required'] };
  }

  if (password.length < 10) {
    violations.push('Password must be at least 10 characters long');
  }

  if (password.length > 18) {
    violations.push('Password must not exceed 18 characters');
  }

  if (!/[A-Z]/.test(password)) {
    violations.push('Password must contain at least one uppercase letter (A-Z)');
  }

  if (!/[a-z]/.test(password)) {
    violations.push('Password must contain at least one lowercase letter (a-z)');
  }

  if (!/[0-9]/.test(password)) {
    violations.push('Password must contain at least one digit (0-9)');
  }

  if (!SPECIAL_CHARS.test(password)) {
    violations.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~)');
  }

  if (/\s/.test(password)) {
    violations.push('Password must not contain spaces');
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}
