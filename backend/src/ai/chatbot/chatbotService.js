import Groq from 'groq-sdk';
import Job from '../../models/job.js';

// ─── Groq Client ───
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY missing hai .env mein');
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// ─── Intent Detection ───
const JOB_SEARCH_KEYWORDS = [
  'job', 'jobs', 'vacancy', 'vacancies', 'opening', 'openings',
  'hiring', 'naukri', 'kaam', 'position', 'role',
  'find', 'show', 'search', 'dikhao', 'dhundo', 'chahiye'
];

const CITIES = [
  'mumbai', 'delhi', 'bangalore', 'bengaluru', 'pune',
  'hyderabad', 'chennai', 'kolkata', 'noida', 'gurgaon',
  'agra', 'jaipur', 'ahmedabad', 'surat', 'lucknow'
];

const JOB_ROLES = [
  'react', 'node', 'node.js', 'python', 'java', 'angular', 'vue',
  'flutter', 'android', 'ios', 'devops', 'data analyst', 'data scientist',
  'machine learning', 'ml', 'ai', 'full stack', 'frontend', 'backend',
  'ui/ux', 'graphic designer', 'php', 'django', 'spring', 'react',
];



/*
. JOB_SEARCH_KEYWORDS, CITIES, JOB_ROLES arrays + detectIntent() — Ye AI nahi hai, ye plain keyword matching hai (msg.includes('job') type). Concept: iska naam "Intent Detection" hai — pehle decide karna ki user kya chahta hai (job dhoondh raha hai ya general baat kar raha hai), taaki app decide kare aage kya karna hai. Abhi ye rule-based hai (hardcoded lists), LLM use nahi ho raha.
*/

function detectIntent(message) {
  const msg = message.toLowerCase();
  const isJobSearch = JOB_SEARCH_KEYWORDS.some(kw => msg.includes(kw));
  if (!isJobSearch) {
    return { type: 'general_question', keyword: '', location: '' };
  }
  const keyword = JOB_ROLES.find(role => msg.includes(role)) || '';
  const location = CITIES.find(city => msg.includes(city)) || '';
  return { type: 'job_search', keyword, location };
}



// ─── AI-based Intent Detection ───
async function detectIntentWithAI(message) {
  try {
    const groq = getGroqClient();

    const systemPrompt = `Extract job search intent from the user message.
Always reply ONLY in this JSON format:
{"type": "job_search" or "general_question", "keyword": "", "location": ""}
No extra text outside JSON.

Examples:
User: "show me react jobs in pune" -> {"type": "job_search", "keyword": "react", "location": "pune"}
User: "how do I write a good resume" -> {"type": "general_question", "keyword": "", "location": ""}
User: "any python openings in bangalore" -> {"type": "job_search", "keyword": "python", "location": "bangalore"}`;

    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature: 0,
      max_tokens: 300,
      reasoning_effort: 'low',
    });

    
     const raw = response.choices[0].message.content.trim();
      if (!raw) throw new Error('Empty response from model');
       return JSON.parse(raw);
  } catch (err) {
    console.error('AI intent detection failed, falling back:', err.message);
    return detectIntent(message); // purana keyword-based fallback
  }
}

/*3. findJobsFromDB() — Normal MongoDB regex search hai. Ye bhi AI nahi hai — plain database query. (Interesting fact: yehi jagah hai jahan RAG (jo hum Day 9-10 me seekhenge) upgrade karega — abhi regex match hai, RAG se semantic search hoga, matlab "React developer" search karne pe "Frontend Engineer" bhi mil jayega, chahe exact word match na ho.)
*/

// ─── Database Search ───
async function findJobsFromDB(keyword, location) {
  const query = { status: 'open' };
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { skills: { $elemMatch: { $regex: keyword, $options: 'i' } } },
      { description: { $regex: keyword, $options: 'i' } }
    ];
  }
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }
  const jobs = await Job.find(query)
    .select('title company location salary jobType skills')
    .sort({ createdAt: -1 })
    .limit(5);
  return jobs;
}



/*4. getAIReply() — Yahan asli LLM use ho raha hai:

systemPrompt — JobBot ka persona define ho raha hai (Day 2-3 wala concept — role, tone, constraints "Hinglish", "3-4 lines", "kabhi rude mat hona").

chatHistory.slice(-6) — Ye Day 1 ka context window concept hai practically implement hua! Sirf last 6 messages bhejta hai, poori history nahi — taaki context window overflow na ho aur cost bhi control me rahe.

temperature: 0.7 — Day 1 wala concept, thoda creative but zyada random nahi.*/

// ─── Groq AI Reply ───
async function getAIReply(userMessage, chatHistory) {
  const groq = getGroqClient();

  // History ko Groq format mein convert karo
  const recentHistory = chatHistory.slice(-6).map(msg => ({
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content,
  }));

  const systemPrompt = `Tu "JobBot" hai — ek friendly job portal assistant.
Tera kaam: job seekers ki madad karna.
- Resume tips, interview prep, career advice do
- Hinglish mein baat karo — friendly aur helpful raho  
- Short aur clear jawab do — 3-4 lines kaafi hain
- Agar koi irrelevant topic aaye to politely career pe wapas lao
- Kabhi rude mat hona`;

  const response = await groq.chat.completions.create({
    model: 'openai/gpt-oss-20b',
    messages: [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: userMessage },
    ],
   max_tokens: 800,
    temperature: 0.7, 
    reasoning_effort: 'low',
  });

  const content = response.choices[0].message.content; if (!content) throw new Error('Empty response from AI');

  return response.choices[0].message.content;
}

// ─── Main Function ───
async function processMessage(userMessage, chatHistory = []) {
  /*const intent = detectIntent(userMessage);*/


  const intent = await detectIntentWithAI(userMessage);//Ai-based llm intent detection, fallback to keyword-based if AI fails
  console.log('🤖 Intent detected:', intent);
  
  let replyText = '';
  let foundJobs = [];

  if (intent.type === 'job_search') {
    foundJobs = await findJobsFromDB(intent.keyword, intent.location);
    if (foundJobs.length === 0) {
      replyText = `"${intent.keyword || 'is role'}" ke liye ` +
        `${intent.location ? intent.location + ' mein ' : ''}` +
        `abhi koi job nahi hai. Dusra keyword try karo ya location hata ke search karo.`;
    } else {
      replyText = `${foundJobs.length} jobs mili hain` +
        `${intent.keyword ? ' "' + intent.keyword + '"' : ''}` +
        `${intent.location ? ' ' + intent.location + ' mein' : ''}! Yeh dekho:`;
    }
  } else {
    replyText = await getAIReply(userMessage, chatHistory);
  }

  return {
    message: replyText,
    jobs: foundJobs,
    intent: intent.type,
  };
}

export { processMessage };

/*. processMessage() — Orchestrator hai — detectIntent() ke result ke hisab se decide karta hai: agar job search hai to DB query karo (AI nahi), agar general question hai to LLM call karo (getAIReply).


6. Dusra file (getGroqModel) — Ye getGroqClient() jaisa hi hai, thoda duplicate lagta hai — shayad kisi aur file me use ho raha hoga alag purpose ke liye.
*/