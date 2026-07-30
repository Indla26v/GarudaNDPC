/**
 * GARUDA — Image Sanitizer Utility
 *
 * Zero-dependency utilities for:
 *  1. Stripping EXIF/IPTC/XMP metadata from JPEG and PNG images
 *  2. Reading image dimensions from binary headers
 *  3. Validating image dimensions against maximum limits
 *
 * Why strip metadata?
 *   Uploaded photos often embed GPS coordinates, camera serial numbers,
 *   timestamps, and other PII that can leak sensitive location data
 *   about offenders, officers, or crime scenes.
 */

/* ───────────────────── Constants ────────────────────── */

/** Maximum allowed image dimensions (width or height). */
const MAX_IMAGE_DIMENSION = 4096;

/* ───────────────────── JPEG EXIF Stripping ────────────────────── */

/**
 * JPEG marker bytes reference:
 *   0xFFD8 — SOI (Start of Image)
 *   0xFFE0 — APP0  (JFIF)
 *   0xFFE1 — APP1  (EXIF / XMP)
 *   0xFFE2–0xFFEF — APP2–APP15 (IPTC in APP13 = 0xFFED)
 *   0xFFC0 — SOF0  (Start of Frame — baseline)
 *   0xFFC2 — SOF2  (Start of Frame — progressive)
 *   0xFFD9 — EOI   (End of Image)
 *   0xFFDA — SOS   (Start of Scan — image data follows)
 */

/** JPEG APP markers that may contain metadata to strip. */
const JPEG_METADATA_MARKERS = new Set([
  0xffe1, // APP1 — EXIF, XMP
  0xffe2, // APP2 — ICC Profile (can contain metadata)
  0xffed, // APP13 — IPTC / Photoshop
  0xffee, // APP14 — Adobe
]);

/**
 * Strip EXIF, IPTC, and XMP metadata from a JPEG buffer.
 *
 * Reconstructs the JPEG by copying all segments except metadata markers.
 * The resulting image is pixel-identical to the original.
 *
 * @param buffer  Raw JPEG file buffer
 * @returns       New buffer with metadata stripped
 */
export function stripJpegMetadata(buffer: Buffer): Buffer {
  // Verify JPEG SOI marker
  if (buffer.length < 2 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer; // Not a valid JPEG — return as-is
  }

  const chunks: Buffer[] = [];
  // Keep SOI
  chunks.push(buffer.slice(0, 2));

  let offset = 2;

  while (offset < buffer.length - 1) {
    // Each marker is 0xFF followed by a marker byte
    if (buffer[offset] !== 0xff) {
      // We've hit raw data (shouldn't happen before SOS, but be safe)
      chunks.push(buffer.slice(offset));
      break;
    }

    const markerByte = buffer[offset + 1]!;
    const marker = 0xff00 | markerByte;

    // SOS (Start of Scan) — everything after this is image data
    if (marker === 0xffda) {
      chunks.push(buffer.slice(offset));
      break;
    }

    // EOI — end
    if (marker === 0xffd9) {
      chunks.push(buffer.slice(offset, offset + 2));
      break;
    }

    // Markers without length (standalone markers like RST, SOI, EOI)
    if (markerByte === 0x00 || markerByte === 0x01 || (markerByte >= 0xd0 && markerByte <= 0xd7)) {
      chunks.push(buffer.slice(offset, offset + 2));
      offset += 2;
      continue;
    }

    // Markers with length field
    if (offset + 3 >= buffer.length) {
      chunks.push(buffer.slice(offset));
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    const segmentEnd = offset + 2 + segmentLength;

    if (JPEG_METADATA_MARKERS.has(marker)) {
      // Skip this segment (strip metadata)
      offset = segmentEnd;
      continue;
    }

    // Keep this segment
    chunks.push(buffer.slice(offset, segmentEnd));
    offset = segmentEnd;
  }

  return Buffer.concat(chunks);
}

/* ───────────────────── PNG Metadata Stripping ────────────────────── */

/**
 * PNG chunk types that contain metadata and should be stripped.
 */
const PNG_METADATA_CHUNKS = new Set([
  'tEXt', // Textual data
  'iTXt', // International textual data
  'zTXt', // Compressed textual data
  'eXIf', // EXIF metadata (PNG 1.5+)
]);

/**
 * Strip metadata chunks from a PNG buffer.
 *
 * Preserves all critical chunks (IHDR, PLTE, IDAT, IEND) and
 * ancillary chunks that don't contain metadata.
 *
 * @param buffer  Raw PNG file buffer
 * @returns       New buffer with metadata stripped
 */
export function stripPngMetadata(buffer: Buffer): Buffer {
  // Verify PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length < 8 || !PNG_SIG.every((b, i) => buffer[i] === b)) {
    return buffer; // Not a valid PNG
  }

  const chunks: Buffer[] = [];
  // Keep the PNG signature
  chunks.push(buffer.slice(0, 8));

  let offset = 8;

  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32BE(offset);
    const chunkType = buffer.slice(offset + 4, offset + 8).toString('ascii');
    // Total chunk size: 4 (length) + 4 (type) + data + 4 (CRC)
    const totalChunkSize = 12 + chunkLength;

    if (offset + totalChunkSize > buffer.length) {
      // Malformed chunk — keep remainder as-is
      chunks.push(buffer.slice(offset));
      break;
    }

    if (!PNG_METADATA_CHUNKS.has(chunkType)) {
      chunks.push(buffer.slice(offset, offset + totalChunkSize));
    }

    offset += totalChunkSize;

    // Stop after IEND
    if (chunkType === 'IEND') break;
  }

  return Buffer.concat(chunks);
}

