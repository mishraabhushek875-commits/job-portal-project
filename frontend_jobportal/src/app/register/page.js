'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/slices/authSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Building2, UserCircle, Mail, Lock, CheckCircle2, ChevronLeft, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Multi-step form state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [role, setRole] = useState(''); // 'jobseeker' | 'recruiter'
  const [email, setEmail] = useState('');
  
  // Step 3 Data
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [pin, setPin] = useState('');

  // ── Handlers ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { email });
      if (res.data.success) {
        toast.success('OTP sent to your email!');
        setStep(3);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (pin.length < 4) return toast.error("PIN must be exactly 4 digits");
    if (role === 'recruiter' && !companyName) return toast.error("Company Name is required");

    setLoading(true);
    try {
      const payload = { role, email, otp, name, pin, companyName };
      const res = await api.post('/auth/register-pin', payload);
      
      if (res.data.success) {
        toast.success('Account created successfully!');
        dispatch(loginSuccess({
          user: res.data.user,
          token: res.data.token,
        }));
        router.push('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* ── LEFT BANNER (Animated Gradient) ── */}
        <div className="hidden md:flex w-1/2 relative flex-col justify-end p-12 overflow-hidden text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-indigo-400 to-purple-400 opacity-90 z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent z-0" />
          
          <AnimatedBackground />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-tr from-white/40 to-white/10 backdrop-blur-md border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-10 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-300/50 to-purple-400/50 blur-xl absolute" />
          </div>

          <div className="relative z-20">
            <h1 className="text-5xl font-display font-bold mb-2 tracking-tight">SMART AI<br/>ASSISTANCE</h1>
            <p className="text-white/80 text-sm mt-4 max-w-sm">
              Join thousands of professionals finding their dream careers through our AI platform.
            </p>
          </div>
        </div>

        {/* ── RIGHT FORM (Clean White UI) ── */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white relative">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8 px-2 relative">
            <div className="absolute top-[1rem] left-8 right-8 h-0.5 bg-slate-100 -z-0">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${(step - 1) * 50}%` }}
              />
            </div>
            {[1, 2, 3].map((num) => (
              <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all duration-300 ${
                step === num ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' :
                step > num ? 'bg-blue-500 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'
              }`}>
                {step > num ? <CheckCircle2 className="w-5 h-5" /> : num}
              </div>
            ))}
          </div>

          {/* ── STEP 1: ROLE SELECTION ── */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Create Account</h2>
              <p className="text-slate-500 text-sm mb-8">How would you like to use our platform?</p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setRole('jobseeker')}
                  className={`w-full flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    role === 'jobseeker' ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${role === 'jobseeker' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-500'}`}>
                    <UserCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${role === 'jobseeker' ? 'text-blue-900' : 'text-slate-700'}`}>I'm a Job Seeker</h3>
                    <p className="text-sm text-slate-500">Looking for jobs and career growth</p>
                  </div>
                </button>

                <button 
                  onClick={() => setRole('recruiter')}
                  className={`w-full flex items-center p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                    role === 'recruiter' ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${role === 'recruiter' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-500'}`}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${role === 'recruiter' ? 'text-indigo-900' : 'text-slate-700'}`}>I'm a Recruiter</h3>
                    <p className="text-sm text-slate-500">Hiring talent for my company</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!role}
                className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* ── STEP 2: EMAIL & SEND OTP ── */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <button onClick={() => setStep(1)} className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Verify Email</h2>
              <p className="text-slate-500 text-sm mb-8">We'll send a 6-digit code to this email.</p>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
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

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {loading ? 'Sending Code...' : 'Send OTP Code'}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 3: OTP, DETAILS & PIN ── */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <button onClick={() => setStep(2)} className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">Final Step</h2>
              <p className="text-slate-500 text-sm mb-6">Enter the OTP sent to <b className="text-slate-700">{email}</b>.</p>

              <form onSubmit={handleRegister} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">6-Digit OTP</label>
                    <input 
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="000000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 text-center tracking-[0.25em] font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Create 4-Digit PIN</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="password"
                        required
                        maxLength={4}
                        value={pin}
                        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-9 pr-3 text-center tracking-[0.25em] font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {role === 'recruiter' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Company / Organization Name</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        required
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        placeholder="e.g. Google, Microsoft"
                        className="w-full bg-indigo-50 border border-indigo-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || pin.length < 4 || otp.length < 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 mt-4"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </button>
              </form>
            </div>
          )}

          {step === 1 && (
            <p className="text-center text-sm text-slate-500 mt-8">
              Already have an account?{' '}
              <Link href="/login" className="text-slate-900 font-bold hover:underline">
                Sign in
              </Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
