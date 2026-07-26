"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../../../../services/api";
import { Trash2, Edit, Users, MapPin, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

export default function MyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/myjobs');
      if (res.data.success) {
        setJobs(res.data.jobs || []);
      }
    } catch (err) {
      toast.error("Failed to fetch jobs");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
    
    try {
      const res = await api.delete(`/jobs/${jobId}`);
      if (res.data.success) {
        toast.success("Job deleted successfully");
        setJobs(jobs.filter(j => j._id !== jobId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete job");
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading your jobs...</div>;
  }

  return (
    <div className="min-h-screen bg-bg-main text-text-primary px-6 py-8 pt-24 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">My Posted Jobs</h1>
          <p className="text-text-secondary mt-1">Manage jobs you have posted</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/recruiter/post-job')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/30"
        >
          + Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Jobs Posted Yet</h3>
          <p className="text-slate-500 mb-6">Start building your team by posting your first job opportunity.</p>
          <button
            onClick={() => router.push('/dashboard/recruiter/post-job')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Post a Job Now
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Left: Job Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium capitalize">
                      {job.jobType}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500 text-sm">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.experienceLevel || 'Any Experience'}</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-xl px-6 py-2 min-w-[100px]">
                    <span className="text-2xl font-bold font-display">{job.applicantsCount || 0}</span>
                    <span className="text-xs font-medium">Applicants</span>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/dashboard/recruiter/applications/${job._id}`)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-sm font-medium"
                  >
                    <Users className="w-4 h-4" /> View Apps
                  </button>

                  <button
                    onClick={() => toast.error("Edit feature coming soon!")}
                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                    title="Edit Job"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(job._id)}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                    title="Delete Job"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
