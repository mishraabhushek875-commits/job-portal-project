"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../../../services/api";
import { ChevronLeft, FileText, User, Mail, CheckCircle, XCircle, Clock, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import ChatModal from "../../../../../components/ChatModal";

export default function JobApplicationsPage() {
  const { jobId } = useParams();
  const router = useRouter();
  
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatData, setChatData] = useState(null);
  
  const [filter, setFilter] = useState('all'); // all, pending, shortlisted, rejected

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Backend route: GET /api/applications/job/:jobId
      const res = await api.get(`/applications/job/${jobId}`);
      if (res.data.success) {
        setApplications(res.data.applications || []);
        if (res.data.applications?.length > 0) {
          setJob(res.data.applications[0].jobId); // Assuming jobId is populated
        }
      }
    } catch (err) {
      toast.error("Failed to load applications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId, newStatus) => {
    try {
      // Backend route: PUT /api/applications/:id
      const res = await api.put(`/applications/${appId}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Application marked as ${newStatus}`);
        setApplications(prev => prev.map(app => 
          app._id === appId ? { ...app, status: newStatus } : app
        ));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading applications...</div>;
  }

  const filteredApps = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  return (
    <div className="min-h-screen bg-bg-main text-text-primary px-6 py-8 pt-24 max-w-6xl mx-auto">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/dashboard/recruiter/myjobs')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Jobs
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-1">
              {job ? `Applications for ${job.title}` : 'Applications'}
            </h1>
            <p className="text-slate-500">
              Total {applications.length} candidates applied
            </p>
          </div>

          <div className="flex bg-white rounded-xl shadow-sm p-1 border border-slate-200">
            {['all', 'pending', 'shortlisted', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Applications List ── */}
      {filteredApps.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No applications found</h3>
          <p className="text-slate-500">There are no applications matching the '{filter}' filter.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApps.map((app) => (
            <div key={app._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                {/* Applicant Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                    {app.userId?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {app.userId?.name || 'Unknown User'}
                      {app.status === 'shortlisted' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {app.status === 'rejected' && <XCircle className="w-4 h-4 text-red-500" />}
                      {app.status === 'pending' && <Clock className="w-4 h-4 text-orange-500" />}
                    </h3>
                    <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                      <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {app.userId?.email || 'N/A'}</span>
                    </div>
                    {app.resumeId && (
                      <div className="mt-3">
                         <Link href={app.resumeId.resumeUrl || '#'} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline bg-blue-50 px-3 py-1.5 rounded-lg">
                           <FileText className="w-4 h-4" /> View Resume
                         </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(app._id, 'shortlisted')}
                    disabled={app.status === 'shortlisted'}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      app.status === 'shortlisted' 
                        ? 'bg-green-100 text-green-700 cursor-default' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-green-500 hover:text-green-600'
                    }`}
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => updateStatus(app._id, 'rejected')}
                    disabled={app.status === 'rejected'}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      app.status === 'rejected' 
                        ? 'bg-red-100 text-red-700 cursor-default' 
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-red-500 hover:text-red-600'
                    }`}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setChatData({ recipient: app.userId, jobId: app.jobId?._id || jobId })}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Message
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      <ChatModal 
        isOpen={!!chatData}
        onClose={() => setChatData(null)}
        recipient={chatData?.recipient}
        jobId={chatData?.jobId}
      />
    </div>
  );
}

// Icon helper
function UsersIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
