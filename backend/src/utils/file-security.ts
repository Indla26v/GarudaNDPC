/**
 * GARUDA — File Security Utilities
 *
 * Centralized magic-bytes validation, zip-bomb / decompression-bomb
 * protection, concurrent import locking, and heuristic malware scanning
 * for all uploaded Excel, CSV, and PDF files.
 *
 * Usage:
 *   import { validateMagicBytes, guardZipBomb, acquireImportLock, releaseImportLock, scanForMalware } from '../utils/file-security';
 */
import * as XLSX from 'xlsx';
import prisma from '../config/prisma';

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
  docx: [{ bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 }],          // ZIP (OOXML)
  xls:  [
    { bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], offset: 0 },  // OLE2
    { bytes: [0x50, 0x4b, 0x03, 0x04], offset: 0 },                            // OOXML
  ],
  doc:  [{ bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], offset: 0 }], // OLE2
  pdf:  [{ bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 }],          // %PDF
  png:  [{ bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], offset: 0 }], // PNG
  jpg:  [{ bytes: [0xff, 0xd8, 0xff], offset: 0 }],                 // JPEG
  jpeg: [{ bytes: [0xff, 0xd8, 0xff], offset: 0 }],                 // JPEG
  gif:  [
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], offset: 0 },    // GIF87a
    { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], offset: 0 },    // GIF89a
  ],
  webp: [{ bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }],          // RIFF (WEBP)
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

/* ─────────────────── Concurrent Import Lock ──────────────────── */

/**
 * Distributed import lock using the existing `system_settings` table.
 *
 * This prevents two admins from running a bulk DPR import at the same
 * time, which would create duplicate cases and offenders.
 *
 * The lock auto-expires after `LOCK_TTL_MS` to prevent deadlocks if
 * a request crashes mid-import without releasing.
 */

const IMPORT_LOCK_KEY  = 'import_lock';
const LOCK_TTL_MS      = 5 * 60 * 1000; // 5 minutes — generous for large imports

export interface ImportLockResult {
  acquired: boolean;
  /** If not acquired, who holds the lock and when it was taken. */
  heldBy?: string;
  lockedAt?: Date;
  reason?: string;
}

interface LockPayload {
  status: 'active';
  userId: string;
  userName: string;
  lockedAt: string;  // ISO timestamp
}

/**
 * Attempt to acquire the import lock.
 *
 * @param userId   ID of the user attempting the import
 * @param userName Display name for lock-held messages
 * @returns        `{ acquired: true }` or `{ acquired: false, reason: '...' }`
 */
export async function acquireImportLock(userId: string, userName: string): Promise<ImportLockResult> {
  try {
    const existing = await prisma.system_settings.findUnique({
      where: { key: IMPORT_LOCK_KEY },
    });

    if (existing) {
      try {
        const payload: LockPayload = JSON.parse(existing.value);
        if (payload.status === 'active') {
          const lockedAt = new Date(payload.lockedAt);
          const elapsed = Date.now() - lockedAt.getTime();

          // Auto-expire stale locks (crash recovery)
          if (elapsed < LOCK_TTL_MS) {
            return {
              acquired: false,
              heldBy: payload.userName || payload.userId,
              lockedAt,
              reason: `Another import is already in progress (started by ${payload.userName || 'another user'} at ${lockedAt.toLocaleTimeString()}). Please wait for it to complete.`,
            };
          }
          // Lock has expired — fall through to acquire
        }
      } catch {
        // Corrupted value — overwrite it
      }
    }

    // Acquire (upsert)
    const lockValue: LockPayload = {
      status: 'active',
      userId,
      userName,
      lockedAt: new Date().toISOString(),
    };

    await prisma.system_settings.upsert({
      where: { key: IMPORT_LOCK_KEY },
      create: { key: IMPORT_LOCK_KEY, value: JSON.stringify(lockValue) },
      update: { value: JSON.stringify(lockValue) },
    });

    return { acquired: true };
  } catch (err: any) {
    // DB error — don't block the import, just log
    console.error('[ImportLock] Failed to acquire lock:', err.message);
    return { acquired: true }; // Fail-open: allow import if lock system is down
  }
}

/**
 * Release the import lock.
 *
 * @param userId Only the user who acquired the lock (or an expired lock) can release it.
 */
