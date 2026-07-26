import express from 'express';
import { getMessages, sendMessage } from '../controllers/chatController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:jobId/:userId', requireAuth, getMessages);
router.post('/', requireAuth, sendMessage);

export default router;
