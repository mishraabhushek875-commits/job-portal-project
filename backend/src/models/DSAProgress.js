// src/models/DSAProgress.js
import mongoose from 'mongoose';

// Ek question ka progress
const questionSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'] },
  leetCodeUrl:{ type: String, default: '' },
  solved:     { type: Boolean, default: false },
  solvedAt:   { type: Date },
});

// Ek topic ka progress (Arrays, Trees, etc.)
const topicSchema = new mongoose.Schema({
  category:  { type: String, required: true },
  questions: [questionSchema],
});

// User ka poora DSA progress
const dsaProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,  // ek user ki ek hi entry
  },
  topics: [topicSchema],
}, { timestamps: true });

export default mongoose.model('DSAProgress', dsaProgressSchema);