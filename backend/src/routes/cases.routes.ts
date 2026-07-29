import { Router } from 'express';
import {
  createCase,
  getCases,
  getCaseById,
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

// Document upload endpoint
router.post('/upload', uploadDocument.single('file'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
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
router.get('/offender/:offenderId', getCasesByOffender);
router.get('/:id', getCaseById);
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
