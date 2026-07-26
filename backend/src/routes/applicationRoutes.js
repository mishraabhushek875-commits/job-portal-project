import express from 'express';
import {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  checkApplied,              // ← naya import
} from '../controllers/appController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── SPECIFIC ROUTES PEHLE ──────────────────────────────────────
// Rule: /my, /check/:jobId, /job/:jobId → pehle
// Warna /:jobId ya /:id match kar lega!

// Jobseeker — specific
router.get('/my',           protect, authorize('jobseeker'), getMyApplications);
router.get('/check/:jobId', protect, checkApplied);           // ← naya

// Recruiter — specific
router.get('/job/:jobId',   protect, authorize('recruiter'), getJobApplications);

// ── GENERIC ROUTES BAAD MEIN ──────────────────────────────────
router.post('/:jobId',      protect, authorize('jobseeker'), applyJob);
router.put('/:id',          protect, authorize('recruiter'), updateApplicationStatus);
router.delete('/:id',       protect, authorize('jobseeker'), withdrawApplication);

export default router;