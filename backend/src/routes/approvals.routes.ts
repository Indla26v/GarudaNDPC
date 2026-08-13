import { Router } from 'express';
import {
  approveCase,
  rejectCase,
  approveOffender,
  rejectOffender
} from '../controllers/approvals.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/cases/:id/approve', approveCase);
router.post('/cases/:id/reject', rejectCase);
router.post('/offenders/:id/approve', approveOffender);
router.post('/offenders/:id/reject', rejectOffender);

export default router;
