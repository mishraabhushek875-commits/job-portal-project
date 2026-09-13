'use client';

import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Briefcase, FileText, User, Code, MessageCircle, Trophy, LayoutDashboard } from 'lucide-react';

const jobseekerItems = [
  { icon: Home,          label: 'Home',         path: '/dashboard' },
  { icon: Briefcase,     label: 'Jobs',          path: '/dashboard/jobs' },
  { icon: FileText,      label: 'Applied',       path: '/dashboard/applications' },
  { icon: MessageCircle, label: 'Interview',     path: '/dashboard/interview' },
  { icon: User,          label: 'Profile',       path: '/dashboard/profile' },
];

const recruiterItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase,       label: 'My Jobs',   path: '/dashboard/recruiter/myjobs' },
  { icon: FileText,        label: 'Post Job',  path: '/dashboard/recruiter/post-job' },
  { icon: User,            label: 'Profile',   path: '/dashboard/profile' },
];

export default function MobileBottomNav() {
  const router   = useRouter();
  const pathname = usePathname();
  const user     = useSelector(state => state.auth.user);

  const items = user?.role === 'recruiter' ? recruiterItems : jobseekerItems;

  return (
    /* Only on mobile — md se upar hide */
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{ background: '#0f172a', borderColor: '#1e293b' }}>
      <div className="flex items-center justify-around px-1 py-2">
        {items.map((item) => {
          const isActive = pathname === item.path;
          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
              style={{ minWidth: '52px' }}
            >
              <item.icon
                size={20}
                style={{ color: isActive ? '#818cf8' : '#64748b' }}
              />
              <span
                className="text-[9px] font-medium"
                style={{ color: isActive ? '#818cf8' : '#64748b' }}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute top-0 h-0.5 w-8 rounded-full"
                  style={{ background: '#818cf8' }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
