import cron from 'node-cron';
import Hackathon from '../models/Hackathon.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API (Assuming process.env.GEMINI_API_KEY is available)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function fetchNewHackathons() {
  if (!process.env.GEMINI_API_KEY) {
    console.log('Gemini API key missing. Skipping Hackathon Cron.');
    return;
  }

  console.log('Running Weekly Hackathon Fetch...');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Generate a JSON array containing exactly 3 upcoming real-world or realistic hackathons.
Each hackathon must have:
- title (String)
- organizer (String)
- description (String)
- prize (String, e.g. '₹2,00,000')
- deadline (Date string in YYYY-MM-DD format, at least 1 month in the future)
- mode (String: 'Online', 'Offline', or 'Online + Offline')
- tags (Array of strings, e.g. ['AI', 'Web3'])
- maxTeamSize (Number, e.g. 4)
- registrationLink (String, a URL like 'https://devpost.com' or similar)

Output only valid JSON array. Do not include markdown formatting or backticks.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const hackathons = JSON.parse(text);

    for (const h of hackathons) {
      h.status = 'open';
      h.participants = Math.floor(Math.random() * 5000) + 100;
      await Hackathon.create(h);
    }
    console.log(`Successfully added ${hackathons.length} new hackathons via AI.`);
  } catch (error) {
    console.error('Error in Hackathon Cron:', error.message);
  }
}

// Run every Sunday at midnight
const startHackathonCron = () => {
  cron.schedule('0 0 * * 0', fetchNewHackathons);
  console.log('Hackathon Cron Job scheduled (Runs every Sunday at 00:00)');
};

export default startHackathonCron;
