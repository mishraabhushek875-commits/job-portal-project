// src/ai/recommendations/jobRecommender.js

import Job from '../../models/job.js';
import SearchHistory from '../../models/SearchHistory.js';
import User from '../../models/user.js';

async function buildUserContext(userId) {
  const [user, searches] = await Promise.all([
    User.findById(userId).select('skills location'),
    SearchHistory.find({ userId }).sort({ searchedAt: -1 }).limit(10)
  ]);

  console.log('📊 Searches found in DB:', searches.length);

  const keywords  = new Set();
  const locations = new Set();

  searches.forEach(search => {
    if (search.keyword)  keywords.add(search.keyword.toLowerCase());
    if (search.location) locations.add(search.location.toLowerCase());
    search.skills.forEach(sk => keywords.add(sk.toLowerCase()));
  });

  if (user?.skills) user.skills.forEach(sk => keywords.add(sk.toLowerCase()));
  if (user?.location) locations.add(user.location.toLowerCase());

  return {
    keywords:   [...keywords],
    locations:  [...locations],
    userSkills: user?.skills || []
  };
}

function scoreJob(job, context) {
  let score = 0;

  const jobText = [
    job.title       || '',
    job.description || '',
    ...(job.skills  || [])
  ].join(' ').toLowerCase();

  let keywordHits = 0;
  context.keywords.forEach(kw => {
    if (jobText.includes(kw)) keywordHits++;
  });

  if (context.keywords.length > 0) {
    score += Math.min((keywordHits / context.keywords.length) * 40, 40);
  }

  const jobSkills = (job.skills || []).map(s => s.toLowerCase());
  let skillHits = 0;
  context.userSkills.forEach(sk => {
    if (jobSkills.includes(sk.toLowerCase())) skillHits++;
  });

  if (context.userSkills.length > 0) {
    score += Math.min((skillHits / context.userSkills.length) * 30, 30);
  }

  const jobLocation = (job.location || '').toLowerCase();
  if (context.locations.some(loc => jobLocation.includes(loc))) score += 20;

  const ageInDays = (Date.now() - new Date(job.createdAt)) / 86400000;
  if      (ageInDays < 2)  score += 10;
  else if (ageInDays < 7)  score += 7;
  else if (ageInDays < 14) score += 4;
  else if (ageInDays < 30) score += 1;

  return Math.round(score);
}

export async function getRecommendations(userId, limit = 10) {
  const context = await buildUserContext(userId);

  console.log('🔍 Context:', {
    keywords:  context.keywords,
    locations: context.locations,
    skills:    context.userSkills
  });

  if (context.keywords.length === 0 && context.locations.length === 0) {
    console.log('⚠️ Context empty — pehle kuch search karo');
    return [];
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const allJobs = await Job.find({
    status: 'open',
    createdAt: { $gte: thirtyDaysAgo }
  })
  .select('title company location skills salary jobType createdAt')
  .limit(300);

  console.log('💼 Total jobs in DB:', allJobs.length);

  const results = allJobs
    .map(job => ({ job, score: scoreJob(job, context) }))
    .filter(item => item.score > 10)   // 15 se 10 kiya — zyada results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  console.log('✅ Recommendations:', results.length);
  results.forEach(r => console.log(`  - ${r.job.title}: ${r.score} pts`));

  return results.map(item => ({
    ...item.job.toObject(),
    recommendationScore: item.score
  }));
}