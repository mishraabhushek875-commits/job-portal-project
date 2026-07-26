import express from 'express';
const router = express.Router();

import {
  createJob, getAllJobs, getJobById,
  updateJob, deleteJob, getMyJobs
} from '../controllers/jobController.js';

import { protect, authorize, optionalProtect } from '../middlewares/authMiddleware.js';
import { getRecommendations } from '../ai/recommendations/jobRecommender.js';

// ─── SPECIFIC ROUTES PEHLE ───────────────────────────────────
// Rule: specific routes hamesha /:id se pehle likhو
// Warna /:id sab kuch capture kar leta hai

// AI Recommendations — pehle likho /:id se
router.get('/ai/recommendations', protect, async (req, res) => {
  try {
    const recommendations = await getRecommendations(req.user.id);

    if (recommendations.length === 0) {
      return res.json({
        success: true,
        message: 'Pehle kuch jobs search karo — phir recommendations aayengi!',
        recommendations: []
      });
    }

    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Recruiter ki apni jobs — pehle likho /:id se
router.get('/myjobs', protect, authorize('recruiter'), getMyJobs);

// ─── GENERAL ROUTES ──────────────────────────────────────────

// Public — bina login ke bhi dekh sakte hain
// optionalProtect laga diya taaki agar login ho toh req.user mile — history save ho sake
router.get('/', optionalProtect, getAllJobs);

// Protected — login zaroori
router.post('/',    protect, authorize('recruiter'), createJob);
router.put('/:id',  protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

// /:id sabse last mein — specific routes ke baad
router.get('/:id', getJobById);

export default router;