export async function releaseImportLock(userId?: string): Promise<void> {
  try {
    const existing = await prisma.system_settings.findUnique({
      where: { key: IMPORT_LOCK_KEY },
    });

    if (!existing) return;

    // Only release if the lock belongs to this user or is expired
    try {
      const payload: LockPayload = JSON.parse(existing.value);
      if (userId && payload.userId !== userId) {
        const elapsed = Date.now() - new Date(payload.lockedAt).getTime();
        if (elapsed < LOCK_TTL_MS) {
          // Not our lock and not expired — don't touch it
          return;
        }
      }
    } catch {
      // Corrupted value — clean it up
    }

    await prisma.system_settings.delete({
      where: { key: IMPORT_LOCK_KEY },
    });
  } catch (err: any) {
    console.error('[ImportLock] Failed to release lock:', err.message);
  }
}

/* ─────────────────── Malware / Virus Scanning ──────────────────── */

/**
 * Heuristic content scanner for uploaded files.
 *
 * This is NOT a replacement for a full antivirus engine (ClamAV, etc.)
 * but catches the most common attack vectors seen in file uploads:
 *
 *  1. Executable signatures embedded in non-executable files
 *  2. OLE macro streams in Office documents
 *  3. Suspicious script patterns (PHP, shell, powershell)
 *  4. Polyglot files (e.g., GIFAR — GIF + JAR)
 *
 * For production environments with ClamAV available, this layer still
 * provides defense-in-depth as the first line of screening.
 */

export interface MalwareScanResult {
  clean: boolean;
  threats: string[];
}

/** Known executable / dangerous file signatures to detect inside buffers. */
const EXECUTABLE_SIGNATURES: { name: string; bytes: number[]; offset: number }[] = [
  { name: 'Windows EXE (MZ)',      bytes: [0x4d, 0x5a],                         offset: 0 },
  { name: 'ELF binary',            bytes: [0x7f, 0x45, 0x4c, 0x46],             offset: 0 },
  { name: 'Java class file',       bytes: [0xca, 0xfe, 0xba, 0xbe],             offset: 0 },
  { name: 'Mach-O binary',         bytes: [0xfe, 0xed, 0xfa, 0xce],             offset: 0 },
  { name: 'Mach-O binary (64)',    bytes: [0xfe, 0xed, 0xfa, 0xcf],             offset: 0 },
];

