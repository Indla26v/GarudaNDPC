import zlib from 'zlib';
import {
  validateMagicBytes,
  scanForMalware,
} from '../utils/file-security';

describe('File Security & Deep Malware Scanning', () => {
  describe('PDF Deep Stream Decompression & JS Detection', () => {
    it('should allow clean PDF without malicious streams', () => {
      const cleanPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n%%EOF', 'utf-8');
      const scan = scanForMalware(cleanPdf, 'clean_report.pdf');
      expect(scan.clean).toBe(true);
      expect(scan.threats).toHaveLength(0);
    });

    it('should detect uncompressed embedded JavaScript in PDF', () => {
      const maliciousPdf = Buffer.from('%PDF-1.4\n<< /S /JavaScript /JS (app.alert("pwned")) >>\n%%EOF', 'utf-8');
      const scan = scanForMalware(maliciousPdf, 'malicious.pdf');
      expect(scan.clean).toBe(false);
      expect(scan.threats.some(t => t.toLowerCase().includes('javascript'))).toBe(true);
    });

    it('should detect FlateDecode-compressed embedded JavaScript in /ObjStm streams', () => {
      const jsPayload = Buffer.from('<< /S /JavaScript /JS (var b="alert(document.cookie)"; app.alert(b);) >>', 'utf-8');
      const compressedStream = zlib.deflateSync(jsPayload);

      const streamHeader = Buffer.from('%PDF-1.6\n8 0 obj\n<< /Type /ObjStm /Filter /FlateDecode /Length ' + compressedStream.length + ' >>\nstream\r\n', 'utf-8');
      const streamFooter = Buffer.from('\r\nendstream\nendobj\n%%EOF', 'utf-8');
      const fullPdf = Buffer.concat([streamHeader, compressedStream, streamFooter]);

      const scan = scanForMalware(fullPdf, 'test.pdf');
      expect(scan.clean).toBe(false);
      expect(scan.threats.some(t => t.includes('JavaScript') || t.includes('compressed stream'))).toBe(true);
    });

    it('should detect FlateDecode-compressed Launch actions', () => {
      const launchPayload = Buffer.from('<< /Type /Action /S /Launch /F (cmd.exe) >>', 'utf-8');
      const compressedStream = zlib.deflateSync(launchPayload);

      const streamHeader = Buffer.from('%PDF-1.6\n9 0 obj\n<< /Filter /FlateDecode >>\nstream\r\n', 'utf-8');
      const streamFooter = Buffer.from('\r\nendstream\nendobj\n%%EOF', 'utf-8');
      const fullPdf = Buffer.concat([streamHeader, compressedStream, streamFooter]);

      const scan = scanForMalware(fullPdf, 'launch_attack.pdf');
      expect(scan.clean).toBe(false);
      expect(scan.threats.some(t => t.includes('Launch'))).toBe(true);
    });
  });

  describe('Magic Bytes Validation', () => {
    it('should validate standard PDF header (%PDF)', () => {
      const validPdf = Buffer.from('%PDF-1.7\n...', 'utf-8');
      const res = validateMagicBytes(validPdf, 'valid.pdf');
      expect(res.valid).toBe(true);
    });

    it('should reject fake PDF containing executable binary', () => {
      const fakePdf = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ executable
      const res = validateMagicBytes(fakePdf, 'payload.pdf');
      expect(res.valid).toBe(false);
    });
  });
});
