'use client';

// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/jobs/page.js
// Search results (left) + AI Recommendations sidebar (right)
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconSearch, IconX, IconBriefcase,
  IconAdjustments, IconMapPin, IconLoader2,
  IconRefresh, IconSparkles, IconArrowRight,
  IconCurrencyRupee, IconClock,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import { setJobs } from '../../../redux/slices/jobSlice';
import JobCard from '../../../components/JobCard';

const JOB_TYPES = ['full-time', 'part-time', 'remote', 'internship'];

// ────────────────────────────────────────────────────────────
// AI Recommendation Card — sidebar mein compact
// ────────────────────────────────────────────────────────────
function RecoCard({ job, index }) {
  const router = useRouter();

  function formatSalary(salary) {
    if (!salary) return null;
    if (typeof salary === 'object') {
      const { min, max } = salary;
      if (min && max) return `₹${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
      if (min) return `₹${(min / 1000).toFixed(0)}k+`;
    }
    return String(salary);
  }

  const salary = formatSalary(job.salary);

  // Match score — backend se aye ya calculate karo
  const score = job.matchScore || job.score || null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -2 }}
      onClick={() => router.push(`/dashboard/jobs/${job._id}`)}
      className="bg-bg-card border border-border hover:border-blue-300 hover:shadow-sm rounded-xl p-3.5 cursor-pointer transition-all duration-200 group"
    >
      {/* Match badge */}
      {score && (
        <div className="flex justify-end mb-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-100">
            {Math.round(score * 100)}% match
          </span>
        </div>
      )}

      {/* Company + title */}
      <div className="flex items-start gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {job.company?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary leading-snug line-clamp-2">{job.title}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{job.company}</p>
        </div>
        <IconArrowRight size={13} className="text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2">
        {job.location && (
          <span className="flex items-center gap-1 text-[10px] text-text-secondary">
            <IconMapPin size={9} /> {job.location}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
            <IconCurrencyRupee size={9} /> {salary}
          </span>
        )}
        {job.jobType && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 font-medium capitalize">
            {job.jobType}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// Skeleton for reco cards
// ────────────────────────────────────────────────────────────
function RecoSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-bg-card rounded-xl border border-border-glass p-3.5 animate-pulse space-y-2"
          style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-2.5 bg-slate-100 rounded w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-3 bg-slate-100 rounded w-16" />
            <div className="h-3 bg-slate-100 rounded w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────
export default function JobsPage() {
  const dispatch     = useDispatch();
  const router       = useRouter();
  const { jobs }     = useSelector(state => state.jobs);
  const searchParams = useSearchParams();

  const [loading,       setLoading]       = useState(true);
  const [keyword,       setKeyword]       = useState(searchParams.get('keyword') || '');
  const [location,      setLocation]      = useState('');
  const [selectedType,  setSelectedType]  = useState('');
  const [showFilter,    setShowFilter]    = useState(false);
  const [applying,      setApplying]      = useState(null);

  // AI recommendations state
  const [recos,      setRecos]      = useState([]);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoMsg,    setRecoMsg]    = useState('');  // "Pehle search karo" message

  // Debounce ref — search ke saath automatically recos update
  const recoTimer = useRef(null);

  // ── Fetch main jobs ──────────────────────────────────────
  const fetchJobs = useCallback(async (kw, loc, type) => {
    const k = kw   ?? keyword;
    const l = loc  ?? location;
    const t = type ?? selectedType;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (k) params.append('keyword',  k);
      if (l) params.append('location', l);
      if (t) params.append('jobType',  t);

      const res = await api.get(`/jobs?${params}`);
      dispatch(setJobs(res.data.jobs || []));
    } catch (err) {
      console.error('Jobs fetch error:', err);
      toast.error('Jobs load nahi hue!');
      dispatch(setJobs([]));
    } finally {
      setLoading(false);
    }
  }, [keyword, location, selectedType, dispatch]);

  // ── Fetch AI recommendations ─────────────────────────────
  const fetchRecommendations = useCallback(async () => {
    setRecoLoading(true);
    setRecoMsg('');
    try {
      const res  = await api.get('/jobs/ai/recommendations');
      const data = res.data;

      if (data.recommendations?.length > 0) {
        setRecos(data.recommendations);
      } else {
        setRecos([]);
        setRecoMsg(data.message || 'Kuch recommendations nahi hain abhi.');
      }
    } catch (err) {
      console.error('Reco error:', err);
      // 401 = not logged in, quietly skip
      if (err.response?.status !== 401) {
        setRecoMsg('Recommendations load nahi hue.');
      }
      setRecos([]);
    } finally {
      setRecoLoading(false);
    }
  }, []);

  // ── On mount ─────────────────────────────────────────────
  useEffect(() => {
    fetchJobs();
    fetchRecommendations();
  }, []);

  // ── Re-fetch recos after search (debounced 800ms) ────────
  // Jab search hota hai, backend SearchHistory save karta hai
  // Thodi der baad recommendations fresh ho jaati hain
  function triggerRecoRefresh() {
    clearTimeout(recoTimer.current);
    recoTimer.current = setTimeout(() => {
      fetchRecommendations();
    }, 1200);
  }

  // ── Apply ────────────────────────────────────────────────
  async function handleApply(jobId) {
    setApplying(jobId);
    try {
      await api.post(`/applications/${jobId}`, { coverLetter: 'I am interested.' });
      toast.success('Apply ho gaya! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Apply failed!');
    } finally {
      setApplying(null);
    }
  }

  // ── Search submit ─────────────────────────────────────────
  function handleSearch(e) {
    e.preventDefault();
    fetchJobs();
    triggerRecoRefresh(); // ← search ke baad recos refresh
  }

  // ── Clear all ─────────────────────────────────────────────
  function clearAll() {
    setKeyword(''); setLocation(''); setSelectedType(''); setShowFilter(false);
    fetchJobs('', '', '');
  }

  const hasFilters = keyword || location || selectedType;

  return (
    // ── Two-column layout: jobs left, AI sidebar right ──
    <div className="flex gap-6 items-start">

      {/* ════════════════════════════════════════════════
          LEFT — Main jobs section
      ════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Jobs Dhundo</h1>
            <p className="text-sm mt-0.5 text-slate-400">
              {loading ? 'Search ho rahi hai...' : `${jobs.length} job${jobs.length !== 1 ? 's' : ''} mile`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {hasFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-all"
                >
                  <IconX size={12} /> Clear
                </motion.button>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                showFilter
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-bg-card text-text-secondary border-border hover:border-blue-200'
              }`}
            >
              <IconAdjustments size={16} />
              Filters
              {selectedType && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="flex gap-2 p-1.5 rounded-2xl bg-bg-card border border-border shadow-sm focus-within:border-blue-200 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 px-3">
            <IconSearch size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Job title, company, skill..."
              className="flex-1 outline-none text-sm text-text-primary placeholder-slate-400 bg-transparent"
            />
            {keyword && (
              <button type="button" onClick={() => setKeyword('')}>
                <IconX size={14} className="text-slate-400 hover:text-text-secondary" />
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 border-l border-border-glass">
            <IconMapPin size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="City..."
              className="w-28 outline-none text-sm text-text-primary placeholder-slate-400 bg-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex-shrink-0 disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? <IconLoader2 size={14} className="animate-spin" /> : <IconSearch size={14} />}
            Search
          </button>
        </form>

        {/* Filters dropdown */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-bg-card border border-border">
                <p className="w-full text-xs font-medium text-text-secondary mb-1">Job Type:</p>
                {JOB_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? '' : type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all duration-200 ${
                      selectedType === type
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-bg-card text-text-secondary border-border hover:border-blue-300 hover:text-blue-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
                {selectedType && (
                  <button onClick={() => setSelectedType('')} className="px-3 py-1.5 rounded-lg text-xs text-red-500 flex items-center gap-1">
                    <IconX size={12} /> Clear
                  </button>
                )}
                <div className="w-full flex justify-end mt-2">
                  <button
                    onClick={() => { fetchJobs(); setShowFilter(false); triggerRecoRefresh(); }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                  >
                    Filter Apply Karo
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Jobs grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 rounded-2xl animate-pulse bg-blue-50/60 border border-blue-100"
                style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {jobs.map((job, i) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => router.push(`/dashboard/jobs/${job._id}`)}
                className="cursor-pointer"
              >
                <JobCard
                  job={job}
                  onApply={e => { e?.stopPropagation?.(); handleApply(job._id); }}
                  applying={applying === job._id}
                  showApplyBtn={true}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <IconBriefcase size={32} className="text-blue-300" />
            </div>
            <p className="font-semibold text-text-secondary">Koi job nahi mili</p>
            <p className="text-sm mt-1 text-slate-400 mb-5">
              {hasFilters ? 'Filters change karo ya search clear karo' : 'Koi job available nahi hai abhi'}
            </p>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors mx-auto"
              >
                <IconRefresh size={14} /> Filters Clear Karo
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* ════════════════════════════════════════════════
          RIGHT — AI Recommendations Sidebar
      ════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-72 flex-shrink-0 space-y-4 sticky top-4">

        {/* Sidebar header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <IconSparkles size={14} className="text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">AI Picks</p>
              <p className="text-[10px] text-slate-400">Tumhare searches ke basis pe</p>
            </div>
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchRecommendations}
            disabled={recoLoading}
            className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-slate-400 hover:text-violet-500 hover:border-violet-200 transition-all disabled:opacity-50"
            title="Refresh recommendations"
          >
            {recoLoading
              ? <IconLoader2 size={12} className="animate-spin" />
              : <IconRefresh size={12} />
            }
          </button>
        </div>

        {/* Reco content */}
        {recoLoading ? (
          <RecoSkeleton />
        ) : recos.length > 0 ? (
          <div className="space-y-3">
            {recos.map((job, i) => (
              <RecoCard key={job._id} job={job} index={i} />
            ))}
            <p className="text-[10px] text-center text-slate-300 pt-1">
              Search karo → better recommendations
            </p>
          </div>
        ) : (
          // Empty / message state
          <div className="bg-bg-card rounded-2xl border border-border-glass p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
              <IconSparkles size={18} className="text-violet-400" />
            </div>
            <p className="text-xs font-medium text-text-secondary mb-1">
              {recoMsg || 'Recommendations tayyar nahi hain'}
            </p>
            <p className="text-[10px] text-slate-400">
              Koi job search karo — AI tumhare liye similar jobs suggest karega
            </p>
          </div>
        )}

        {/* Divider + chatbot nudge */}
        <div className="pt-2 border-t border-border-glass">
          <button
            onClick={() => router.push('/interview')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-text-secondary bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-border-glass hover:border-blue-100 transition-all group"
          >
            <IconBriefcase size={13} className="group-hover:text-blue-500" />
            <span>AI se job tips lo →</span>
          </button>
        </div>
      </div>

    </div>
  );
}