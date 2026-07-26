import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconTrash, IconPlus } from '@tabler/icons-react';

export default function ProfileSections({ editMode, editData, setEditData, user }) {
  
  const handleAddArrayItem = (key, emptyItem) => {
    setEditData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), emptyItem]
    }));
  };

  const handleUpdateArrayItem = (key, index, field, value) => {
    setEditData(prev => {
      const newArray = [...(prev[key] || [])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [key]: newArray };
    });
  };

  const handleRemoveArrayItem = (key, index) => {
    setEditData(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSkillChange = (e) => {
    const val = e.target.value;
    const skillsArray = val.split(',').map(s => s.trim()).filter(s => s !== '');
    setEditData(prev => ({ ...prev, skills: skillsArray }));
  };

  return (
    <div className="space-y-6 mt-6">
      {/* ─── EDUCATION ─── */}
      <div className="rounded-2xl p-5" style={{ background: 'white', border: '0.5px solid #e2e8f0' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm" style={{ color: '#0f172a' }}>Education</h2>
          {editMode && (
            <button 
              onClick={() => handleAddArrayItem('education', { degree: '', institution: '', year: '', grade: '' })}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <IconPlus size={14} /> Add Education
            </button>
          )}
        </div>
        
        {editMode ? (
          <div className="space-y-4">
            {(editData.education || []).map((edu, i) => (
              <div key={i} className="p-3 border rounded-xl relative border-slate-200 bg-slate-50">
                <button onClick={() => handleRemoveArrayItem('education', i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <IconTrash size={16} />
                </button>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <input placeholder="Degree (e.g. B.Tech CS)" value={edu.degree} onChange={e => handleUpdateArrayItem('education', i, 'degree', e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full outline-blue-500" />
                  <input placeholder="Institution" value={edu.institution} onChange={e => handleUpdateArrayItem('education', i, 'institution', e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full outline-blue-500" />
                  <input placeholder="Year (e.g. 2020-2024)" value={edu.year} onChange={e => handleUpdateArrayItem('education', i, 'year', e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full outline-blue-500" />
                  <input placeholder="Grade/CGPA" value={edu.grade} onChange={e => handleUpdateArrayItem('education', i, 'grade', e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full outline-blue-500" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {user?.education?.length > 0 ? user.education.map((edu, i) => (
              <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                <p className="font-medium text-sm text-slate-800">{edu.degree}</p>
                <p className="text-xs text-slate-500">{edu.institution}</p>
                <div className="flex gap-3 text-xs text-slate-400 mt-1">
                  <span>{edu.year}</span>
                  {edu.grade && <span>• Grade: {edu.grade}</span>}
                </div>
              </div>
            )) : <p className="text-xs text-slate-400">No education added</p>}
          </div>
        )}
      </div>

      {/* ─── EXPERIENCE ─── */}
      <div className="rounded-2xl p-5" style={{ background: 'white', border: '0.5px solid #e2e8f0' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-sm" style={{ color: '#0f172a' }}>Experience</h2>
          {editMode && (
            <button 
              onClick={() => handleAddArrayItem('experience', { title: '', company: '', duration: '', description: '' })}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <IconPlus size={14} /> Add Experience
            </button>
          )}
        </div>
        
        {editMode ? (
          <div className="space-y-4">
            {(editData.experience || []).map((exp, i) => (
              <div key={i} className="p-3 border rounded-xl relative border-slate-200 bg-slate-50">
                <button onClick={() => handleRemoveArrayItem('experience', i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <IconTrash size={16} />
                </button>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <input placeholder="Job Title" value={exp.title} onChange={e => handleUpdateArrayItem('experience', i, 'title', e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full outline-blue-500" />
                  <input placeholder="Company" value={exp.company} onChange={e => handleUpdateArrayItem('experience', i, 'company', e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full outline-blue-500" />
                  <input placeholder="Duration (e.g. Jan 2022 - Present)" value={exp.duration} onChange={e => handleUpdateArrayItem('experience', i, 'duration', e.target.value)} className="col-span-2 px-3 py-2 border rounded-lg text-sm w-full outline-blue-500" />
                  <textarea placeholder="Description" value={exp.description} onChange={e => handleUpdateArrayItem('experience', i, 'description', e.target.value)} className="col-span-2 px-3 py-2 border rounded-lg text-sm w-full outline-blue-500 h-20 resize-none" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {user?.experience?.length > 0 ? user.experience.map((exp, i) => (
              <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                <p className="font-medium text-sm text-slate-800">{exp.title}</p>
                <p className="text-xs text-slate-500">{exp.company}</p>
                <p className="text-xs text-slate-400 mt-1">{exp.duration}</p>
                {exp.description && <p className="text-sm mt-2 text-slate-600 leading-relaxed">{exp.description}</p>}
              </div>
            )) : <p className="text-xs text-slate-400">No experience added</p>}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ─── SKILLS ─── */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '0.5px solid #e2e8f0' }}>
          <h2 className="font-semibold text-sm mb-4" style={{ color: '#0f172a' }}>Skills</h2>
          {editMode ? (
            <div>
              <p className="text-xs text-slate-500 mb-2">Comma separated (e.g. React, Node, AWS)</p>
              <textarea 
                value={(editData.skills || []).join(', ')} 
                onChange={handleSkillChange}
                className="w-full px-3 py-2 border rounded-lg text-sm outline-blue-500 min-h-[100px] resize-none"
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.skills?.length > 0 ? user.skills.map((skill, i) => (
                <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                  {skill}
                </span>
              )) : <p className="text-xs text-slate-400">No skills added</p>}
            </div>
          )}
        </div>

        {/* ─── CERTIFICATIONS ─── */}
        <div className="rounded-2xl p-5" style={{ background: 'white', border: '0.5px solid #e2e8f0' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm" style={{ color: '#0f172a' }}>Certifications</h2>
            {editMode && (
              <button 
                onClick={() => handleAddArrayItem('certifications', { name: '', issuer: '', year: '' })}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <IconPlus size={14} /> Add
              </button>
            )}
          </div>
          
          {editMode ? (
            <div className="space-y-3">
              {(editData.certifications || []).map((cert, i) => (
                <div key={i} className="p-3 border rounded-xl relative border-slate-200 bg-slate-50 space-y-2">
                  <button onClick={() => handleRemoveArrayItem('certifications', i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                    <IconTrash size={16} />
                  </button>
                  <input placeholder="Certificate Name" value={cert.name} onChange={e => handleUpdateArrayItem('certifications', i, 'name', e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full outline-blue-500" />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Issuer" value={cert.issuer} onChange={e => handleUpdateArrayItem('certifications', i, 'issuer', e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full outline-blue-500" />
                    <input placeholder="Year" value={cert.year} onChange={e => handleUpdateArrayItem('certifications', i, 'year', e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full outline-blue-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {user?.certifications?.length > 0 ? user.certifications.map((cert, i) => (
                <div key={i} className="border-b last:border-0 pb-3 last:pb-0">
                  <p className="font-medium text-sm text-slate-800">{cert.name}</p>
                  <div className="flex gap-2 text-xs text-slate-500 mt-1">
                    <span>{cert.issuer}</span>
                    <span>• {cert.year}</span>
                  </div>
                </div>
              )) : <p className="text-xs text-slate-400">No certifications added</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
