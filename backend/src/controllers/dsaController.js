// src/controllers/dsaController.js
import DSAProgress from '../models/DSAProgress.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let DEFAULT_TOPICS = [];
try {
  const data = fs.readFileSync(path.join(__dirname, 'dsaTopics.json'), 'utf-8');
  DEFAULT_TOPICS = JSON.parse(data);
} catch (e) {
  console.error("Failed to load DSA topics", e);
}

// ─── 1. Progress fetch karo ya banao ───
// GET /api/dsa/progress
export const getProgress = async (req, res) => {
  try {
    let progress = await DSAProgress.findOne({ userId: req.user.id });

    // Pehli baar → default topics se banao
    if (!progress) {
      progress = await DSAProgress.create({
        userId: req.user.id,
        topics: DEFAULT_TOPICS,
      });
    }

    res.status(200).json({ success: true, topics: progress.topics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 2. Question solved toggle karo ───
// PUT /api/dsa/toggle
export const toggleQuestion = async (req, res) => {
  try {
    const { category, questionTitle } = req.body;

    const progress = await DSAProgress.findOne({ userId: req.user.id });
    if (!progress) {
      return res.status(404).json({ message: 'Progress nahi mila' });
    }

    // Topic dhundo
    const topic = progress.topics.find(t => t.category === category);
    if (!topic) {
      return res.status(404).json({ message: 'Topic nahi mila' });
    }

    // Question dhundo
    const question = topic.questions.find(q => q.title === questionTitle);
    if (!question) {
      return res.status(404).json({ message: 'Question nahi mila' });
    }

    // Toggle karo
    question.solved   = !question.solved;
    question.solvedAt = question.solved ? new Date() : null;

    await progress.save();

    res.status(200).json({
      success:  true,
      solved:   question.solved,
      message:  question.solved ? 'Solved! 🎉' : 'Unsolved',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── 3. Stats nikalo ───
// GET /api/dsa/stats
export const getStats = async (req, res) => {
  try {
    const progress = await DSAProgress.findOne({ userId: req.user.id });
    if (!progress) {
      return res.status(200).json({ success: true, stats: { total: 0, solved: 0 } });
    }

    const allQuestions = progress.topics.flatMap(t => t.questions);
    const total  = allQuestions.length;
    const solved = allQuestions.filter(q => q.solved).length;

    res.status(200).json({
      success: true,
      stats: { total, solved, percentage: Math.round((solved / total) * 100) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};