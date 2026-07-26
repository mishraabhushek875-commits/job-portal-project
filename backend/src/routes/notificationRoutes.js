import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// Get all notifications for logged-in user
router.get('/', protect, getNotifications);

// Mark all notifications as read
router.put('/read-all', protect, markAllRead);

// Mark a single notification as read
router.put('/:id/read', protect, markAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

export default router;
