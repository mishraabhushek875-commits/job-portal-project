// src/models/InterviewSession.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user', 'assistant'], required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const interviewSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  messages: [messageSchema],
}, { timestamps: true });

export default mongoose.model('InterviewSession', interviewSessionSchema);