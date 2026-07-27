'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Mail, Lock, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

// ─────────────────────────────────────────────────────────────
// ANIMATED BACKGROUND (Fireflies / Bubbles for Left Banner)
// ─────────────────────────────────────────────────────────────
function AnimatedBackground() {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const newBubbles = [...Array(15)].map((_, i) => ({
      id: i,
      size: Math.random() * 30 + 10,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5,
      isFirefly: Math.random() > 0.5,
    }));
    setBubbles(newBubbles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className={`absolute rounded-full ${
            b.isFirefly ? "bg-amber-300/40 shadow-[0_0_15px_rgba(251,191,36,0.6)]" : "bg-blue-400/20"
          }`}
          style={{ width: b.size, height: b.size, left: b.left, top: b.top }}
          animate={{
            y: [0, -100 - Math.random() * 100],
            x: [0, (Math.random() - 0.5) * 50],
            opacity: [0, 0.8, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: b.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: b.delay,
          }}
        />
      ))}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot/Set PIN state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // ── Main Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login-pin', { email, pin });
      if (res.data.success) {
        dispatch(loginSuccess({
          user: res.data.user,
          token: res.data.token,
        }));
        toast.success(`Welcome back, ${res.data.user.name}!`);
        router.push('/dashboard');
      }
    } catch (err) {
      if (err.response?.data?.action === 'REQUIRE_PIN_SETUP') {
        // Old user without PIN -> Trigger PIN setup
        toast.error("PIN not set. Please set your PIN now.");
        handleTriggerForgotPin(true);
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Trigger Forgot PIN (Sends OTP directly if email is provided) ──
  const handleTriggerForgotPin = async (isMigration = false) => {
    if (!email) {
      toast.error('Please enter your email first to reset PIN.');
      return;
    }
    
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { email });
      if (res.data.success) {
        toast.success(isMigration ? 'OTP sent! Please set your new PIN.' : 'OTP sent to your email.');
        setIsForgotModalOpen(true); // Open modal directly to Step 2 (Enter OTP & New PIN)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Reset/Set PIN ──
  const handleResetPin = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/reset-pin', { 
        email, 
        otp, 
        newPin 
      });
      if (res.data.success) {
        toast.success('PIN set successfully!');
        dispatch(loginSuccess({
          user: res.data.user,
          token: res.data.token,
        }));
        router.push('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set PIN');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] flex items-center justify-center p-4">
      {/* Main Split Screen Container */}
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* ── LEFT BANNER (Animated Gradient) ── */}
        <div className="hidden md:flex w-1/2 relative flex-col justify-end p-12 overflow-hidden text-white">
          {/* Gradient Background matching reference but Blue/Purple */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-400 opacity-90 z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent z-0" />
          
          <AnimatedBackground />

          {/* 3D Orb Placeholder (Glassmorphism circle) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-tr from-white/40 to-white/10 backdrop-blur-md border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-10 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-300/50 to-purple-400/50 blur-xl absolute" />
          </div>

          <div className="relative z-20">
            <h1 className="text-5xl font-display font-bold mb-2 tracking-tight">SMART AI<br/>ASSISTANCE</h1>
            <p className="text-white/80 text-sm mt-4 max-w-sm">
              Experience smarter career matching with AI-powered personalized job recommendations.
            </p>
          </div>
        </div>

        {/* ── RIGHT FORM (Clean White UI) ── */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white relative">
          
          {/* Logo icon */}
          <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full" />
          </div>

          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to access your dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* PIN Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">4-Digit PIN</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  required
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))} // only numbers
                  placeholder="••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 tracking-[0.5em] font-mono text-lg text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            </div>

            {/* Links */}
            <div className="flex justify-between items-center text-sm px-1 pt-1 pb-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                Remember me
              </label>
              <button 
                type="button" 
                onClick={() => handleTriggerForgotPin(false)}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Forgot PIN?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || pin.length < 4}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Social / Divider */}
          <div className="relative flex items-center py-6 mt-2">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">Or Continue With</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-3 rounded-xl transition-all">
            <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={20} height={20} className="w-5 h-5" />
            Google
          </button>

          <p className="text-center text-sm text-slate-500 mt-8">
            Don't have an account?{' '}
            <Link href="/register" className="text-slate-900 font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* ── Forgot PIN Modal (Directly asks for OTP & New PIN) ── */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8 text-slate-900">
              <h3 className="text-xl font-bold font-display mb-1">Set New PIN</h3>
              <p className="text-slate-500 text-sm mb-6">
                Enter the 6-digit OTP sent to <b className="text-slate-700">{email}</b> to set your new PIN.
              </p>

              <form onSubmit={handleResetPin} className="space-y-4">
                <input 
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="6-Digit OTP"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center tracking-[0.25em] font-mono text-lg focus:bg-white focus:border-blue-500 outline-none"
                />
                <input 
                  type="password"
                  required
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="New 4-Digit PIN"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center tracking-[0.5em] font-mono text-xl focus:bg-white focus:border-blue-500 outline-none mt-2"
                />
                <button
                  type="submit"
                  disabled={forgotLoading || newPin.length < 4 || otp.length < 6}
                  className="w-full bg-blue-600 text-white font-medium py-3.5 rounded-xl hover:bg-blue-700 transition-colors mt-4 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {forgotLoading ? 'Setting PIN...' : 'Set PIN & Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
