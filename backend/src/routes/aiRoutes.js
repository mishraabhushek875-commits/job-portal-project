import express from 'express';

import {protect} from '../middlewares/authMiddleware.js';

const router = express.Router()

import { chat, getChatHistory } from '../controllers/chatbotController.js';
import { interviewChat, getInterviewHistory, resetInterview } from '../controllers/interviewController.js'

router.post('/chat',protect,chat);

router.get('/chat/history',protect,getChatHistory);

// Interview routes — alag endpoints
router.post('/interview',         protect, interviewChat);
router.get('/interview/history',  protect, getInterviewHistory);
router.delete('/interview/reset', protect, resetInterview);

export default router;