'use client';

// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/interview/page.js
// Backend connected + Markdown rendering + Job Cards in chat
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconSend, IconRobot, IconUser, IconRefresh,
  IconLoader2, IconChevronDown, IconBriefcase,
  IconMapPin, IconCurrencyRupee, IconArrowRight,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '../../../../src/services/api';

const SUGGESTIONS = [
  'React jobs dikhao',
  'Node.js developer jobs Mumbai',
  'React ke hooks explain karo',
  'Node.js event loop kya hai?',
  'System design basics',
  'JavaScript closures',
  'MongoDB vs SQL',
  'Remote frontend jobs',
];

// ────────────────────────────────────────────────────────────
// Markdown renderer — no library needed
// ────────────────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let codeBlock = [];
  let inCode = false;
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCode) {
        elements.push(
          <pre key={key++} className="bg-slate-800 text-emerald-300 rounded-xl p-3 my-2 overflow-x-auto text-xs font-mono leading-relaxed">
            <code>{codeBlock.join('\n')}</code>
          </pre>
        );
        codeBlock = []; inCode = false;
      } else { inCode = true; }
      continue;
    }
    if (inCode) { codeBlock.push(line); continue; }

    if (line.startsWith('### ')) { elements.push(<p key={key++} className="font-bold text-sm mt-3 mb-1">{inlineFormat(line.slice(4))}</p>); continue; }
    if (line.startsWith('## '))  { elements.push(<p key={key++} className="font-bold text-base mt-3 mb-1">{inlineFormat(line.slice(3))}</p>); continue; }
    if (line.startsWith('# '))   { elements.push(<p key={key++} className="font-bold text-lg mt-3 mb-1">{inlineFormat(line.slice(2))}</p>); continue; }

    if (line.match(/^[\-\*] /)) {
      elements.push(
        <div key={key++} className="flex gap-2 my-0.5">
          <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
          <span>{inlineFormat(line.slice(2))}</span>
        </div>
      );
      continue;
    }
    if (line.match(/^\d+\. /)) {
      const m = line.match(/^(\d+)\. (.*)/);
      elements.push(
        <div key={key++} className="flex gap-2 my-0.5">
          <span className="text-blue-500 font-semibold flex-shrink-0 w-5">{m[1]}.</span>
          <span>{inlineFormat(m[2])}</span>
        </div>
      );
      continue;
    }
    if (line.trim() === '---' || line.trim() === '***') { elements.push(<hr key={key++} className="border-border my-2" />); continue; }
    if (line.trim() === '') { elements.push(<div key={key++} className="h-1" />); continue; }
    elements.push(<p key={key++} className="my-0.5 leading-relaxed">{inlineFormat(line)}</p>);
  }

  return <div className="text-sm space-y-0.5">{elements}</div>;
}

