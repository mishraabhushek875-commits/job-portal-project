import Groq from 'groq-sdk';

const getGroqModel = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY missing!');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

export default getGroqModel;