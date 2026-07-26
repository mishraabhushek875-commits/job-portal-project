'use client';

// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/applications/page.js
// White theme
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconFileText, IconMapPin, IconClock, IconSearch, IconX, IconTrash, IconMessage } from '@tabler/icons-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import ChatModal from '../../../components/ChatModal';

// Status ka color config — white theme ke hisaab se
const STATUS = {
  pending:     { label: 'Pending',     bg: 'bg-amber-50',   text: 'text-amber-600',  border: 'border-amber-200'  },
  reviewed:    { label: 'Reviewed',    bg: 'bg-blue-50',    text: 'text-blue-600',   border: 'border-blue-200'   },
  shortlisted: { label: 'Shortlisted', bg: 'bg-emerald-50', text: 'text-emerald-600',border: 'border-emerald-200'},
  rejected:    { label: 'Rejected',    bg: 'bg-red-50',     text: 'text-red-500',    border: 'border-red-200'    },
};

// Company letter se color
const LOGO_BG = ['bg-blue-100 text-blue-600','bg-pink-100 text-pink-600','bg-emerald-100 text-emerald-600','bg-amber-100 text-amber-600','bg-violet-100 text-violet-600'];
function logoStyle(i) { return LOGO_BG[i % LOGO_BG.length]; }

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [search,       setSearch]       = useState('');
  const [selectedApp,  setSelectedApp]  = useState(null);
  const [chatData,     setChatData]     = useState(null);

  const fetchApps = () => {
    setLoading(true);
    api.get('/applications/my')
      .then(res => setApplications(res.data.applications || []))
      .catch(() => toast.error('Applications load nahi hue!'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleWithdraw = async (id) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.delete('/applications/' + id);
      toast.success('Application withdrawn successfully');
      setSelectedApp(null);
      fetchApps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    }
  };

  const filtered = applications.filter(app => {
    const okFilter = filter === 'all' || app.status === filter;
    const okSearch = !search ||
      app.job?.title?.toLowerCase().includes(search.toLowerCase()) ||
      app.job?.company?.toLowerCase().includes(search.toLowerCase());
    return okFilter && okSearch;
  });

  const counts = {
    all: applications.length,
    ...Object.fromEntries(
      Object.keys(STATUS).map(s => [s, applications.filter(a => a.status === s).length])
    ),
  };

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">My Applications</h1>
        <p className="text-sm mt-0.5 text-slate-400">{applications.length} total</p>
      </div>

      {/* ── Status Cards ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(STATUS).map(([key, cfg]) => (
          <motion.div
            key={key}
            whileHover={{ y: -2 }}
            onClick={() => setFilter(filter === key ? 'all' : key)}
            className={`rounded-2xl p-4 cursor-pointer border transition-all duration-200 ${
              filter === key
                ? `${cfg.bg} ${cfg.border}`
                : 'bg-bg-card border-border hover:border-slate-300'
            }`}
          >
            <p className={`text-2xl font-bold ${filter === key ? cfg.text : 'text-text-primary'}`}>
              {counts[key]}
            </p>
            <p className={`text-xs mt-1 ${filter === key ? cfg.text : 'text-slate-400'}`}>
              {cfg.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Search + Filter Tabs ─────────────────────── */}
      <div className="flex gap-3 flex-wrap">

        {/* Search input */}
        <div className="flex items-center gap-2 flex-1 min-w-48 px-4 py-2.5 rounded-xl bg-bg-card border border-border">
          <IconSearch size={16} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Job ya company search karo..."
            className="flex-1 outline-none text-sm text-text-primary placeholder-slate-400 bg-transparent"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', ...Object.keys(STATUS)].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize border transition-all duration-200 ${
                filter === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-bg-card text-text-secondary border-border hover:border-blue-300'
              }`}
            >
              {s} {s !== 'all' && `(${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ─────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse bg-blue-50/40 border border-blue-100" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((app, i) => {
            const cfg = STATUS[app.status] || STATUS.pending;
            return (
              <motion.div
                key={app._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelectedApp(app)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-bg-card border border-border hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
              >
                {/* Logo */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${logoStyle(i)}`}>
                  {app.job?.company?.charAt(0) || 'C'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-text-primary truncate">
                    {app.job?.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-slate-400">{app.job?.company}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <IconMapPin size={10} /> {app.job?.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <IconClock size={10} />
                      {new Date(app.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex-shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  {cfg.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <IconFileText size={28} className="text-blue-300" />
          </div>
          <p className="font-medium text-text-secondary">
            {filter === 'all' ? 'Koi application nahi' : `Koi ${filter} application nahi`}
          </p>
        </div>
      )}

      {/* ── Details Modal ───────────────────────────── */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-bold text-text-primary">Application Details</h3>
                <button onClick={() => setSelectedApp(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <IconX size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                <div>
                  <p className="text-xs text-text-secondary">Job Title</p>
                  <p className="font-semibold text-sm text-text-primary">{selectedApp.job?.title}</p>
                </div>
                
                <div>
                  <p className="text-xs text-text-secondary">Company</p>
                  <p className="font-medium text-sm text-text-primary">{selectedApp.job?.company}</p>
                </div>

                <div>
                  <p className="text-xs text-text-secondary">Status</p>
                  <span className={`inline-block px-3 py-1 mt-1 rounded-full text-xs font-semibold border ${STATUS[selectedApp.status]?.bg || 'bg-slate-50'} ${STATUS[selectedApp.status]?.text || 'text-slate-500'}`}>
                    {STATUS[selectedApp.status]?.label || selectedApp.status}
                  </span>
                </div>

                {selectedApp.coverLetter && (
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Cover Letter</p>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-border text-sm text-text-primary whitespace-pre-wrap">
                      {selectedApp.coverLetter}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-4 border-t border-border bg-slate-50 dark:bg-slate-800/50">
                <button onClick={() => setSelectedApp(null)} className="px-4 py-2 rounded-xl text-sm font-medium border border-border text-text-secondary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Close
                </button>
                {selectedApp.status === 'pending' && (
                  <button onClick={() => handleWithdraw(selectedApp._id)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                    <IconTrash size={16} /> Withdraw
                  </button>
                )}
                <button 
                  onClick={() => setChatData({ recipient: selectedApp.job?.recruiter || selectedApp.job?.postedBy, jobId: selectedApp.job?._id })} 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-brand-color text-white hover:bg-blue-600 transition-colors"
                >
                  <IconMessage size={16} /> Chat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ChatModal 
        isOpen={!!chatData}
        onClose={() => setChatData(null)}
        recipient={chatData?.recipient}
        jobId={chatData?.jobId}
      />
    </div>
  );
}