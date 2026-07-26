// src/controllers/interviewController.js
import { getInterviewReply } from '../ai/interview/interviewService.js';
import InterviewSession from '../models/InterviewSession.js';

// POST /api/ai/interview
export const interviewChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id || req.user._id;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message empty nahi ho sakta' });
    }

    // Session lo ya banao
    let session = await InterviewSession.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, messages: [] } },
      { new: true, upsert: true }
    );

    // Last 8 messages context ke liye
    const recentMessages = session.messages.slice(-8);

    // Gemini se jawab lo
    const reply = await getInterviewReply(message, recentMessages);

    // Dono messages save karo
    session.messages.push({ role: 'user',      content: message });
    session.messages.push({ role: 'assistant', content: reply   });

    // Max 100 messages rakho
    if (session.messages.length > 100) {
      session.messages = session.messages.slice(-100);
    }

    await session.save();

    res.json({ success: true, reply });

  } catch (err) {
    console.error('Interview chat error:', err.message);
    res.status(500).json({ message: 'AI abhi busy hai, dobara try karo' });
  }
};

// GET /api/ai/interview/history
export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const session = await InterviewSession.findOne({ userId });

    res.json({
      success:  true,
      messages: session?.messages || [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/ai/interview/reset
export const resetInterview = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await InterviewSession.findOneAndUpdate(
      { userId },
      { messages: [] }
    );
    res.json({ success: true, message: 'Session reset ho gaya!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};