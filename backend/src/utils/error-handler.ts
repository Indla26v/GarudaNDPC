/**
 * GARUDA — Centralized Controller Error Handler
 *
 * Replaces the repeated try/catch pattern across all 22 controllers:
 *   catch (error) { console.error('...', error); res.status(500).json({ message: '...' }); }
 *
 * Custom error classes allow services to throw domain-specific errors
 * that map to appropriate HTTP status codes.
 */
import { Response } from 'express';

// ── Domain Error Classes ───────────────────────────────────────────────

/** Thrown when input validation fails (→ 400). */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** Thrown when a requested resource is not found (→ 404). */
export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** Thrown when the user lacks permission for the operation (→ 403). */
export class ForbiddenError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/** Thrown when a business rule is violated (→ 409). */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

// ── Handler ────────────────────────────────────────────────────────────

/**
 * Maps caught errors to appropriate HTTP responses.
 * Usage in controllers:
 *   catch (error) { handleControllerError(res, error, 'createCase'); }
 */
export function handleControllerError(
  res: Response,
  error: unknown,
  context: string
): void {
  if (error instanceof ValidationError) {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error instanceof NotFoundError) {
    res.status(404).json({ message: error.message });
    return;
  }
  if (error instanceof ForbiddenError) {
    res.status(403).json({ message: error.message });
    return;
  }
  if (error instanceof ConflictError) {
    res.status(409).json({ message: error.message });
    return;
  }

  console.error(`${context} error:`, error);
  res.status(500).json({ message: 'Server error' });
}
