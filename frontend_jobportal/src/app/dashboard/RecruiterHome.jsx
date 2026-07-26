"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import api from "../../services/api";

export default function RecruiterHome() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({
    jobsPosted: 0,
    applicationsReceived: 0,
    shortlisted: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const res = await api.get('/jobs/myjobs');
        if (res.data.success) {
          const jobs = res.data.jobs || [];
          setRecentJobs(jobs.slice(0, 5));
          
          let totalApps = 0;
          jobs.forEach(job => {
            const count = job.applicantsCount || 0;
            totalApps += count;
          });

          setStats({
            jobsPosted: jobs.length,
            applicationsReceived: totalApps,
            shortlisted: 0, 
          });
        }
      } catch (err) {
        console.error("Failed to load recruiter data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiterData();
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading Recruiter Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-bg-main text-text-primary font-body px-6 py-8 pt-24">
      {/* ── HEADER ───────────────────────────────────── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">
            Welcome back,{" "}
            <span className="text-blue-400">{user?.name}</span> 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">{today}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard/recruiter/post-job")}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-600/30"
          >
            + Post New Job
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ───────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: "💼",
            number: stats.jobsPosted,
            label: "Total Jobs Posted",
            accent: "border-b-blue-500",
            iconBg: "bg-blue-500/15",
          },
          {
            icon: "📋",
            number: stats.applicationsReceived,
            label: "Total Applications",
            accent: "border-b-purple-500",
            iconBg: "bg-purple-500/15",
          },
          {
            icon: "🎯",
            number: stats.shortlisted,
            label: "Shortlisted Candidates",
            accent: "border-b-green-500",
            iconBg: "bg-green-500/15",
          }
        ].map((card, i) => (
          <div
            key={i}
            className={`bg-bg-card border border-border border-b-4 ${card.accent} rounded-2xl p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
          >
            <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center text-xl mb-4`}>
              {card.icon}
            </div>
            <div className="font-display font-extrabold text-3xl">{card.number}</div>
            <div className="text-text-secondary text-xs mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ── RECENT JOBS ─────────────────────────── */}
      <div className="bg-bg-card border border-border rounded-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-display font-bold text-lg">Your Recent Job Postings</h2>
          <button 
            onClick={() => router.push('/dashboard/recruiter/myjobs')}
            className="text-blue-500 hover:text-blue-400 text-sm font-medium"
          >
            View All →
          </button>
        </div>

        <div className="space-y-3">
          {recentJobs.length > 0 ? recentJobs.map((job) => (
            <div key={job._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
              <div>
                <h3 className="font-bold text-slate-800">{job.title}</h3>
                <p className="text-slate-500 text-sm">{job.location} • {job.jobType}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-bold text-blue-600">{job.applicantsCount || 0}</div>
                  <div className="text-xs text-slate-500">Applicants</div>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/recruiter/applications/${job._id}`)}
                  className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors"
                >
                  View Applications
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-10 text-slate-500">
              You haven't posted any jobs yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
