import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createCase,
  getCases,
  exportCasesExcel,
  getCaseById,
  exportCasePdf,
  updateCase,
  updateAccused,
  updateSeizure,
  getCasesByOffender,
} from '../controllers/cases.controller';
import {
  getChargeSheet,
  upsertChargeSheet,
  getCourtHearings,
  addCourtHearing,
  getBailRecords,
  addBailRecord,
} from '../controllers/case-lifecycle.controller';
import { authenticate } from '../middleware/auth.middleware';
import fs from 'fs';
import { requirePermission } from '../middleware/authorize.middleware';
import { uploadDocument } from '../middleware/upload.middleware';
import { validateMagicBytes, scanForMalware } from '../utils/file-security';

const router = Router();

router.use(authenticate);

// ── SECURITY: Rate limit upload endpoints to prevent disk exhaustion ──
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many upload attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Document upload endpoint
router.post('/upload', uploadLimiter, uploadDocument.single('file'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // ── File Size Validation ──
  const isImage = req.file.mimetype.startsWith('image/');
  const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf');
  
  if (isImage && req.file.size > 500 * 1024) {
    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Image files must be under 500KB.' });
  }

  if (isPdf && req.file.size > 5 * 1024 * 1024) {
    if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'PDF files must be under 5MB (ideally under 2MB).' });
  }

  // ── SECURITY: Magic bytes validation for uploaded document ──
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const mbCheck = validateMagicBytes(fileBuffer, req.file.originalname);
    if (!mbCheck.valid) {
      // Cleanup invalid file from disk
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: mbCheck.reason });
    }

    // ── SECURITY: Malware / virus scan ──
    const scanResult = scanForMalware(fileBuffer, req.file.originalname);
    if (!scanResult.clean) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: 'File rejected: potential security threat detected.',
        threats: scanResult.threats,
      });
    }
  } catch (err: any) {
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: 'Failed to process uploaded file' });
  }

  res.json({
    success: true,
    data: {
      url: `/api/uploads/${req.file.filename}`,
      name: req.file.originalname
    }
  });
});

router.post('/', requirePermission('ADD_CASE'), createCase);
router.get('/', getCases);
router.get('/export', exportCasesExcel);
router.get('/offender/:offenderId', getCasesByOffender);
router.get('/:id', getCaseById);
router.get('/:id/pdf', exportCasePdf);
router.put('/:id', requirePermission('EDIT_RECORDS'), updateCase);
router.post('/:id/accused', requirePermission('EDIT_RECORDS'), updateAccused);
router.post('/:id/seizures', requirePermission('EDIT_RECORDS'), updateSeizure);

router.get('/:id/charge-sheet', getChargeSheet);
router.put('/:id/charge-sheet', requirePermission('EDIT_RECORDS'), upsertChargeSheet);
router.get('/:id/court-hearings', getCourtHearings);
router.post('/:id/court-hearings', requirePermission('EDIT_RECORDS'), addCourtHearing);
router.get('/:id/bail-records', getBailRecords);
router.post('/:id/bail-records', requirePermission('EDIT_RECORDS'), addBailRecord);

export default router;
