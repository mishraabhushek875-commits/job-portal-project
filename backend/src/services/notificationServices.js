// src/services/notificationServices.js
import Notification from '../models/Notification.js';
import { sendNotification } from '../socket/socketHandler.js';

// Application aane par recruiter ko notify karo
export const notifyNewApplication = async (recruiterId, jobTitle, applicantName) => {
  try {
    // DB mein save karo
    await Notification.create({
      recipient: recruiterId,
      type:      'NEW_APPLICATION',
      message:   `${applicantName} ne "${jobTitle}" mein apply kiya!`,
    });

    // Real-time socket bhi bhejo
    sendNotification(recruiterId.toString(), {
      type:      'NEW_APPLICATION',
      message:   `${applicantName} ne "${jobTitle}" mein apply kiya!`,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

// Status change par applicant ko notify karo
export const notifyStatusChange = async (applicantId, jobTitle, status) => {
  const messages = {
    reviewed:    `Tumhari "${jobTitle}" application review ho rahi hai 👀`,
    shortlisted: `🎉 Tumhe "${jobTitle}" ke liye shortlist kiya gaya!`,
    rejected:    `"${jobTitle}" application reject ho gayi`,
  };

  const message = messages[status] || `Status update: ${status}`;

  try {
    // DB mein save karo
    await Notification.create({
      recipient: applicantId,
      type:      'STATUS_CHANGED',
      message,
    });

    // Real-time socket bhi bhejo
    sendNotification(applicantId.toString(), {
      type:    'STATUS_CHANGED',
      message,
      status,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};