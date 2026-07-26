// testgroq.js
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const response = await groq.chat.completions.create({
  model: 'llama-3.1-8b-instant',
  messages: [{ role: 'user', content: 'React interview tips do' }],
  max_tokens: 200,
});

console.log('✅ Response:', response.choices[0].message.content);