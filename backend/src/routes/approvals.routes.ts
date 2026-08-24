import { Router } from 'express';
import {
  approveCase,
  rejectCase,
  requestChangesCase,
  approveOffender,
  rejectOffender,
  requestChangesOffender,
  getMySubmissions
} from '../controllers/approvals.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// Tracking endpoint for Constables & Station officers to check approval progress
router.get('/my-submissions', getMySubmissions);

// Case approval actions
router.post('/cases/:id/approve', approveCase);
router.post('/cases/:id/reject', rejectCase);
router.post('/cases/:id/request-changes', requestChangesCase);

// Offender approval actions
router.post('/offenders/:id/approve', approveOffender);
router.post('/offenders/:id/reject', rejectOffender);
router.post('/offenders/:id/request-changes', requestChangesOffender);

export default router;
