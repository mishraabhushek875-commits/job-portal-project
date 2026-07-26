'use client';

// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/jobs/[id]/page.js
// Job detail page — API se data fetch karo
// Route: /jobs/:id
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  IconArrowLeft, IconBriefcase, IconMapPin, IconClock,
  IconCurrencyRupee, IconBuilding, IconUsers, IconCalendar,
  IconCheck, IconLoader2, IconBookmark, IconShare,
  IconExternalLink, IconAlertCircle,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';
import api from '../../../../services/api';

// ── Badge component ─────────────────────────────────────────
function Badge({ children, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50   text-blue-600   border-blue-100',
    green:  'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:  'bg-amber-50  text-amber-600  border-amber-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    slate:  'bg-slate-50  text-text-secondary  border-border-glass',
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
}

// ── Job type → color mapping ─────────────────────────────────
function getTypeColor(type = '') {
  const map = {
    'full-time':  'green',
    'part-time':  'amber',
    'remote':     'violet',
    'internship': 'blue',
  };
  return map[type.toLowerCase()] || 'slate';
}

// ── Info Row ────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={15} className="text-blue-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-text-primary mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function JobDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();

  const [job,      setJob]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied,  setApplied]  = useState(false);
  const [error,    setError]    = useState('');
  const [applicantsCount, setApplicantsCount] = useState(0);

  // ── Fetch job ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetchJob();
  }, [id]);

  async function fetchJob() {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch job details
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.job || res.data);
      if (res.data.applicantsCount !== undefined) {
        setApplicantsCount(res.data.applicantsCount);
      }

      // 2. Check if already applied
      try {
        const checkRes = await api.get(`/applications/check/${id}`);
        if (checkRes.data.applied) {
          setApplied(true);
        }
      } catch (checkErr) {
        console.error('Check apply error:', checkErr);
      }
      
    } catch (err) {
      console.error('Job fetch error:', err);
      setError(err.response?.status === 404
        ? 'Yeh job available nahi hai ya remove ho gayi.'
        : 'Job load nahi ho payi. Network check karo.'
      );
    } finally {
      setLoading(false);
    }
  }

  // ── Apply ─────────────────────────────────────────────────
  async function handleApply() {
    if (applied || applying) return;
    setApplying(true);
    try {
      await api.post(`/applications/${id}`, {
        coverLetter: 'I am interested in this position.',
      });
      setApplied(true);
      toast.success('Apply ho gaya! 🎉 Best of luck!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Apply nahi ho paya!';
      if (msg.toLowerCase().includes('already')) {
        setApplied(true);
        toast('Tumne pehle se apply kiya hua hai! 👍', { icon: 'ℹ️' });
      } else {
        toast.error(msg);
      }
    } finally {
      setApplying(false);
    }
  }

  // ── Share ─────────────────────────────────────────────────
  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: job?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copy ho gaya!');
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  function formatDate(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  function formatSalary(salary) {
    if (!salary) return null;
    if (typeof salary === 'object') {
      const { min, max, currency = '₹' } = salary;
      if (min && max) return `${currency}${min.toLocaleString()} – ${currency}${max.toLocaleString()}`;
      if (min) return `${currency}${min.toLocaleString()}+`;
    }
    return String(salary);
  }

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Back button skeleton */}
        <div className="h-9 w-28 rounded-xl bg-slate-100 animate-pulse" />
        {/* Main card skeleton */}
        <div className="bg-bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-blue-50 rounded-lg animate-pulse" />
                <div className="h-6 w-20 bg-blue-50 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${75 + i * 5}%` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
          <IconArrowLeft size={16} /> Wapas jao
        </button>
        <div className="text-center py-20 bg-bg-card rounded-2xl border border-border">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <IconAlertCircle size={28} className="text-red-400" />
          </div>
          <p className="font-semibold text-text-primary">{error || 'Job nahi mili'}</p>
          <div className="flex gap-3 justify-center mt-5">
            <button onClick={() => router.back()} className="px-4 py-2 rounded-xl text-sm text-text-secondary bg-slate-100 hover:bg-slate-200 transition-colors">
              Wapas jao
            </button>
            <button onClick={fetchJob} className="px-4 py-2 rounded-xl text-sm text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2">
              <IconLoader2 size={14} /> Dobara try karo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const salaryText  = formatSalary(job.salary);
  const postedDate  = formatDate(job.createdAt);
  const deadlineDate = formatDate(job.applicationDeadline || job.deadline);

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-8">

      {/* ── Back nav ──────────────────────────────────── */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-blue-600 transition-colors"
      >
        <IconArrowLeft size={16} /> Wapas Jobs pe
      </motion.button>

      {/* ── Hero card ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card rounded-2xl border border-border p-6"
      >
        <div className="flex items-start gap-4">
          {/* Company logo / initials */}
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {job.company?.charAt(0)?.toUpperCase() || <IconBuilding size={28} />}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-text-primary leading-tight">{job.title}</h1>
            <p className="text-text-secondary text-sm mt-1">{job.company}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {job.jobType && <Badge color={getTypeColor(job.jobType)}>{job.jobType}</Badge>}
              {job.location && (
                <Badge color="slate">
                  <span className="flex items-center gap-1">
                    <IconMapPin size={10} /> {job.location}
                  </span>
                </Badge>
              )}
              {job.experienceLevel && <Badge color="amber">{job.experienceLevel}</Badge>}
            </div>
          </div>

          {/* Action buttons top */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all"
            >
              <IconShare size={15} />
            </button>
            <button className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all">
              <IconBookmark size={15} />
            </button>
          </div>
        </div>

        {/* Quick info row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-slate-50 rounded-xl">
          {salaryText && (
            <div className="flex items-center gap-2">
              <IconCurrencyRupee size={16} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Salary</p>
                <p className="text-xs font-semibold text-text-primary">{salaryText}</p>
              </div>
            </div>
          )}
          {job.openings && (
            <div className="flex items-center gap-2">
              <IconUsers size={16} className="text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Openings</p>
                <p className="text-xs font-semibold text-text-primary">{job.openings}</p>
              </div>
            </div>
          )}
          {postedDate && (
            <div className="flex items-center gap-2">
              <IconCalendar size={16} className="text-violet-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Posted</p>
                <p className="text-xs font-semibold text-text-primary">{postedDate}</p>
              </div>
            </div>
          )}
          {deadlineDate && (
            <div className="flex items-center gap-2">
              <IconClock size={16} className="text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Deadline</p>
                <p className="text-xs font-semibold text-text-primary">{deadlineDate}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Main content + Sidebar ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left: Description ──────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Job description */}
          {job.description && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <IconBriefcase size={16} className="text-blue-500" /> Job Description
              </h2>
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </motion.div>
          )}

          {/* Skills required */}
          {job.skills?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="text-sm font-bold text-text-primary mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.04 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Requirements / Responsibilities */}
          {(job.requirements?.length > 0 || job.responsibilities?.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-bg-card rounded-2xl border border-border p-6 space-y-5"
            >
              {job.requirements?.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-text-primary mb-3">Requirements</h2>
                  <ul className="space-y-2">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <IconCheck size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {job.responsibilities?.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-text-primary mb-3">Responsibilities</h2>
                  <ul className="space-y-2">
                    {job.responsibilities.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <IconCheck size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* ── Right: Sidebar ─────────────────────────── */}
        <div className="space-y-4">

          {/* Apply card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-bg-card rounded-2xl border border-border p-5 sticky top-4"
          >
            <motion.button
              whileHover={!applied && !applying ? { scale: 1.02 } : {}}
              whileTap={!applied && !applying ? { scale: 0.98 } : {}}
              onClick={handleApply}
              disabled={applying || applied}
              className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
                applied
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-200'
              }`}
            >
              {applying ? (
                <><IconLoader2 size={16} className="animate-spin" /> Apply ho raha hai...</>
              ) : applied ? (
                <><IconCheck size={16} /> Applied! 🎉</>
              ) : (
                <><IconExternalLink size={16} /> Abhi Apply Karo</>
              )}
            </motion.button>

            {applied && (
              <p className="text-xs text-center text-slate-400 mt-2">
                Tumne is job ke liye apply kar diya hai ✅
              </p>
            )}

            <p className="text-xs text-center text-slate-400 mt-3">
              {applicantsCount} logon ne apply kiya
            </p>
          </motion.div>

          {/* Company details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-bg-card rounded-2xl border border-border p-5"
          >
            <h3 className="text-xs font-bold text-text-primary mb-3 uppercase tracking-wide">Job Details</h3>
            <InfoRow icon={IconBuilding}       label="Company"         value={job.company} />
            <InfoRow icon={IconMapPin}         label="Location"        value={job.location} />
            <InfoRow icon={IconBriefcase}      label="Job Type"        value={job.jobType} />
            <InfoRow icon={IconUsers}          label="Experience"      value={job.experienceLevel} />
            <InfoRow icon={IconCurrencyRupee}  label="Salary"          value={salaryText} />
            <InfoRow icon={IconCalendar}       label="Posted On"       value={postedDate} />
            <InfoRow icon={IconClock}          label="Last Date"       value={deadlineDate} />
          </motion.div>

          {/* Recruiter info */}
          {job.postedBy && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-bg-card rounded-2xl border border-border p-5"
            >
              <h3 className="text-xs font-bold text-text-primary mb-3 uppercase tracking-wide">Posted By</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {(job.postedBy.name || job.postedBy.email || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{job.postedBy.name || 'Recruiter'}</p>
                  {job.postedBy.email && (
                    <p className="text-xs text-slate-400">{job.postedBy.email}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}