function inlineFormat(text) {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  let last = 0; let match; let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const raw = match[0];
    if (raw.startsWith('**'))     parts.push(<strong key={idx++} className="font-semibold">{raw.slice(2, -2)}</strong>);
    else if (raw.startsWith('`')) parts.push(<code key={idx++} className="bg-slate-100 text-blue-600 px-1 py-0.5 rounded text-xs font-mono">{raw.slice(1, -1)}</code>);
    else if (raw.startsWith('*')) parts.push(<em key={idx++} className="italic">{raw.slice(1, -1)}</em>);
    last = match.index + raw.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

// ────────────────────────────────────────────────────────────
// Mini Job Card — chat bubble ke andar
// ────────────────────────────────────────────────────────────
function MiniJobCard({ job }) {
  const router = useRouter();

  function formatSalary(salary) {
    if (!salary) return null;
    if (typeof salary === 'object') {
      const { min, max } = salary;
      if (min && max) return `₹${(min/1000).toFixed(0)}k–₹${(max/1000).toFixed(0)}k`;
      if (min) return `₹${(min/1000).toFixed(0)}k+`;
    }
    return String(salary);
  }

  const salary = formatSalary(job.salary);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => router.push(`/jobs/${job._id}`)}
      className="bg-bg-card border border-border hover:border-blue-300 hover:shadow-sm rounded-xl p-3 cursor-pointer transition-all duration-200 group"
    >
      {/* Company initial + title */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {job.company?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary truncate leading-tight">{job.title}</p>
          <p className="text-[10px] text-slate-400 truncate">{job.company}</p>
        </div>
        <IconArrowRight size={13} className="text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 flex-wrap">
        {job.location && (
          <span className="flex items-center gap-1 text-[10px] text-text-secondary">
            <IconMapPin size={10} className="text-slate-400" /> {job.location}
          </span>
        )}
        {salary && (
          <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
            <IconCurrencyRupee size={10} /> {salary}
          </span>
        )}
        {job.jobType && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium capitalize">
            {job.jobType}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// Message Bubble — text + optional job cards below
// ────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const hasJobs = !isUser && msg.jobs?.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? 'bg-blue-600' : 'bg-white border border-slate-200 shadow-sm'
      }`}>
        {isUser
          ? <IconUser  size={15} className="text-white"    />
          : <IconRobot size={15} className="text-blue-600" />
        }
      </div>

      {/* Bubble + job cards */}
      <div className={`flex flex-col gap-2 ${isUser ? 'items-end max-w-[75%]' : 'items-start max-w-[82%]'}`}>
        {/* Text bubble */}
        <div className={`px-4 py-3 rounded-2xl text-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-sm'
            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm'
        }`}>
          {isUser
            ? <p className="leading-relaxed">{msg.content}</p>
            : renderMarkdown(msg.content)
          }
        </div>

        {/* Job cards — sirf assistant messages mein */}
        {hasJobs && (
          <div className="w-full space-y-2">
            <p className="text-[10px] text-slate-400 flex items-center gap-1 px-1">
              <IconBriefcase size={10} /> {msg.jobs.length} relevant job{msg.jobs.length > 1 ? 's' : ''} mili
            </p>
            {msg.jobs.map((job, i) => (
              <MiniJobCard key={job._id || i} job={job} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        {msg.timestamp && (
          <span className="text-[10px] text-slate-300 px-1">
            {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// Typing dots
// ────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
        <IconRobot size={15} className="text-blue-600" />
      </div>
      <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm rounded-tl-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              className="w-2 h-2 rounded-full bg-blue-400"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────
export default function InterviewPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! 👋 Main tumhara **Interview Prep + Job Assistant** hoon.\n\nMujhse kuch bhi pucho:\n- Technical questions (React, Node.js, DSA)\n- **Job search** — "React jobs dikhao" ya "Mumbai mein Node.js jobs"\n- System design ya HR questions\n- Mock interview practice\n\nChalo shuru karte hain! 🚀',
      jobs:      [],
      timestamp: new Date(),
    },
  ]);
  const [input,           setInput]           = useState('');
  const [loading,         setLoading]         = useState(false);
  const [historyLoading,  setHistoryLoading]  = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // ── Load history ──────────────────────────────────────────
  async function loadHistory() {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setHistoryLoading(false); return; }

      const res = await api.get('/ai/interview/history');
      const data = res.data;

      if (data.success && data.messages?.length > 0) {
        setMessages(data.messages.map(m => ({
          role:      m.role,
          content:   m.content,
          // history mein jobs populated objects ya IDs ho sakti hain
          jobs:      Array.isArray(m.jobs) ? m.jobs : [],
          timestamp: m.createdAt,
        })));
        setShowSuggestions(false);
      }
    } catch {
      // silent fail — fresh start
    } finally {
      setHistoryLoading(false);
    }
  }

  // ── Send message ──────────────────────────────────────────
  async function sendMessage(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', content: msg, jobs: [], timestamp: new Date() }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/interview', { message: msg });
      const data = res.data;

      setMessages(prev => [...prev, {
        role:      'assistant',
        content:   data.reply || data.response || 'Kuch error aaya, dobara try karo!',
        // ✅ backend se aaye jobs — populated objects
        jobs:      Array.isArray(data.jobs) ? data.jobs : [],
        timestamp: new Date(),
      }]);

    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Server se connect nahi ho paya!');
      setMessages(prev => [...prev, {
        role:      'assistant',
        content:   '⚠️ Server se connect nahi ho paya. Dobara try karo.',
        jobs:      [],
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  // ── Reset ─────────────────────────────────────────────────
  function resetChat() {
    setMessages([{
      role:      'assistant',
      content:   'Naya session shuru hua! 🚀\n\nKya chahiye?\n- **Interview prep** — koi bhi technical ya HR question\n- **Job search** — "React jobs dikhao", "Remote jobs batao"',
      jobs:      [],
      timestamp: new Date(),
    }]);
    setShowSuggestions(true);
    setInput('');
    inputRef.current?.focus();
  }

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Interview Prep</h1>
          <p className="text-sm mt-0.5 text-slate-400">AI se practice karo • Jobs bhi dhundo</p>
        </div>
        <button
          onClick={resetChat}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-bg-card border border-border text-text-secondary hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
        >
          <IconRefresh size={14} /> Reset
        </button>
      </div>

      {/* ── Suggestions ─────────────────────────────── */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex gap-2 flex-wrap">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sendMessage(s)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSuggestions && (
        <button
          onClick={() => setShowSuggestions(true)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-500 mb-3 transition-colors self-start"
        >
          <IconChevronDown size={12} /> Suggestions dikhao
        </button>
      )}

      {/* ── Chat area ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl mb-4 bg-bg-card border border-border scroll-smooth">
        {historyLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <IconLoader2 size={16} className="animate-spin" />
              History load ho rahi hai...
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {loading && <TypingDots />}
          </>
        )}
        <div ref={endRef} />
      </div>

      {/* ── Input row ───────────────────────────────── */}
      <div className="flex gap-2 p-2 rounded-2xl bg-bg-card border border-border shadow-sm focus-within:border-blue-300 transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !loading && sendMessage()}
          placeholder="Interview question ya job search karo..."
          disabled={loading || historyLoading}
          className="flex-1 px-3 py-2 outline-none text-sm text-text-primary placeholder-slate-400 bg-transparent disabled:opacity-50"
        />
        <motion.button
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
          onClick={() => sendMessage()}
          disabled={!canSend}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
            canSend ? 'bg-blue-600 hover:bg-blue-500 shadow-sm shadow-blue-200' : 'bg-slate-100'
          }`}
        >
          {loading
            ? <IconLoader2 size={16} className="text-slate-400 animate-spin" />
            : <IconSend    size={16} className={canSend ? 'text-white' : 'text-slate-400'} />
          }
        </motion.button>
      </div>

      <p className="text-center text-xs text-slate-300 mt-2">
        Enter dabao ya button click karo • History auto-save hoti hai
      </p>
    </div>
  );
}