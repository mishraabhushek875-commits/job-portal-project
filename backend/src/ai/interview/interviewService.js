// src/ai/interview/interviewService.js
// Groq API use kar raha hai — Gemini nahi
// Groq bahut fast hai — llama3 model use karta hai

import Groq from 'groq-sdk';

const getGroqClient = () => {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Interview-specific system prompt
const SYSTEM_PROMPT = `Tu ek senior software engineer hai jo technical interviews leta hai.
Tera kaam candidates ko interview prepare karwana hai.

Teri expertise:
- DSA: Arrays, Trees, DP, Graphs, Sorting, Searching
- System Design: HLD, LLD, Databases, Caching, Load Balancing
- JavaScript, React, Node.js, MongoDB, REST APIs
- HR questions aur behavioral interviews (STAR method)

Rules:
- Hinglish mein baat karo — friendly lekin professional raho
- Code examples do jab zaroorat ho (proper formatting ke saath)
- Step by step explain karo — beginner friendly
- Agar user ne galat answer diya to gently correct karo
- Concise raho — 4-6 lines unless code chahiye
- Encourage karo — confidence badhao`;

export async function getInterviewReply(userMessage, chatHistory = []) {
  // Chat history ko Groq format mein convert karo
  // Groq format: { role: 'user'/'assistant', content: '...' }
  const formattedHistory = chatHistory.slice(-8).map(msg => ({
    role:    msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content,
  }));

  // Groq API call
  const groq = getGroqClient();
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',   // fast + free model
    messages: [
      // System prompt pehle
      { role: 'system', content: SYSTEM_PROMPT },
      // Purani history
      ...formattedHistory,
      // Naya message
      { role: 'user', content: userMessage },
    ],
    temperature:  0.7,   // creativity level
    max_tokens:   1024,  // response ki max length
  });

  // Response text nikalo
  return response.choices[0]?.message?.content || 'Kuch error aaya, dobara try karo!';
}