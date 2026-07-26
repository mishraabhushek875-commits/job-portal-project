'use client';

import { useSelector, useDispatch } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  IconBell,
  IconSearch,
  IconMoon,
  IconSun,
  IconChevronDown,
  IconUser,
  IconSettings,
  IconLogout,
} from '@tabler/icons-react';
import { toggleTheme } from '../redux/slices/themeSlice';
import { logout } from '../redux/slices/authSlice';
import socket from '../socket/socket';
import api from '../services/api';

// ─── Page Titles ───
const pageTitles = {
  '/dashboard': { title: 'Home', sub: 'Apka dashboard' },
  '/dashboard/jobs': { title: 'Jobs', sub: 'Best matching jobs dhundo' },
  '/dashboard/applications': { title: 'My Applications', sub: 'Track your applications' },
  '/dashboard/profile': { title: 'Profile', sub: 'Apni profile dekho' },
  '/dashboard/dsa': { title: 'DSA Practice', sub: 'Coding problems solve karo' },
  '/dashboard/interview': { title: 'Interview Prep', sub: 'AI se prepare karo' },
  '/dashboard/hackathon': { title: 'Hackathon', sub: 'Competitions join karo' },
};

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector(state => state.auth);
  const { mode } = useSelector(state => state.theme);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Notifications fetch failed:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      const handleNewNotification = (data) => {
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser toast for high priority notification
        toast.success(data.message, {
          icon: '🔔',
          style: {
            borderRadius: '10px',
            background: '#fff',
            color: '#333',
          },
        });
      };
      
      socket.on('notification', handleNewNotification);
      
      return () => {
        socket.off('notification', handleNewNotification);
      }
    }
  }, [user]);

  const handleNotifClick = async () => {
    setShowNotif(!showNotif);
    if (!showNotif && unreadCount > 0) {
      try {
        await api.put('/notifications/read-all');
        setUnreadCount(0);
        // Map over local to mark as read
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      } catch (err) {}
    }
  };

  const pageInfo = pageTitles[pathname] || { title: 'Job Portal', sub: '' };

  const handleLogout = () => {
    dispatch(logout());
    socket.disconnect();
    router.push('/login');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 flex items-center justify-between px-6 flex-shrink-0 relative z-20"
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* ─── Left — Page Title ─── */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
          {pageInfo.title}
        </h1>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {pageInfo.sub}
        </p>
      </motion.div>

      {/* ─── Right ─── */}
      <div className="flex items-center gap-2">

        {/* Search */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{
            background: 'rgba(79,70,229,0.08)',
            color: '#4f46e5',
          }}
        >
          <IconSearch size={18} />
        </motion.button>

        {/* Notification */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNotifClick}
            className="w-9 h-9 rounded-xl flex items-center justify-center relative"
            style={{ background: 'rgba(79,70,229,0.08)', color: '#4f46e5' }}
          >
            <IconBell size={18} />
            {unreadCount > 0 && (
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"
              />
            )}
          </motion.button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 w-72 rounded-2xl p-4 z-50"
                style={{
                  background: 'var(--bg-glass)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-glass)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Notifications
                </p>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n, i) => (
                      <motion.div
                        key={n._id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-start gap-3 py-2 border-b last:border-0 ${n.isRead ? 'opacity-70' : 'opacity-100'}`}
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: n.isRead ? 'var(--text-secondary)' : '#4f46e5' }} />
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                            {n.message}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>No notifications</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(toggleTheme())}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(79,70,229,0.08)', color: '#4f46e5' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {mode === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>

        {/* Avatar + Dropdown */}
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl"
            style={{
              background: 'rgba(79,70,229,0.08)',
              border: '1px solid rgba(79,70,229,0.15)',
            }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{ background: '#4f46e5' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
            <motion.div
              animate={{ rotate: showDropdown ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <IconChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
            </motion.div>
          </motion.button>

          {/* Avatar Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 w-52 rounded-2xl p-2 z-50"
                style={{
                  background: 'var(--bg-glass)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-glass)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div className="px-3 py-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {user?.name}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {user?.email}
                  </p>
                </div>
                <div className="h-px mb-1" style={{ background: 'var(--border)' }} />
                {[
                  { icon: IconUser, label: 'Profile', path: '/dashboard/profile' },
                  { icon: IconSettings, label: 'Settings', path: '/dashboard/settings' },
                ].map((item, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    onClick={() => { router.push(item.path); setShowDropdown(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <item.icon size={16} style={{ color: '#4f46e5' }} />
                    {item.label}
                  </motion.button>
                ))}
                <div className="h-px my-1" style={{ background: 'var(--border)' }} />
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm"
                  style={{ color: '#ef4444' }}
                >
                  <IconLogout size={16} />
                  Logout
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click bahar se dropdown band karo */}
      {(showDropdown || showNotif) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => { setShowDropdown(false); setShowNotif(false); }}
        />
      )}
    </motion.nav>
  );
}