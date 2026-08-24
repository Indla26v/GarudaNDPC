import { Router } from 'express';
import {
  getEditRequests,
  createEditRequest,
  approveEditRequest,
  rejectEditRequest,
  requestChangesEditRequest,
} from '../controllers/edit-request.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

// List edit requests (scoped by role in controller)
router.get('/', getEditRequests);

// Create an edit request (CI / SI — checked in controller)
router.post('/', createEditRequest);

// Approve an edit request (DSP only — checked in controller)
router.post('/:id/approve', approveEditRequest);

// Request changes on an edit request
router.post('/:id/request-changes', requestChangesEditRequest);

// Reject an edit request (DSP only — checked in controller)
router.post('/:id/reject', rejectEditRequest);

export default router;
