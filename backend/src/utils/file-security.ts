/**
 * GARUDA — File Security Utilities
 *
 * Centralized magic-bytes validation and zip-bomb / decompression-bomb
 * protection for all uploaded Excel, CSV, and PDF files.
 *
 * Usage:
 *   import { validateMagicBytes, guardZipBomb } from '../utils/file-security';
 */
import * as XLSX from 'xlsx';

/* ───────────────────────── Magic Bytes ────────────────────────── */

/**
 * Known file signatures (magic bytes) keyed by lowercase extension.
 *
 * Sources:
 *   - XLSX/DOCX/PPTX → ZIP container: 50 4B 03 04
 *   - XLS (BIFF)     → OLE2:          D0 CF 11 E0 A1 B1 1A E1
 *   - PDF            → %PDF:          25 50 44 46
 *   - CSV / TXT      → no fixed sig — validated as UTF-8 text instead
 */
interface Signature {
  bytes: number[];
  offset: number;
}

const FILE_SIGNATURES: Record<string, Signature[]> = {
  xlsx: [{ bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 }],          // ZIP (OOXML)
  xls:  [
    { bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], offset: 0 },  // OLE2
    { bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 },                            // Also accept ZIP (some .xls are OOXML)
  ],
  pdf:  [{ bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 }],          // %PDF
};

/**
 * Macro-enabled Office formats that must always be rejected.
 * These can contain VBA macros that execute arbitrary code on the
 * recipient's machine when the file is opened.
 */
const BLOCKED_EXTENSIONS = new Set([
  '.xlsm', '.xlsb', '.xltm', '.xla', '.xlam',  // Excel macro formats
  '.docm', '.dotm',                              // Word macro formats
  '.pptm', '.potm', '.ppam', '.ppsm',            // PowerPoint macro formats
]);

export interface MagicBytesResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate that the file buffer's actual content matches the claimed extension.
 *
 * @param buffer   Raw file buffer (from multer memoryStorage)
 * @param filename Original filename (for extension detection)
 * @returns        `{ valid: true }` or `{ valid: false, reason: '...' }`
 */
export function validateMagicBytes(buffer: Buffer, filename: string): MagicBytesResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, reason: 'File is empty.' };
  }

  const ext = (filename.split('.').pop() || '').toLowerCase();

  // ── Block macro-enabled formats regardless of content ──
  if (BLOCKED_EXTENSIONS.has(`.${ext}`)) {
    return { valid: false, reason: `Macro-enabled file format (.${ext}) is not allowed.` };
  }

  // ── CSV / TXT: no magic bytes — just verify it's plausible UTF-8 text ──
  if (ext === 'csv' || ext === 'txt') {
    // Check for null bytes which indicate a binary file disguised as text
    const sampleSize = Math.min(buffer.length, 8192);
    for (let i = 0; i < sampleSize; i++) {
      if (buffer[i] === 0x00) {
        return { valid: false, reason: 'File contains binary content but claims to be CSV/text.' };
      }
    }
    return { valid: true };
  }

  // ── Known binary formats: check magic bytes ──
  const signatures = FILE_SIGNATURES[ext];
  if (!signatures) {
    // Unknown extension — we don't have a signature to check against.
    // Let the downstream MIME / extension filter handle it.
    return { valid: true };
  }

  const matches = signatures.some((sig) =>
    sig.bytes.every((byte, i) => buffer[sig.offset + i] === byte)
  );

  if (!matches) {
    return {
      valid: false,
      reason: `File content does not match the expected .${ext} format. The file may be corrupted or misnamed.`,
    };
  }

  return { valid: true };
}

/* ────────────────────── Zip Bomb / Decompression Bomb ────────────────────── */

/**
 * Limits for zip-bomb / decompression-bomb protection.
 * These are intentionally generous for legitimate police data files
 * while still blocking malicious payloads.
 */
export const SHEET_LIMITS = {
  /** Maximum number of cells (rows × columns) in a single sheet. */
  MAX_CELLS:   500_000,
  /** Maximum number of data rows (after header detection). */
  MAX_ROWS:    50_000,
  /** Maximum number of columns. */
  MAX_COLUMNS: 200,
  /** Maximum ratio of decompressed size to compressed size. */
  MAX_COMPRESSION_RATIO: 100,
} as const;

export interface ZipBombResult {
  safe: boolean;
  reason?: string;
  stats?: {
    rows: number;
    columns: number;
    cells: number;
    compressionRatio: number | null;
  };
}

/**
 * Guard against zip-bomb / decompression-bomb attacks on XLSX files.
 *
 * Call this **after** `XLSX.read()` but **before** doing any row-level
 * processing.  The function examines the decoded workbook's first sheet
 * dimensions and (optionally) the compression ratio.
 *
 * @param wb             Parsed XLSX workbook
 * @param compressedSize Size in bytes of the original uploaded file (for ratio check)
 * @returns              `{ safe: true }` or `{ safe: false, reason: '...' }`
 */
export function guardZipBomb(wb: XLSX.WorkBook, compressedSize?: number): ZipBombResult {
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return { safe: true, stats: { rows: 0, columns: 0, cells: 0, compressionRatio: null } };
  }

  const sheet = wb.Sheets[sheetName];
  if (!sheet || !sheet['!ref']) {
    return { safe: true, stats: { rows: 0, columns: 0, cells: 0, compressionRatio: null } };
  }

  const range = XLSX.utils.decode_range(sheet['!ref']);
  const rows = range.e.r - range.s.r + 1;
  const columns = range.e.c - range.s.c + 1;
  const cells = rows * columns;

  // ── Compression ratio check (XLSX = ZIP container) ──
  let compressionRatio: number | null = null;
  if (compressedSize && compressedSize > 0) {
    // Estimate decompressed size from cell count (rough: ~20 bytes per cell average)
    const estimatedDecompressed = cells * 20;
    compressionRatio = estimatedDecompressed / compressedSize;
  }

  const stats = { rows, columns, cells, compressionRatio };

  if (cells > SHEET_LIMITS.MAX_CELLS) {
    return {
      safe: false,
      reason: `Sheet contains ${cells.toLocaleString()} cells (${rows.toLocaleString()} rows × ${columns} columns), exceeding the maximum of ${SHEET_LIMITS.MAX_CELLS.toLocaleString()} cells. This may indicate a decompression bomb.`,
      stats,
    };
  }

  if (rows > SHEET_LIMITS.MAX_ROWS) {
    return {
      safe: false,
      reason: `Sheet contains ${rows.toLocaleString()} rows, exceeding the maximum of ${SHEET_LIMITS.MAX_ROWS.toLocaleString()} rows.`,
      stats,
    };
  }

  if (columns > SHEET_LIMITS.MAX_COLUMNS) {
    return {
      safe: false,
      reason: `Sheet contains ${columns} columns, exceeding the maximum of ${SHEET_LIMITS.MAX_COLUMNS}.`,
      stats,
    };
  }

  if (compressionRatio !== null && compressionRatio > SHEET_LIMITS.MAX_COMPRESSION_RATIO) {
    return {
      safe: false,
      reason: `Suspicious compression ratio (${compressionRatio.toFixed(1)}x). This may indicate a zip bomb.`,
      stats,
    };
  }

  return { safe: true, stats };
}
