import DirectMessage from '../models/DirectMessage.js';
import User from '../models/user.js';

// Get chat history between two users for a specific job
export const getMessages = async (req, res) => {
  try {
    const { userId, jobId } = req.params; // The other user's ID
    const myId = req.user.id; // From auth middleware

    const messages = await DirectMessage.find({
      jobId,
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send a direct message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, jobId, content } = req.body;
    const senderId = req.user.id;

    const message = await DirectMessage.create({
      sender: senderId,
      receiver: receiverId,
      jobId,
      content
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
