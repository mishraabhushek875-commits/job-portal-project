'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCode, IconChevronDown, IconChevronUp, IconCheck, IconFlame, IconLoader2 } from '@tabler/icons-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const DIFF = {
  Easy:   { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  Medium: { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100'   },
  Hard:   { bg: 'bg-red-50',     text: 'text-red-500',     border: 'border-red-100'     },
};

const TOPIC_COLORS = {
  'Arrays & Strings':    { color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100',   bar: 'bg-blue-500'   },
  'Linked Lists':        { color: 'text-emerald-600', bg: 'bg-emerald-50',border: 'border-emerald-100',bar: 'bg-emerald-500' },
  'Trees & Graphs':      { color: 'text-amber-600',   bg: 'bg-amber-50',  border: 'border-amber-100',  bar: 'bg-amber-500'  },
  'Dynamic Programming': { color: 'text-violet-600',  bg: 'bg-violet-50', border: 'border-violet-100', bar: 'bg-violet-500' },
};

export default function DSAPage() {
  const [topics,    setTopics]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toggling,  setToggling]  = useState(null); // kaunsa question toggle ho raha hai
  const [expanded,  setExpanded]  = useState('Arrays & Strings');

  // Page load pe DB se progress lo
  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    try {
      const res = await api.get('/dsa/progress');
      setTopics(res.data.topics);
    } catch {
      toast.error('Progress load nahi hua!');
    } finally {
      setLoading(false);
    }
  }

  // Question toggle karo — DB mein save
  async function toggleSolved(category, questionTitle) {
    // Unique key — kaunsa toggle ho raha hai
    const key = `${category}-${questionTitle}`;
    setToggling(key);

    try {
      const res = await api.put('/dsa/toggle', { category, questionTitle });

      // Local state update karo
      setTopics(prev =>
        prev.map(topic => {
          if (topic.category !== category) return topic;
          return {
            ...topic,
            questions: topic.questions.map(q => {
              if (q.title !== questionTitle) return q;
              return { ...q, solved: res.data.solved };
            }),
          };
        })
      );

      if (res.data.solved) toast.success('Solved! 🎉');

    } catch {
      toast.error('Save nahi hua — dobara try karo');
    } finally {
      setToggling(null);
    }
  }

  // Stats calculate karo
  const allQs      = topics.flatMap(t => t.questions);
  const totalSolved = allQs.filter(q => q.solved).length;
  const total       = allQs.length;
  const pct         = total > 0 ? Math.round((totalSolved / total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-slate-400">
          <IconLoader2 size={20} className="animate-spin" />
          Loading progress...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">DSA Practice</h1>
          <p className="text-sm mt-0.5 text-slate-400">Interview ke liye taiyari karo</p>
        </div>

        {/* Progress card */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-bg-card border border-border shadow-sm">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
            <IconFlame size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">{totalSolved}/{total} Solved</p>
            <div className="w-32 h-1.5 rounded-full bg-slate-100 mt-1">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-bold text-blue-600">{pct}%</span>
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-3">
        {topics.map((topic) => {
          const colors   = TOPIC_COLORS[topic.category] || TOPIC_COLORS['Arrays & Strings'];
          const solved   = topic.questions.filter(q => q.solved).length;
          const isOpen   = expanded === topic.category;
          const topicPct = Math.round((solved / topic.questions.length) * 100);

          return (
            <motion.div
              key={topic.category}
              layout
              className="rounded-2xl overflow-hidden bg-bg-card border border-border"
            >
              {/* Topic header */}
              <button
                onClick={() => setExpanded(isOpen ? '' : topic.category)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                    <IconCode size={18} className={colors.color} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-text-primary">{topic.category}</p>
                    <p className="text-xs mt-0.5 text-slate-400">{solved}/{topic.questions.length} solved</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 rounded-full bg-slate-100 hidden md:block">
                    <div
                      className={`h-full rounded-full ${colors.bar} transition-all duration-500`}
                      style={{ width: `${topicPct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold hidden md:block ${colors.color}`}>{topicPct}%</span>
                  {isOpen
                    ? <IconChevronUp   size={16} className="text-slate-400" />
                    : <IconChevronDown size={16} className="text-slate-400" />
                  }
                </div>
              </button>

              {/* Questions */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 space-y-2 border-t border-border-glass">
                      {topic.questions.map((q) => {
                        const diff    = DIFF[q.difficulty];
                        const key     = `${topic.category}-${q.title}`;
                        const loading = toggling === key;

                        return (
                          <motion.div
                            key={q.title}
                            whileHover={{ x: 3 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-border-glass"
                          >
                            <div className="flex items-center gap-3">
                              {/* Checkbox */}
                              <button
                                onClick={() => !loading && toggleSolved(topic.category, q.title)}
                                disabled={loading}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                                  q.solved
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-bg-card border-border hover:border-blue-300'
                                }`}
                              >
                                {loading
                                  ? <IconLoader2 size={12} className="animate-spin text-slate-400" />
                                  : q.solved
                                    ? <IconCheck size={14} className="text-emerald-600" />
                                    : null
                                }
                              </button>

                              <a
                                href={q.leetCodeUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm hover:underline ${q.solved ? 'text-slate-400 line-through' : 'text-text-primary hover:text-blue-500'}`}
                              >
                                {q.title}
                              </a>
                            </div>

                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${diff.bg} ${diff.text} ${diff.border}`}>
                              {q.difficulty}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}