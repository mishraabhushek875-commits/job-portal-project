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
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: userMessage },
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

// ─── Main Function ───
async function processMessage(userMessage, chatHistory = []) {
  const intent = detectIntent(userMessage);
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