// src/routes/dsaRoutes.js
import express from 'express';
const router = express.Router();

import { getProgress, toggleQuestion, getStats } from '../controllers/dsaController.js';
import { protect } from '../middlewares/authMiddleware.js';

// Teeno routes pe login zaroori
router.get('/progress', protect, getProgress);
router.put('/toggle',   protect, toggleQuestion);
router.get('/stats',    protect, getStats);

export default router;