import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  uploadStatement,
  getDashboard,
  getUploads,
  getTransactions,
  getAlerts,
  getOffenderLinks,
  getFlowMap,
  getCommonCounterparties,
  getMonthlyAnalysis,
  rerunAnalysis,
  updateTransaction,
} from '../controllers/finance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/authorize.middleware';
import { uploadStatement as uploadStatementFile } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

// Phase 2 — blocked for Phase 1 deployment. Remove this middleware to re-enable.
router.use((_req, res) => {
  return res.status(403).json({
    message: 'This feature is not available in the current deployment phase.'
  });
});

// ── SECURITY: Rate limit upload endpoints to prevent disk exhaustion ──
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many upload attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload + parse a bank/UPI statement (FIN upload permission)
router.post('/upload-statement', uploadLimiter, requirePermission('FINANCE_UPLOAD'), uploadStatementFile.single('file'), uploadStatement);

// Intelligence query APIs (FIN view permission)
router.get('/dashboard', requirePermission('FINANCE_VIEW'), getDashboard);
router.get('/uploads', requirePermission('FINANCE_VIEW'), getUploads);
router.get('/transactions', requirePermission('FINANCE_VIEW'), getTransactions);
router.get('/alerts', requirePermission('FINANCE_VIEW'), getAlerts);
router.get('/offender-links', requirePermission('FINANCE_VIEW'), getOffenderLinks);
router.get('/common-counterparties', requirePermission('FINANCE_VIEW'), getCommonCounterparties);
router.get('/flow-map/:offenderId', requirePermission('FINANCE_VIEW'), getFlowMap);
router.get('/analysis/monthly/:offenderId', requirePermission('FINANCE_VIEW'), getMonthlyAnalysis);

// Update transaction notes / flags
router.put('/transaction/:id', requirePermission('FINANCE_VIEW'), updateTransaction);

// Re-run analysis (FIN analyze permission)
router.post('/rerun-analysis/:batchId', requirePermission('FINANCE_ANALYZE'), rerunAnalysis);

export default router;
