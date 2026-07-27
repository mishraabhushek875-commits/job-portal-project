'use client';

import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  IconEdit, IconCheck, IconX, IconUpload,
  IconDownload, IconBriefcase, IconMail,
  IconMapPin, IconLink, IconLoader,
} from '@tabler/icons-react';
import toast from 'react-hot-toast';
import api from '../../../services/api';
import ProfileSections from '../../../components/ProfileSections';

const SKILL_COLORS = {
  'React': '#3b82f6', 'Node.js': '#10b981', 'JavaScript': '#f59e0b',
  'TypeScript': '#6366f1', 'MongoDB': '#22c55e', 'Python': '#f97316',
  'Docker': '#0ea5e9', 'AWS': '#f97316', 'GraphQL': '#ec4899',
};

const getColor = (skill) =>
  SKILL_COLORS[skill] || '#4f46e5';

export default function ProfilePage() {
  const { user: authUser } = useSelector(state => state.auth);
  const fileRef = useRef(null);
  const photoRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [editData, setEditData] = useState({
    name: '', email: '', role: '', location: '', linkedin: '',
    education: [], experience: [], skills: [], certifications: []
  });

  // ─── Fetch Profile ───
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        setEditData({
          name: res.data.user.name || '',
          email: res.data.user.email || '',
          role: res.data.user.role || '',
          location: res.data.user.location || '',
          linkedin: res.data.user.linkedin || '',
          education: res.data.user.education || [],
          experience: res.data.user.experience || [],
          skills: res.data.user.skills || [],
          certifications: res.data.user.certifications || [],
        });
      } catch (err) {
        toast.error('Profile load nahi hua!');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  // ProfilePage mein — edit save karne ka function
  
async function saveProfile() {
  try {
    const res = await api.put('/auth/update-profile', {
      name:     editData.name,
      location: editData.location,
      linkedin: editData.linkedin,
      education: editData.education,
      experience: editData.experience,
      skills: editData.skills,
      certifications: editData.certifications,
    });

    // Local state update karo
    setUser(prev => ({ ...prev, ...res.data.user }));
    setEditMode(false);
    toast.success('Profile save ho gaya! ✅');
  } catch (err) {
    toast.error('Save nahi hua — dobara try karo');
  }
}

  // ─── Resume Upload ───
  const handleResumeUpload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Sirf PDF allowed hai!');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('5MB se badi file mat upload karo!');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await api.post('/auth/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(prev => ({
        ...prev,
        resume: res.data.resume,
      }));
      toast.success('Resume upload ho gaya! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  // ─── Photo Upload ───
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Sirf image allowed hai!');
      return;
    }

    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await api.post('/auth/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(prev => ({
        ...prev,
        photo: res.data.photo,
      }));
      toast.success('Photo update ho gayi! 📸');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed!');
    } finally {
      setPhotoUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <IconLoader size={32} className="animate-spin" style={{ color: '#4f46e5' }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ─── Hero Card ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'white', border: '0.5px solid #e2e8f0' }}
      >
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899)' }} />

        <div className="flex flex-col md:flex-row gap-5 items-start mt-2">

          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => !photoUploading && photoRef.current?.click()}
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl cursor-pointer relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {user?.photo?.url ? (
                <Image src={user.photo.url} alt="photo"
                  width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                {photoUploading
                  ? <IconLoader size={18} className="text-white animate-spin" />
                  : <IconUpload size={18} className="text-white" />
                }
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white"
              style={{ background: '#10b981' }} />
            <input ref={photoRef} type="file" accept="image/*" className="hidden"
              onChange={e => handlePhotoUpload(e.target.files[0])} />
          </div>

          {/* Info */}
          <div className="flex-1">
            {editMode ? (
              <div className="space-y-2">
                {[
                  { key: 'name', label: 'Name', placeholder: 'Full name' },
                  { key: 'location', label: 'Location', placeholder: 'City, Country' },
                  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs mb-1 block" style={{ color: '#94a3b8' }}>
                      {f.label}
                    </label>
                    <input
                      value={editData[f.key]}
                      onChange={e => setEditData(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-xl border outline-none text-sm transition-all"
                      style={{
                        background: '#f8faff',
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                      }}
                      onFocus={e => e.target.style.borderColor = '#4f46e5'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <h1 className="font-bold text-2xl" style={{ color: '#0f172a' }}>
                  {user?.name}
                </h1>
                <p className="text-sm mt-1 capitalize px-2 py-0.5 rounded-full inline-block"
                  style={{ background: '#eef2ff', color: '#4f46e5' }}>
                  {user?.role}
                </p>
                <div className="flex flex-wrap gap-4 mt-3">
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
                    <IconMail size={12} /> {user?.email}
                  </span>
                  {user?.location && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
                      <IconMapPin size={12} /> {user.location}
                    </span>
                  )}
                  {user?.linkedin && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
                      <IconLink size={12} /> {user.linkedin}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            {editMode ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border"
                  style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                >
                  <IconX size={14} /> Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setUser(prev => ({ ...prev, ...editData }));
                    setEditMode(false);
                    toast.success('Profile update ho gaya!');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
                  style={{ background: '#10b981' }}
                >
                  <IconCheck size={14} /> Save
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveProfile}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border"
                  style={{ borderColor: '#e2e8f0', color: '#64748b' }}
                >
                  <IconEdit size={14} /> Edit
                </motion.button>
                {user?.resume?.url && (
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={user.resume.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: '#4f46e5' }}
                  >
                    <IconDownload size={14} /> Resume
                  </motion.a>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* ─── Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ background: 'white', border: '0.5px solid #e2e8f0' }}
        >
          <h2 className="font-semibold text-sm mb-4" style={{ color: '#0f172a' }}>
            Profile Stats
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Profile Views', value: '89', color: '#4f46e5', bg: '#eef2ff' },
              { label: 'Applications', value: '12', color: '#065f46', bg: '#d1fae5' },
              { label: 'Shortlisted', value: '4', color: '#b45309', bg: '#fef3c7' },
              { label: 'Interviews', value: '2', color: '#7c3aed', bg: '#ede9fe' },
            ].map((stat, i) => (
              <div key={i} className="rounded-xl p-3"
                style={{ background: stat.bg }}>
                <p className="text-xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: stat.color, opacity: 0.7 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Resume Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{ background: 'white', border: '0.5px solid #e2e8f0' }}
        >
          <h2 className="font-semibold text-sm mb-4" style={{ color: '#0f172a' }}>
            Resume
          </h2>

          <input ref={fileRef} type="file" accept=".pdf" className="hidden"
            onChange={e => handleResumeUpload(e.target.files[0])} />

          {user?.resume?.url ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: '#f0fdf4', border: '0.5px solid #bbf7d0' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#dcfce7' }}>
                  <span className="text-xl">📄</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#065f46' }}>
                    Resume Uploaded ✅
                  </p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    Cloudinary par save hai
                  </p>
                </div>
                <a href={user.resume.url} target="_blank" rel="noreferrer">
                  <IconDownload size={16} style={{ color: '#10b981' }} />
                </a>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full py-2 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#e2e8f0', color: '#64748b' }}
              >
                {uploading ? 'Uploading...' : 'Update Resume'}
              </motion.button>
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.01 }}
              onClick={() => !uploading && fileRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
              style={{ borderColor: uploading ? '#4f46e5' : '#e2e8f0' }}
            >
              <div className="text-3xl mb-2">
                {uploading ? '⏳' : '📄'}
              </div>
              <p className="text-sm" style={{ color: '#64748b' }}>
                {uploading ? 'Uploading...' : (
                  <>
                    <span style={{ color: '#4f46e5', fontWeight: 500 }}>
                      Click karo
                    </span>
                    {' '}ya drag karo
                    <br />
                    <span className="text-xs" style={{ color: '#94a3b8' }}>
                      PDF · 5MB max
                    </span>
                  </>
                )}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5"
          style={{ background: 'white', border: '0.5px solid #e2e8f0' }}
        >
          <h2 className="font-semibold text-sm mb-4" style={{ color: '#0f172a' }}>
            Account Info
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Name', value: user?.name, icon: IconBriefcase },
              { label: 'Email', value: user?.email, icon: IconMail },
              { label: 'Role', value: user?.role, icon: IconBriefcase },
              {
                label: 'Member Since',
                value: new Date(user?.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                }),
                icon: IconBriefcase,
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0"
                style={{ borderColor: '#f1f5f9' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: '#eef2ff' }}>
                  <item.icon size={14} style={{ color: '#4f46e5' }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{item.label}</p>
                  <p className="text-sm font-medium capitalize" style={{ color: '#0f172a' }}>
                    {item.value || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Photo Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5"
          style={{ background: 'white', border: '0.5px solid #e2e8f0' }}
        >
          <h2 className="font-semibold text-sm mb-4" style={{ color: '#0f172a' }}>
            Profile Photo
          </h2>

          <input ref={photoRef} type="file" accept="image/*" className="hidden"
            onChange={e => handlePhotoUpload(e.target.files[0])} />

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              {user?.photo?.url ? (
                <Image src={user.photo.url} alt="profile"
                  width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium mb-2" style={{ color: '#0f172a' }}>
                {user?.photo?.url ? 'Photo update karo' : 'Photo upload karo'}
              </p>
              <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>
                JPG, PNG · 2MB max
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => photoRef.current?.click()}
                disabled={photoUploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
                style={{ background: photoUploading ? '#a5b4fc' : '#4f46e5' }}
              >
                {photoUploading ? (
                  <><IconLoader size={14} className="animate-spin" /> Uploading...</>
                ) : (
                  <><IconUpload size={14} /> Upload Photo</>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ─── NEW PROFILE SECTIONS (Education, Experience, Skills, Certifications) ─── */}
      <ProfileSections 
        editMode={editMode} 
        editData={editData} 
        setEditData={setEditData} 
        user={user} 
      />
    </div>
  );
}