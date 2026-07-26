import express from 'express';
import { getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:jobId/:userId', protect, getMessages);
router.post('/', protect, sendMessage);

export default router;
