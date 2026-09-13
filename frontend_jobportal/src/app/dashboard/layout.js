'use client';

// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/layout.js
// White theme layout — Sidebar + Navbar as components
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import MobileBottomNav from '../../components/MobileBottomNav';
import dynamic from 'next/dynamic';

const ChatBot = dynamic(() => import('../../components/chatBot'), { ssr: false });

export default function DashboardLayout({ children }) {
  const { isLoggedIn } = useSelector(state => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoggedIn) router.push('/login');
  }, [isLoggedIn, router]);

  if (!mounted || !isLoggedIn) return null;

  return (
    // White background — poore dashboard ka base
    <div className="flex h-screen overflow-hidden gradient-bg bg-bg-primary text-text-primary">
      {/* Sidebar — only on desktop (md+) */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Right side — Navbar + Page content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Navbar — top */}
        <Navbar />

        {/* Page content — mobile pe pb-20 taaki bottom nav ke upar rahe */}
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 overflow-y-auto p-3 md:p-6 pb-20 md:pb-6"
          style={{ background: 'transparent' }}
        >
          {children}
        </motion.main>
      </div>

      {/* Mobile Bottom Navigation — only on mobile */}
      <MobileBottomNav />

      <ChatBot/>
    </div>
  );
}