/* ───────────────────── Unified Metadata Stripping ────────────────────── */

/**
 * Strip metadata from an image buffer based on its extension.
 *
 * @param buffer    Raw image file buffer
 * @param filename  Original filename (for extension detection)
 * @returns         Sanitized buffer with metadata removed
 */
export function stripImageMetadata(buffer: Buffer, filename: string): Buffer {
  const ext = (filename.split('.').pop() || '').toLowerCase();

  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return stripJpegMetadata(buffer);
    case 'png':
      return stripPngMetadata(buffer);
    default:
      // GIF and WebP: metadata stripping not implemented (low risk).
      // GIF doesn't typically carry EXIF; WebP requires RIFF parsing.
      return buffer;
  }
}

/* ───────────────────── Image Dimension Reading ────────────────────── */

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Read image dimensions directly from binary headers.
 * Supports JPEG (SOF0/SOF2) and PNG (IHDR).
 *
 * @param buffer  Raw image file buffer
 * @param filename Original filename
 * @returns       Dimensions, or null if unreadable
 */
export function getImageDimensions(buffer: Buffer, filename: string): ImageDimensions | null {
  const ext = (filename.split('.').pop() || '').toLowerCase();

  if (ext === 'png') {
    return getPngDimensions(buffer);
  }

  if (ext === 'jpg' || ext === 'jpeg') {
    return getJpegDimensions(buffer);
  }

  if (ext === 'gif') {
    return getGifDimensions(buffer);
  }

  if (ext === 'webp') {
    return getWebpDimensions(buffer);
  }

  return null;
}

function getPngDimensions(buffer: Buffer): ImageDimensions | null {
  // IHDR starts at offset 8 (after signature).
  // Bytes 16–19: width (uint32 BE), 20–23: height (uint32 BE)
  if (buffer.length < 24) return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function getJpegDimensions(buffer: Buffer): ImageDimensions | null {
  // Scan for SOF0 (0xFFC0) or SOF2 (0xFFC2) marker
  let offset = 2; // Skip SOI

  while (offset < buffer.length - 8) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buffer[offset + 1];

    // SOF markers: 0xC0 (baseline), 0xC1, 0xC2 (progressive)
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      // SOF structure: marker(2) + length(2) + precision(1) + height(2) + width(2)
      if (offset + 9 > buffer.length) return null;
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }

    // SOS — stop scanning
    if (marker === 0xda) break;

    // Skip segment
    if (offset + 3 < buffer.length) {
      const segLen = buffer.readUInt16BE(offset + 2);
      offset += 2 + segLen;
    } else {
      break;
    }
  }

  return null;
}

function getGifDimensions(buffer: Buffer): ImageDimensions | null {
  // GIF header: signature(6) + width(2 LE) + height(2 LE)
  if (buffer.length < 10) return null;
  const width = buffer.readUInt16LE(6);
  const height = buffer.readUInt16LE(8);
  return { width, height };
}

function getWebpDimensions(buffer: Buffer): ImageDimensions | null {
  // RIFF header: RIFF(4) + size(4) + WEBP(4) + VP8 chunk
  if (buffer.length < 30) return null;

  const chunk = buffer.slice(12, 16).toString('ascii');

  if (chunk === 'VP8 ') {
    // Lossy: frame tag at offset 26
    if (buffer.length < 30) return null;
    const width = buffer.readUInt16LE(26) & 0x3fff;
    const height = buffer.readUInt16LE(28) & 0x3fff;
    return { width, height };
  }

  if (chunk === 'VP8L') {
    // Lossless: bits at offset 21
    if (buffer.length < 25) return null;
    const bits = buffer.readUInt32LE(21);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return { width, height };
  }

  if (chunk === 'VP8X') {
    // Extended: canvas size at offsets 24–29
    if (buffer.length < 30) return null;
    const width = 1 + (buffer[24]! | (buffer[25]! << 8) | (buffer[26]! << 16));
    const height = 1 + (buffer[27]! | (buffer[28]! << 8) | (buffer[29]! << 16));
    return { width, height };
  }

  return null;
}

/* ───────────────────── Dimension Validation ────────────────────── */

export interface DimensionValidationResult {
  valid: boolean;
  reason?: string;
  dimensions?: ImageDimensions;
}

/**
 * Validate that an image's dimensions are within allowed limits.
 *
 * @param buffer   Raw image buffer
 * @param filename Original filename
 * @param maxDim   Maximum allowed dimension (default: 4096)
 * @returns        `{ valid: true }` or `{ valid: false, reason }`
 */
export function validateImageDimensions(
  buffer: Buffer,
  filename: string,
  maxDim = MAX_IMAGE_DIMENSION,
): DimensionValidationResult {
  const dims = getImageDimensions(buffer, filename);

  if (!dims) {
    // Can't read dimensions — allow through (don't block on parse failure)
    return { valid: true };
  }

  if (dims.width > maxDim || dims.height > maxDim) {
    return {
      valid: false,
      dimensions: dims,
      reason: `Image dimensions ${dims.width}×${dims.height} exceed the maximum allowed ${maxDim}×${maxDim} pixels.`,
    };
  }

  return { valid: true, dimensions: dims };
}
