'use client';

import { motion } from 'framer-motion';
import { IconSettings, IconUser, IconBell, IconLock, IconPalette } from '@tabler/icons-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Security');
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    toast.success('Password updated successfully!');
    setOldPassword('');
    setNewPassword('');
  };

  const handleDeleteAccount = () => {
    if(window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.success('Account deletion request submitted.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary dark:text-slate-100">Settings</h1>
          <p className="text-sm mt-0.5 text-slate-400 dark:text-slate-400">
            Apne account aur preferences manage karein
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Nav */}
        <div className="bg-bg-card rounded-2xl border border-border p-4 space-y-2">
          {[
            { id: 'Notifications', icon: IconBell, label: 'Notifications' },
            { id: 'Security', icon: IconLock, label: 'Security' },
            { id: 'Appearance', icon: IconPalette, label: 'Appearance' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id 
                  ? 'bg-brand-medium text-brand-color' 
                  : 'text-text-secondary hover:bg-brand-light'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-card rounded-2xl border border-border p-6"
          >
            {activeTab === 'Notifications' && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                  <IconBell className="text-brand-color" /> Notification Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-bg-secondary border border-border-glass">
                    <div>
                      <h3 className="font-semibold text-sm text-text-primary">Email Notifications</h3>
                      <p className="text-xs text-text-secondary">Receive alerts for new jobs and messages</p>
                    </div>
                    <div 
                      onClick={() => setEmailNotifs(!emailNotifs)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${emailNotifs ? 'bg-brand-color' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${emailNotifs ? 'right-1' : 'left-1'}`}></div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Security' && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                  <IconLock className="text-brand-color" /> Security Settings
                </h2>
                
                <form onSubmit={handlePasswordChange} className="space-y-4 mb-8">
                  <h3 className="font-semibold text-sm text-text-primary mb-2">Change Password / PIN</h3>
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">Current PIN</label>
                    <input 
                      type="password" 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-secondary outline-brand-color" 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary mb-1 block">New PIN</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-bg-secondary outline-brand-color" 
                      required
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-brand-color text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                    Update PIN
                  </button>
                </form>

                <div className="pt-6 border-t border-red-100">
                  <h3 className="font-bold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-xs text-slate-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                  <button 
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </>
            )}

            {activeTab === 'Appearance' && (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                  <IconPalette className="text-brand-color" /> Appearance
                </h2>
                <p className="text-sm text-text-secondary">
                  Dark mode and theme settings will be available here soon. Currently following system preferences.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
