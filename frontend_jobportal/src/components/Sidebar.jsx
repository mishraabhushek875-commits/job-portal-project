'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Briefcase, FileText, User,
  Code, MessageCircle, Trophy,
  Settings, LogOut, ChevronRight,
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import socket from '../socket/socket';

// Jobseeker items
const jobseekerNavItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Briefcase, label: 'Jobs', path: '/dashboard/jobs' },
  { icon: FileText, label: 'My Applications', path: '/dashboard/applications' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
];

const jobseekerBottomItems = [
  { icon: Code, label: 'DSA Practice', path: '/dashboard/dsa' },
  { icon: MessageCircle, label: 'Interview Prep', path: '/dashboard/interview' },
  { icon: Trophy, label: 'Hackathon', path: '/dashboard/hackathon' },
];

// Recruiter items
const recruiterNavItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase, label: 'My Jobs', path: '/dashboard/recruiter/myjobs' },
  { icon: FileText, label: 'Post a Job', path: '/dashboard/recruiter/post-job' },
  { icon: User, label: 'Profile', path: '/dashboard/profile' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector(state => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    socket.disconnect();
    router.push('/login');
  };

  const isRecruiter = user?.role === 'recruiter';
  const currentNavItems = isRecruiter ? recruiterNavItems : jobseekerNavItems;
  const currentBottomItems = isRecruiter ? [] : jobseekerBottomItems;

  return (
    <>
      {/* ─── Overlay — Sidebar band karne ke liye ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-20 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          />
        )}
      </AnimatePresence>

      {/* ─── Sidebar ─── */}
      <motion.div
        animate={{ width: isOpen ? 230 : 64 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-30 flex flex-col h-full overflow-hidden flex-shrink-0"
        style={{ background: '#0f172a' }}
      >
        {/* ─── Brand ─── */}
        <div
          className="flex items-center gap-3 p-4 mb-2 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#4f46e5' }}
          >
            <Briefcase className="w-5 h-5 text-white" />
          </motion.div>

          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-white font-semibold text-sm whitespace-nowrap"
              >
                Job Portal
              </motion.span>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-auto"
              >
                <ChevronRight
                  className="w-4 h-4 text-slate-400"
                  style={{ transform: 'rotate(180deg)' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Main Nav Items ─── */}
        <div className="flex flex-col gap-1 px-2">
          {currentNavItems.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              isOpen={isOpen}
              isActive={pathname === item.path}
              onClick={() => {
                setIsOpen(true);
                router.push(item.path);
              }}
            />
          ))}
        </div>

        {/* ─── Divider + Section Label (Only for Jobseeker) ─── */}
        {!isRecruiter && (
          <div className="mx-3 my-3">
            <div className="h-px" style={{ background: '#1e293b' }} />
            <AnimatePresence>
              {isOpen && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs mt-2 px-2 uppercase tracking-widest"
                  style={{ color: '#475569' }}
                >
                  Learn & Grow
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ─── Bottom Nav Items (Only for Jobseeker) ─── */}
        {!isRecruiter && (
          <div className="flex flex-col gap-1 px-2">
            {currentBottomItems.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isOpen={isOpen}
                isActive={pathname === item.path}
                onClick={() => {
                  setIsOpen(true);
                  router.push(item.path);
                }}
              />
            ))}
          </div>
        )}

        {/* ─── Spacer ─── */}
        <div className="flex-1" />

        {/* ─── User + Logout ─── */}
        <div className="px-2 pb-4">
          <div className="h-px mb-3" style={{ background: '#1e293b' }} />

          {/* User Info */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl mb-2"
                style={{ background: '#1e293b' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white"
                  style={{ background: '#4f46e5' }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-xs truncate" style={{ color: '#64748b' }}>{user?.role}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings */}
          <NavItem
            item={{ icon: Settings, label: 'Settings', path: '/dashboard/settings' }}
            isOpen={isOpen}
            isActive={pathname === '/dashboard/settings'}
            onClick={() => { setIsOpen(true); router.push('/dashboard/settings'); }}
          />

          {/* Logout */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex items-center gap-3 mt-1 rounded-xl cursor-pointer overflow-hidden"
            style={{
              width: isOpen ? '100%' : '44px',
              height: '44px',
              padding: isOpen ? '0 12px' : '0',
              justifyContent: isOpen ? 'flex-start' : 'center',
            }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} />
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium whitespace-nowrap"
                  style={{ color: '#ef4444' }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

// ─── NavItem Component ───
function NavItem({ item, isOpen, isActive, onClick }) {
  const { icon: Icon, label, badge } = item;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="flex items-center gap-3 rounded-xl cursor-pointer overflow-hidden relative"
        style={{
          width: isOpen ? '100%' : '44px',
          height: '44px',
          padding: isOpen ? '0 12px' : '0',
          justifyContent: isOpen ? 'flex-start' : 'center',
          background: isActive ? '#4f46e5' : 'transparent',
        }}
        onHoverStart={e => {
          if (!isActive) e.target.style.background = '#1e293b';
        }}
        onHoverEnd={e => {
          if (!isActive) e.target.style.background = 'transparent';
        }}
      >
        <Icon
          className="w-5 h-5 flex-shrink-0"
          style={{ color: isActive ? 'white' : '#64748b' }}
        />

        <AnimatePresence>
          {isOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium whitespace-nowrap flex-1"
              style={{ color: isActive ? 'white' : '#94a3b8' }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Badge */}
        {badge && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex-shrink-0 text-white text-xs font-bold rounded-full flex items-center justify-center"
            style={{
              background: '#ef4444',
              minWidth: isOpen ? '20px' : '16px',
              height: isOpen ? '20px' : '16px',
              fontSize: '9px',
              position: isOpen ? 'relative' : 'absolute',
              top: isOpen ? 'auto' : '6px',
              right: isOpen ? 'auto' : '6px',
            }}
          >
            {badge}
          </motion.span>
        )}
      </motion.div>

      {/* Tooltip — sirf collapse mein */}
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            className="absolute left-14 top-1/2 -translate-y-1/2 z-50 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none"
            style={{ background: '#1e293b', border: '0.5px solid #334155' }}
          >
            {label}
            <div
              className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
              style={{ borderRightColor: '#1e293b' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}