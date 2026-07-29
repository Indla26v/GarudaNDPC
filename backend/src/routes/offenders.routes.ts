import { Router } from 'express';
import { 
  getOffenders, 
  getOffenderById, 
  createOffender, 
  updateOffender,
  getDatabankRecords
} from '../controllers/offenders.controller';
import { exportOffendersCsv, getOffenderHistorySheet, getOffenderHistorySheetPdf } from '../controllers/export.controller';
import { getImeiRecords, createImeiRecord, updateImeiRecord } from '../controllers/imei.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize, requirePermission } from '../middleware/authorize.middleware';
import { uploadPhoto, uploadExcel } from '../middleware/upload.middleware';
import { validateMagicBytes, scanForMalware } from '../utils/file-security';
import { importDprExcel } from '../controllers/import.controller';
import { getInterrogations, addInterrogation } from '../controllers/case-lifecycle.controller';

const router = Router();

router.use(authenticate);

// All authenticated users can view & search (scoped by PS in controller)
router.get('/databank/records', getDatabankRecords);
router.get('/', getOffenders);
router.get('/export', exportOffendersCsv);
router.get('/:offenderId/interrogations', getInterrogations);
router.get('/:id/history-sheet', getOffenderHistorySheet);
router.get('/:id/history-sheet-pdf', getOffenderHistorySheetPdf);
router.post('/:offenderId/interrogations', requirePermission('EDIT_RECORDS'), addInterrogation);
router.get('/:id', getOffenderById);

// Photo upload endpoint
router.post('/upload', uploadPhoto.single('photo'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // ── SECURITY: Magic bytes validation ──
  const mbCheck = validateMagicBytes(req.file.buffer, req.file.originalname);
  if (!mbCheck.valid) {
    return res.status(400).json({ message: mbCheck.reason });
  }

  // ── SECURITY: Malware / virus scan ──
  const scanResult = scanForMalware(req.file.buffer, req.file.originalname);
  if (!scanResult.clean) {
    return res.status(400).json({
      message: 'File rejected: potential security threat detected.',
      threats: scanResult.threats,
    });
  }

  const base64Data = req.file.buffer.toString('base64');
  const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;
  res.json({
    success: true,
    data: {
      url: dataUrl
    },
    url: dataUrl
  });
});

// Admin endpoint for Excel upload
router.post('/import', requirePermission('ADD_CASE'), uploadExcel.single('file'), importDprExcel);

// CI/SI can create
router.post('/', requirePermission('ADD_CASE'), createOffender);

// Update: only ADMIN and DSP can directly edit; CI/SI must go through edit requests
router.put('/:id', requirePermission('EDIT_RECORDS'), updateOffender);

// ── Interrogation Sessions ─────────────────────────────────────────────
// Addressed via /:offenderId/interrogations in case_lifecycle.controller

// ── IMEI Records ───────────────────────────────────────────────────────
router.get('/:offenderId/imei', requirePermission('OFFENDER_VIEW'), getImeiRecords);
router.post('/:offenderId/imei', requirePermission('OFFENDER_EDIT'), createImeiRecord);
router.put('/:offenderId/imei/:id', requirePermission('OFFENDER_EDIT'), updateImeiRecord);

export default router;
