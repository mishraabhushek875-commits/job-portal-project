import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconSend, IconLoader } from '@tabler/icons-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../services/api';
import socket from '../socket/socket';

export default function ChatModal({ isOpen, onClose, recipient, jobId }) {
  const { user } = useSelector(state => state.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !recipient || !jobId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/chat/${jobId}/${recipient._id || recipient.id}`);
        setMessages(res.data.messages || []);
      } catch (error) {
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [isOpen, recipient, jobId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleReceiveMessage = (data) => {
      if (data.sender === (recipient._id || recipient.id)) {
        setMessages(prev => [...prev, data]);
      }
    };

    socket.on('receive_direct_message', handleReceiveMessage);
    return () => socket.off('receive_direct_message', handleReceiveMessage);
  }, [isOpen, recipient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      content: input,
      sender: user.id || user._id,
      receiver: recipient._id || recipient.id,
      jobId,
      createdAt: new Date()
    };

    // Optimistic UI update
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    try {
      // API call to save in DB
      await api.post('/chat', {
        receiverId: recipient._id || recipient.id,
        jobId,
        content: newMsg.content
      });

      // Send via socket for real-time delivery
      socket.emit('send_direct_message', {
        receiverId: recipient._id || recipient.id,
        message: newMsg.content,
        sender: user.id || user._id,
        jobId,
        createdAt: newMsg.createdAt
      });
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col h-[500px] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <h3 className="font-bold text-slate-800">Chat with {recipient?.name}</h3>
              <p className="text-xs text-slate-500">{recipient?.role === 'jobseeker' ? 'Candidate' : 'Recruiter'}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
              <IconX size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <IconLoader className="animate-spin text-blue-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-slate-400 text-sm">
                No messages yet. Send a message to start!
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender === (user.id || user._id);
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-slate-800 rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={sendMessage} className="p-3 border-t bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full text-sm outline-none focus:border-blue-600"
            />
            <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center">
              <IconSend size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
