"use client";

// ─────────────────────────────────────────────
// DashboardPage.jsx — Tailwind CSS
// Simple code — har cheez comment ke saath
// ─────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import api from "../../services/api";

// ── Chatbot ke demo replies ───────────────────────────────────
function getBotReply(message) {
  const msg = message.toLowerCase();
  if (msg.includes("job") || msg.includes("react") || msg.includes("node")) {
    return "3 jobs mili! React Dev @ Razorpay (₹22L), Frontend @ Zepto (₹18L), Full Stack @ CRED (₹25L) 🎯";
  }
  if (msg.includes("resume")) {
    return "Resume tips: Skills section upar rakho, numbers use karo (e.g. 30% improve kiya), 1 page mein rakho! ✅";
  }
  if (msg.includes("interview")) {
    return "Interview prep: STAR method use karo, company research karo, 2-3 questions poochho interviewer se! 💪";
  }
  return "Batao — koi job ya career advice chahiye? Role + city likho 😊";
}

import RecruiterHome from "./RecruiterHome";

// ── Main Component ────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user } = useSelector(state => state.auth);

  if (user?.role === 'recruiter') {
    return <RecruiterHome />;
  }

  return <JobseekerHome />;
}

// ── Jobseeker Component ────────────────────────────────────────────
function JobseekerHome() {
  const router = useRouter();
  const { user } = useSelector(state => state.auth);

  // chatOpen = chatbot popup open hai ya band
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Namaste! 👋 Main JobBot hun. Kaise help karun?" },
    { from: "bot", text: 'Try karo: "React jobs Mumbai mein"' },
  ]);

  // Real Data states
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    profileScore: "87%", // Could be fetched from user profile in future
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch Real Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch AI Recommendations
        const recRes = await api.get('/jobs/ai/recommendations');
        if (recRes.data.success && recRes.data.recommendations) {
          setRecommendations(recRes.data.recommendations);
        }

        // Fetch Applications
        const appRes = await api.get('/applications/my');
        if (appRes.data.success && appRes.data.applications) {
          const apps = appRes.data.applications;
          setApplications(apps.slice(0, 4)); // Get latest 4 for dashboard
          
          setStats(prev => ({
            ...prev,
            applications: apps.length,
            interviews: apps.filter(a => a.status === 'shortlisted' || a.status === 'interview').length,
          }));
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };

    fetchData();
  }, []);

  // Chat message bhejo
  function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;

    // User ka message add karo
    const userMsg = { from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    // Bot ka reply thodi der baad aaye
    setTimeout(() => {
      const botMsg = { from: "bot", text: getBotReply(text) };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  }

  // Aaj ki date
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="min-h-screen bg-bg-main text-text-primary font-body
                    px-6 py-8 pt-24">

      {/* ── HEADER ───────────────────────────────────── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl tracking-tight">
            Good morning,{" "}
            <span className="text-blue-400">Rahul</span> 👋
          </h1>
          <p className="text-text-secondary text-sm mt-1">{today}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="border border-border hover:border-blue-500
                       text-text-secondary hover:text-blue-400 text-sm
                       px-4 py-2 rounded-xl transition-all duration-200"
          >
            Browse Jobs
          </button>
          <button
            onClick={() => router.push("/profile")}
            className="bg-blue-600 hover:bg-blue-500 text-white
                       text-sm px-4 py-2 rounded-xl font-semibold
                       transition-all duration-200 shadow-lg shadow-blue-600/30"
          >
            My Profile
          </button>
        </div>
      </div>

      {/* ── STAT CARDS — 4 columns ───────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: "📋",
            number: stats.applications || "0",
            label: "Applications",
            change: "Total applied",
            accent: "border-b-blue-500",
            iconBg: "bg-blue-500/15",
          },
          {
            icon: "🎯",
            number: stats.interviews || "0",
            label: "Interviews",
            change: "Shortlisted/Interview",
            accent: "border-b-red-500",
            iconBg: "bg-red-500/15",
          },
          {
            icon: "⭐",
            number: stats.profileScore,
            label: "Profile Score",
            change: "Add resume to improve",
            accent: "border-b-yellow-400",
            iconBg: "bg-yellow-400/15",
          },
          {
            icon: "🔔",
            number: recommendations.length || "0",
            label: "New Matches",
            change: "AI recommended",
            accent: "border-b-white/40",
            iconBg: "bg-bg-card/10",
          }
        ].map((card, i) => (
          <div
            key={i}
            className={`bg-bg-card border border-border border-b-4
                        ${card.accent} rounded-2xl p-5
                        hover:-translate-y-1 hover:shadow-xl
                        transition-all duration-300`}
          >
            {/* Icon box */}
            <div className={`w-10 h-10 ${card.iconBg} rounded-xl
                             flex items-center justify-center
                             text-xl mb-4`}>
              {card.icon}
            </div>
            {/* Number */}
            <div className="font-display font-extrabold text-3xl">
              {card.number}
            </div>
            <div className="text-text-secondary text-xs mt-1">{card.label}</div>
            <div className="text-green-400 text-xs mt-2 font-medium">
              {card.change}
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN TWO COLUMNS ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT — Recent Applications (2/3 width) */}
        <div className="lg:col-span-2 bg-bg-card border border-border
                        rounded-2xl p-6">

          {/* Panel header */}
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-display font-bold text-lg">
              Recent Applications
            </h2>
            <span className="bg-blue-500/20 text-blue-400 text-xs
                             px-3 py-1 rounded-full">
              12 total
            </span>
          </div>

          {/* Application rows */}
          <div className="space-y-1">
            {applications.length > 0 ? applications.map((app, i) => {
              const company = app.job?.company || "Unknown";
              const title = app.job?.title || "Job Title";
              
              // Determine status colors dynamically
              let statusStyle = "bg-blue-500/20 text-blue-400"; // default applied
              if (app.status === 'shortlisted' || app.status === 'interview') {
                statusStyle = "bg-green-500/20 text-green-400";
              } else if (app.status === 'rejected') {
                statusStyle = "bg-red-500/20 text-red-400";
              } else if (app.status === 'reviewed') {
                statusStyle = "bg-yellow-500/20 text-yellow-400";
              }

              return (
                <div
                  key={app._id || i}
                  onClick={() => router.push(`/dashboard/applications`)}
                  className="flex items-center gap-4 p-3 rounded-xl
                             hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors
                             duration-200 cursor-pointer"
                >
                  {/* Company logo */}
                  <div className={`w-10 h-10 bg-blue-500/20 text-blue-400
                                   rounded-xl flex items-center justify-center
                                   font-display font-bold text-sm flex-shrink-0`}>
                    {company.charAt(0).toUpperCase()}
                  </div>

                  {/* Job info */}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{title}</div>
                    <div className="text-text-secondary text-xs">{company}</div>
                  </div>

                  {/* Status badge */}
                  <span className={`text-xs px-3 py-1 rounded-full capitalize
                                    font-medium ${statusStyle}`}>
                    {app.status || "Applied"}
                  </span>
                </div>
              );
            }) : (
              <div className="text-center py-6 text-text-secondary text-sm">
                No recent applications found. Start applying!
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — AI Recommendations (1/3 width) */}
        <div className="bg-bg-card border border-border rounded-2xl p-6">

          <div className="flex justify-between items-center mb-5">
            <h2 className="font-display font-bold text-lg">🤖 AI Picks</h2>
            <span className="bg-yellow-400/20 text-yellow-400 text-xs
                             px-3 py-1 rounded-full">
              For you
            </span>
          </div>

          {/* Recommendations — backend se aayein */}
          <div className="space-y-1">
            {recommendations.length > 0 ? recommendations.slice(0, 5).map((rec, i) => {
              const salary = rec.salary?.min ? `₹${(rec.salary.min / 100000).toFixed(1)}L` : "Negotiable";
              return (
                <div
                  key={rec._id || i}
                  onClick={() => router.push(`/dashboard/jobs/${rec._id}`)}
                  className="flex items-center gap-3 p-2.5 rounded-xl
                             hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:translate-x-1
                             transition-all duration-200 cursor-pointer"
                >
                  {/* Score badge */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600
                                  to-red-500 rounded-xl flex items-center
                                  justify-center font-display font-bold
                                  text-xs flex-shrink-0 text-white">
                    {rec.recommendationScore ? Math.round(rec.recommendationScore * 100) : "N/A"}%
                  </div>

                  <div>
                    <div className="text-sm font-medium line-clamp-1">
                      {rec.title} @ {rec.company}
                    </div>
                    <div className="text-text-secondary text-xs">
                      {rec.location} · {salary}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-6">
                <p className="text-text-secondary text-sm">No recommendations yet.</p>
                <p className="text-text-secondary text-xs mt-2">
                  Jobs search karo — recommendations improve hongi!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FLOATING CHATBOT BUTTON ───────────────────── */}
      <button
        onClick={() => setChatOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full
                   bg-gradient-to-br from-blue-600 to-red-500
                   text-white text-2xl border-none cursor-pointer
                   shadow-2xl shadow-blue-600/40 animate-fab-pulse
                   hover:scale-110 transition-transform duration-200
                   flex items-center justify-center z-50"
      >
        {chatOpen ? "✕" : "💬"}
      </button>

      {/* ── CHATBOT POPUP ─────────────────────────────── */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-bg-card
                        border border-border rounded-2xl shadow-2xl
                        z-40 overflow-hidden animate-slide-up">

          {/* Chat header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800
                          px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-bg-card/20 rounded-full
                            flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <div className="font-semibold text-sm">JobBot AI</div>
              <div className="text-blue-200 text-xs">● Online</div>
            </div>
          </div>

          {/* Messages area */}
          <div className="h-52 overflow-y-auto p-4 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] text-xs px-3 py-2 rounded-xl
                            leading-relaxed
                            ${msg.from === "bot"
                              ? "bg-bg-main dark:bg-slate-700 text-text-primary self-start rounded-tl-sm"
                              : "bg-blue-600 text-white self-end rounded-tr-sm"
                            }`}
              >
                {msg.text}
              </div>
            ))}
            {/* Scroll yahan tak */}
            <div ref={chatEndRef} />
          </div>

          {/* Input row */}
          <div className="flex gap-2 p-3 border-t border-border">
            <input
              type="text"
              placeholder="Kuch bhi poochho..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-slate-50 dark:bg-slate-700 border border-border
                         rounded-lg px-3 py-2 text-xs text-text-primary
                         placeholder-slate-400 outline-none
                         focus:border-blue-500 transition-colors"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-500 text-white
                         rounded-lg w-9 h-9 flex items-center justify-center
                         text-sm transition-colors flex-shrink-0"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}