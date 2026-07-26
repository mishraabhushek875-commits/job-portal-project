'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconMessageCircle, IconX, IconSend,
  IconRobot, IconUser, IconRefresh,
  IconSparkles,
} from '@tabler/icons-react';
import api from '../services/api';

const suggestions = [
  'React jobs dikhao',
  'Interview tips do',
  'Resume kaise banayein?',
  'DSA kahan se shuru karein?',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Namaste! 👋 Main JP Assistant hoon. Jobs dhundne ya interview prep mein help kar sakta hoon!',
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ─── Auto scroll ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Focus input when open ───
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    });

  // ─── Send Message ───
  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;

    setInput('');
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMsg,
      time: new Date(),
    }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setMessages(prev => [...prev, {
        role: 'bot',
        content: res.data.reply || res.data.message,
        time: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: err.response?.status === 429
          ? 'AI abhi busy hai, thodi der mein try karo! ⏳'
          : 'Kuch error aaya — dobara try karo! 🔄',
        time: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'bot',
      content: 'Naya session shuru! Kya poochna hai? 🚀',
      time: new Date(),
    }]);
  };

  return (
    <>
      {/* ─── Floating Button ─── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          boxShadow: '0 8px 25px rgba(79,70,229,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isOpen ? 'close' : 'open'}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isOpen
              ? <IconX size={22} className="text-white" />
              : <IconMessageCircle size={22} className="text-white" />
            }
          </motion.div>
        </AnimatePresence>

        {/* Online dot */}
        {!isOpen && (
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white"
            style={{ background: '#10b981' }}
          />
        )}
      </motion.button>

      {/* ─── Chat Panel ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-24 right-6 w-80 md:w-96 rounded-2xl overflow-hidden z-50 flex flex-col"
            style={{
              maxHeight: '480px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '0.5px solid rgba(255,255,255,0.3)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <IconRobot size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">JP Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                      Online · Ready to help
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={clearChat}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <IconRefresh size={14} className="text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <IconX size={14} className="text-white" />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-3 space-y-3"
              style={{ background: 'white', minHeight: '260px', maxHeight: '300px' }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: msg.role === 'bot' ? '#eef2ff' : '#4f46e5',
                    }}
                  >
                    {msg.role === 'bot'
                      ? <IconRobot size={14} style={{ color: '#4f46e5' }} />
                      : <IconUser size={14} className="text-white" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-xs ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                      style={{
                        background: msg.role === 'bot'
                          ? msg.isError ? '#fee2e2' : '#f8faff'
                          : '#4f46e5',
                        color: msg.role === 'bot'
                          ? msg.isError ? '#991b1b' : '#0f172a'
                          : 'white',
                        borderBottomLeftRadius: msg.role === 'bot' ? '4px' : '16px',
                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                        border: msg.role === 'bot' ? '0.5px solid #e2e8f0' : 'none',
                      }}
                    >
                      {msg.content}
                    </div>
                    <p className="text-xs mt-1 px-1"
                      style={{ color: '#94a3b8' }}>
                      {formatTime(msg.time)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: '#eef2ff' }}>
                    <IconRobot size={14} style={{ color: '#4f46e5' }} />
                  </div>
                  <div className="px-3 py-2 rounded-2xl"
                    style={{ background: '#f8faff', border: '0.5px solid #e2e8f0' }}>
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: '#4f46e5' }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="px-3 py-2 flex gap-2 flex-wrap"
                style={{ background: 'white', borderTop: '0.5px solid #f1f5f9' }}>
                {suggestions.map((s, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendMessage(s)}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: '#eef2ff',
                      color: '#4f46e5',
                      border: '0.5px solid #c7d2fe',
                    }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              className="flex gap-2 p-3"
              style={{ background: 'white', borderTop: '0.5px solid #e2e8f0' }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Kuch bhi pucho..."
                className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: '#f8faff',
                  border: '0.5px solid #e2e8f0',
                  color: '#0f172a',
                }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: input.trim() ? '#4f46e5' : '#f1f5f9',
                }}
              >
                <IconSend
                  size={16}
                  style={{ color: input.trim() ? 'white' : '#94a3b8' }}
                />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}