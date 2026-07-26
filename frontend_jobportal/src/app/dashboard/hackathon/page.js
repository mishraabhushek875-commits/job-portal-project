'use client';

// ─────────────────────────────────────────────────────────────
// src/app/dashboard/hackathon/page.js — White theme
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconTrophy, IconCalendar, IconUsers, IconArrowRight, IconMapPin, IconBolt, IconLoader2 } from '@tabler/icons-react';
import api from '@/services/api';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  open:     { label: 'Registration Open', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  upcoming: { label: 'Coming Soon',       bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200'   },
  closed:   { label: 'Closed',            bg: 'bg-red-50',     text: 'text-red-500',     border: 'border-red-200'     },
};

export default function HackathonPage() {
  const [filter, setFilter] = useState('all');
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const res = await api.get('/hackathons');
      setHackathons(res.data.hackathons || []);
    } catch (err) {
      toast.error('Failed to load hackathons');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (h) => {
    try {
      await api.post(`/hackathons/${h._id}/register`);
      toast.success('Successfully registered for ' + h.title);
      fetchHackathons();
    } catch (err) {
      // Ignore "Pehle se register ho" error if they just want to open the link again
      if (err.response?.status !== 400) {
        toast.error(err.response?.data?.message || 'Failed to register');
      }
    }

    if (h.registrationLink) {
      window.open(h.registrationLink, '_blank');
    }
  };

  const filtered = hackathons.filter(h => filter === 'all' || h.status === filter);

  // Compute a distinct color based on title length or random hash so it looks nice
  const getThemeVars = (title) => {
    const themes = [
      { color: 'bg-blue-500', lightBg: 'bg-blue-50', textColor: 'text-blue-600' },
      { color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-600' },
      { color: 'bg-amber-500', lightBg: 'bg-amber-50', textColor: 'text-amber-600' },
      { color: 'bg-violet-500', lightBg: 'bg-violet-50', textColor: 'text-violet-600' }
    ];
    return themes[(title.length) % themes.length];
  };

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Hackathons</h1>
          <p className="text-sm mt-0.5 text-text-secondary">Competitions join karo — skills dikhao</p>
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'upcoming'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize border transition-all duration-200 ${
                filter === f
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-bg-card text-text-secondary border-border hover:border-blue-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Banner ────────────────────────────── */}
      <div className="rounded-2xl p-5 flex flex-col md:flex-row gap-6"
        style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
        {[
          { icon: IconTrophy, label: 'Total Prize Pool', value: '₹11L+' },
          { icon: IconUsers,  label: 'Participants',     value: '5L+'   },
          { icon: IconBolt,   label: 'Active Events',    value: hackathons.filter(h => h.status === 'open').length || 3 },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-card/15 flex items-center justify-center">
              <s.icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/70">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Cards Grid ──────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <IconLoader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-bg-card border border-border rounded-2xl">
          <p className="text-text-secondary font-medium">Koi hackathon match nahi kar raha.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((h, i) => {
            const status = STATUS_CFG[h.status] || STATUS_CFG['open'];
            const theme = getThemeVars(h.title);
            
            return (
              <motion.div
                key={h._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl p-5 bg-bg-card border border-border hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all duration-300 cursor-pointer"
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl ${theme.color} flex items-center justify-center text-white font-bold text-xl`}>
                    {h.organizer ? h.organizer.charAt(0) : 'H'}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${status.bg} ${status.text} ${status.border}`}>
                    {status.label}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-text-primary mb-1">{h.title}</h3>
                <p className="text-xs text-text-secondary mb-3">{h.organizer}</p>

                {/* Tags */}
                {h.tags && h.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {h.tags.map((tag, j) => (
                      <span key={j} className={`text-xs px-2 py-0.5 rounded-lg ${theme.lightBg} ${theme.textColor} border border-current/10`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { icon: IconTrophy,   label: 'Prize',        value: h.prize || 'Exciting Prizes' },
                    { icon: IconUsers,    label: 'Participants', value: `${h.participants || 0} enrolled` },
                    { icon: IconCalendar, label: 'Deadline',     value: new Date(h.deadline).toLocaleDateString() },
                    { icon: IconMapPin,   label: 'Mode',         value: h.mode },
                  ].map((item, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <item.icon size={12} className="text-text-secondary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-text-secondary">{item.label}</p>
                        <p className="text-xs font-medium text-text-primary truncate" title={item.value}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  onClick={() => handleRegister(h)}
                  disabled={h.status === 'closed'}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                    h.status === 'closed'
                      ? 'bg-bg-secondary text-text-secondary cursor-not-allowed'
                      : `${theme.color} text-white hover:opacity-90 hover:shadow-md`
                  }`}
                >
                  {h.status === 'closed' ? 'Closed' : 'Register Now'}
                  {h.status !== 'closed' && (h.registrationLink ? <IconArrowRight size={14} /> : null)}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}