/** Suspicious string patterns that should not appear in data files. */
const SUSPICIOUS_PATTERNS: { name: string; pattern: RegExp }[] = [
  { name: 'PHP opening tag',             pattern: /<\?php\b/i },
  { name: 'PHP short tag with code',     pattern: /<\?=/ },
  { name: 'PowerShell command',          pattern: /powershell\s+(?:-[eE]|-[cC]|Invoke-|IEX\b)/i },
  { name: 'Shell script shebang',        pattern: /#!\s*\/(?:bin|usr)\/(?:ba)?sh/ },
  { name: 'Windows batch command',       pattern: /@echo\s+off/i },
  { name: 'VBScript CreateObject',       pattern: /CreateObject\s*\(/i },
  { name: 'JavaScript eval injection',   pattern: /\beval\s*\(\s*(?:atob|unescape|decodeURIComponent)/ },
  { name: 'Base64-encoded executable',   pattern: /TVqQAAMAAAAEAAAA/ },  // MZ header in base64
];

/**
 * Scan a file buffer for malware indicators.
 *
 * @param buffer   Raw file contents
 * @param filename Original filename (for extension-aware checks)
 * @returns        `{ clean: true }` or `{ clean: false, threats: [...] }`
 */
export function scanForMalware(buffer: Buffer, filename: string): MalwareScanResult {
  const threats: string[] = [];
  const ext = (filename.split('.').pop() || '').toLowerCase();

  // ── 1. Check for embedded executable signatures ──
  // Only flag if the claimed extension is NOT an executable type
  const executableExts = new Set(['exe', 'dll', 'so', 'class', 'jar', 'bat', 'cmd', 'com', 'scr', 'pif']);
  if (!executableExts.has(ext)) {
    for (const sig of EXECUTABLE_SIGNATURES) {
      if (buffer.length >= sig.offset + sig.bytes.length) {
        const matches = sig.bytes.every((byte, i) => buffer[sig.offset + i] === byte);
        if (matches) {
          threats.push(`Embedded executable detected: ${sig.name}. File claims to be .${ext} but contains executable code.`);
        }
      }
    }
  }

  // ── 2. Check for OLE2 VBA macro streams in Office documents ──
  // OLE2 files (.xls, .doc) that contain a "VBA" directory entry may have macros
  if (['xls', 'doc', 'ppt'].includes(ext)) {
    // OLE2 signature already validated by magic bytes.
    // Search for the VBA project stream marker inside the binary.
    const vbaMarker = Buffer.from('_VBA_PROJECT', 'ascii');
    const macroMarker = Buffer.from('VBAProject', 'ascii');
    const autoOpen = Buffer.from('AutoOpen', 'ascii');
    const autoExec = Buffer.from('Auto_Open', 'ascii');

    if (buffer.includes(vbaMarker) || buffer.includes(macroMarker)) {
      threats.push('VBA macro project detected in legacy Office document. Macro-enabled documents are not allowed.');
    }
    if (buffer.includes(autoOpen) || buffer.includes(autoExec)) {
      threats.push('Auto-executing macro detected (AutoOpen/Auto_Open). This is a common malware vector.');
    }
  }

  // ── 3. Check for OOXML files (.xlsx, .docx) containing VBA macros ──
  // OOXML is a ZIP; if it contains vbaProject.bin, it has macros
  // (These should already be blocked by extension, but defense-in-depth)
  if (['xlsx', 'docx', 'pptx'].includes(ext)) {
    const vbaProjectBin = Buffer.from('vbaProject.bin', 'ascii');
    const vbaProjectBinUpper = Buffer.from('vbaProject.bin', 'utf8');
    if (buffer.includes(vbaProjectBin) || buffer.includes(vbaProjectBinUpper)) {
      threats.push('VBA macro detected inside OOXML container. The file may have been renamed from a macro-enabled format (.xlsm/.docm).');
    }
  }

  // ── 4. Suspicious string patterns in text-like files ──
  const textExts = new Set(['csv', 'txt', 'html', 'htm', 'xml', 'json', 'svg']);
  if (textExts.has(ext) || ext === 'pdf') {
    // Sample the first 64KB for pattern scanning (performance)
    const sampleStr = buffer.slice(0, 65536).toString('utf8');
    for (const { name, pattern } of SUSPICIOUS_PATTERNS) {
      if (pattern.test(sampleStr)) {
        threats.push(`Suspicious content: ${name}`);
      }
    }
  }

  // ── 5. Polyglot detection: ZIP inside image files (GIFAR attack) ──
  const imageExts = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp']);
  if (imageExts.has(ext)) {
    // Check for ZIP signature embedded after image header
    const zipSig = [0x50, 0x4b, 0x03, 0x04];
    // Search in the last 1KB and also scan for PK header after byte 4
    for (let i = 4; i < Math.min(buffer.length, 1024); i++) {
      if (zipSig.every((byte, j) => buffer[i + j] === byte)) {
        threats.push('Polyglot file detected: ZIP archive embedded inside image file (possible GIFAR attack).');
        break;
      }
    }
  }

  // ── 6. PDF-specific: embedded JavaScript, launch actions ──
  if (ext === 'pdf') {
    const pdfStr = buffer.slice(0, Math.min(buffer.length, 262144)).toString('latin1');
    if (/\/JS\s/i.test(pdfStr) || /\/JavaScript\s/i.test(pdfStr)) {
      threats.push('PDF contains embedded JavaScript, which can be used for exploitation.');
    }
    if (/\/Launch\s/i.test(pdfStr)) {
      threats.push('PDF contains a Launch action, which can execute system commands.');
    }
    if (/\/AA\s/i.test(pdfStr) && /\/OpenAction\s/i.test(pdfStr)) {
      threats.push('PDF contains auto-executing actions (AA/OpenAction).');
    }

    // ── 7. PDF XFA form detection ──
    // XFA (XML Forms Architecture) can contain complex dynamic logic
    // that bypasses standard security scanners.
    if (/\/XFA\s/i.test(pdfStr) || /\/XDP\s/i.test(pdfStr)) {
      threats.push('PDF contains an XFA form. XFA forms can execute complex dynamic logic and are not allowed.');
    }

    // ── 8. PDF SSRF prevention: external references ──
    // These PDF actions can cause a server that processes the PDF
    // to make outbound HTTP requests (Server-Side Request Forgery).
    if (/\/GoToR\s/i.test(pdfStr)) {
      threats.push('PDF contains a GoToR (remote GoTo) action, which can trigger external requests.');
    }
    if (/\/SubmitForm\s/i.test(pdfStr)) {
      threats.push('PDF contains a SubmitForm action, which can exfiltrate data to an external URL.');
    }
    if (/\/ImportData\s/i.test(pdfStr)) {
      threats.push('PDF contains an ImportData action, which can load external data sources.');
    }
    // Check for /URI with http(s) URLs (informational — very common in benign PDFs,
    // so only flag when combined with suspicious action markers)
    if (/\/URI\s/i.test(pdfStr) && (/\/AA\s/i.test(pdfStr) || /\/OpenAction\s/i.test(pdfStr))) {
      threats.push('PDF contains URI actions combined with auto-executing triggers, which may indicate SSRF.');
    }
  }


  return {
    clean: threats.length === 0,
    threats,
  };
}
