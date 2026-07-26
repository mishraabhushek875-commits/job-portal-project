'use client';

// ─────────────────────────────────────────────────────────────
// src/components/JobCard.jsx
// White theme — transparent bluish cards
// Backend se aane wale job objects ke saath kaam karta hai
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import Link from 'next/link';

// Company letter se color decide karo
const LOGO_COLORS = {
  A: { bg: 'bg-red-100',    text: 'text-red-600' },
  B: { bg: 'bg-blue-100',   text: 'text-blue-600' },
  C: { bg: 'bg-purple-100', text: 'text-purple-600' },
  D: { bg: 'bg-green-100',  text: 'text-green-600' },
  F: { bg: 'bg-blue-100',   text: 'text-blue-600' },
  G: { bg: 'bg-blue-100',   text: 'text-blue-600' },
  I: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  M: { bg: 'bg-pink-100',   text: 'text-pink-600' },
  R: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  S: { bg: 'bg-orange-100', text: 'text-orange-600' },
  T: { bg: 'bg-sky-100',    text: 'text-sky-600' },
  Z: { bg: 'bg-violet-100', text: 'text-violet-600' },
  default: { bg: 'bg-blue-100', text: 'text-blue-600' },
};

function getLogoStyle(company = '') {
  const letter = company.charAt(0).toUpperCase();
  return LOGO_COLORS[letter] || LOGO_COLORS.default;
}

function timeAgo(dateString) {
  if (!dateString) return '';
  const days = Math.floor((Date.now() - new Date(dateString)) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} months ago`;
}

function getBadge(job) {
  const days = Math.floor((Date.now() - new Date(job.createdAt)) / 86400000);
  if (job.jobType === 'remote')
    return { text: '🌐 Remote', bg: 'bg-blue-50',   text2: 'text-blue-600',  border: 'border-blue-100' };
  if (days < 2)
    return { text: '✨ New',    bg: 'bg-amber-50',  text2: 'text-amber-600', border: 'border-amber-100' };
  if (days < 7)
    return { text: '🔥 Hot',   bg: 'bg-red-50',    text2: 'text-red-500',   border: 'border-red-100' };
  return null;
}

export default function JobCard({ job = {}, onApply, showApplyBtn = false }) {
  const [saved, setSaved] = useState(false);
  const logo  = getLogoStyle(job.company);
  const badge = getBadge(job);

  const salary = job.salary?.min
    ? `₹${job.salary.min}-${job.salary.max || '?'} LPA`
    : job.salary || 'Negotiable';

  return (
    <div className="group bg-bg-card/70 backdrop-blur-sm border border-blue-100/80 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/60 hover:-translate-y-1 hover:border-blue-200 flex flex-col gap-3">

      {/* Top — logo + badge + save */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 ${logo.bg} ${logo.text} rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0`}>
            {job.company?.charAt(0) || 'J'}
          </div>
          <div>
            <h3 className="font-bold text-sm text-text-primary leading-tight">
              {job.title || 'Job Title'}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {job.company || 'Company'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSaved(s => !s)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 text-base ${saved ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-300 hover:text-amber-400'}`}
        >
          {saved ? '★' : '☆'}
        </button>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-slate-100 text-text-secondary text-xs px-2.5 py-1 rounded-lg capitalize">
          {job.jobType || 'Full-time'}
        </span>
        {badge && (
          <span className={`${badge.bg} ${badge.text2} border ${badge.border} text-xs px-2.5 py-1 rounded-lg font-medium`}>
            {badge.text}
          </span>
        )}
        {job.recommendationScore && (
          <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-xs px-2.5 py-1 rounded-lg font-medium">
            🤖 {job.recommendationScore}% match
          </span>
        )}
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((skill, i) => (
            <span key={i} className="bg-blue-50 text-blue-600 border border-blue-100 text-xs px-2.5 py-1 rounded-lg">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-slate-400 text-xs px-1 py-1">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      {/* Bottom */}
      <div className="flex items-center justify-between pt-3 border-t border-border-glass mt-auto">
        <div>
          <div className="text-amber-500 font-bold text-sm">{salary}</div>
          <div className="text-slate-400 text-xs mt-0.5">
            📍 {job.location || 'Location'}
            {job.createdAt && <span className="ml-1.5">· {timeAgo(job.createdAt)}</span>}
          </div>
        </div>

        {showApplyBtn && onApply ? (
          <button
            onClick={() => onApply(job._id)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-blue-200"
          >
            Apply Now
          </button>
        ) : (
          <Link
            href={`/dashboard/jobs/${job._id || '#'}`}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-blue-200"
          >
            Apply Now
          </Link>
        )}
      </div>
    </div>
  );
}