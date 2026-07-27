import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const getGroqClient = () => {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

async function test() {
  try {
    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'user', content: 'hello' },
      ],
      temperature:  0.7,
      max_tokens:   1024,
    });
    console.log("Success:", response.choices[0]?.message?.content);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();