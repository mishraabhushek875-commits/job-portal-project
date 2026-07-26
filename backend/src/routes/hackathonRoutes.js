// src/routes/hackathonRoutes.js
import express from 'express';
const router = express.Router();

import {
  getAllHackathons,
  registerHackathon,
  getMyHackathons,
  seedHackathons,
} from '../controllers/hackathonController.js';

import { protect } from '../middlewares/authMiddleware.js';

// Specific routes pehle — /:id se pehle!
router.get('/my',   protect, getMyHackathons);
router.post('/seed', seedHackathons);  // demo data ke liye

// General routes
router.get('/',              protect, getAllHackathons);
router.post('/:id/register', protect, registerHackathon);

export default router;