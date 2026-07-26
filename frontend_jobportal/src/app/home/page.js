"use client";

// ─────────────────────────────────────────────────────────────
// src/app/home/page.js
//
// White theme — transparent bluish cards — scrolling logos
// Self-contained — koi bahar ka import nahi
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import api from "../../services/api";

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const JOBS = [
  {
    id: "1",
    logo: "G",
    color: "blue",   // card ka color theme
    badge: "🔥 Hot",
    badgeColor: "red",
    title: "Senior React Developer",
    company: "Google",
    type: "Full-time",
    skills: ["React", "TypeScript", "Node.js"],
    salary: "₹25-40 LPA",
    location: "Bangalore",
  },
  {
    id: "2",
    logo: "M",
    color: "pink",
    badge: "✨ New",
    badgeColor: "amber",
    title: "Data Scientist",
    company: "Microsoft",
    type: "Full-time",
    skills: ["Python", "ML", "TensorFlow"],
    salary: "₹18-30 LPA",
    location: "Hyderabad",
  },
  {
    id: "3",
    logo: "A",
    color: "emerald",
    badge: "🌐 Remote",
    badgeColor: "blue",
    title: "Backend Engineer",
    company: "Amazon",
    type: "Remote",
    skills: ["Node.js", "AWS", "Docker"],
    salary: "₹20-35 LPA",
    location: "Remote",
  },
  {
    id: "4",
    logo: "F",
    color: "rose",
    badge: "✨ New",
    badgeColor: "amber",
    title: "Flutter Developer",
    company: "Flipkart",
    type: "Full-time",
    skills: ["Flutter", "Dart", "Firebase"],
    salary: "₹12-20 LPA",
    location: "Mumbai",
  },
  {
    id: "5",
    logo: "Z",
    color: "violet",
    badge: "🔥 Hot",
    badgeColor: "red",
    title: "UI/UX Designer",
    company: "Zepto",
    type: "Full-time",
    skills: ["Figma", "CSS", "Prototyping"],
    salary: "₹10-18 LPA",
    location: "Bangalore",
  },
  {
    id: "6",
    logo: "C",
    color: "amber",
    badge: "🌐 Remote",
    badgeColor: "blue",
    title: "DevOps Engineer",
    company: "CRED",
    type: "Remote",
    skills: ["Kubernetes", "CI/CD", "AWS"],
    salary: "₹22-38 LPA",
    location: "Remote",
  },
];

// Scrolling logos — company names + initials
// Dono baar repeat kiya taaki infinite scroll smooth ho
const COMPANIES = [
  { name: "Google",    letter: "G", bg: "bg-blue-100",   text: "text-blue-600" },
  { name: "Microsoft", letter: "M", bg: "bg-red-100",    text: "text-red-600" },
  { name: "Amazon",    letter: "A", bg: "bg-amber-100",  text: "text-amber-600" },
  { name: "Flipkart",  letter: "F", bg: "bg-blue-100",   text: "text-blue-600" },
  { name: "Swiggy",    letter: "S", bg: "bg-orange-100", text: "text-orange-600" },
  { name: "Zomato",    letter: "Z", bg: "bg-red-100",    text: "text-red-600" },
  { name: "Razorpay",  letter: "R", bg: "bg-indigo-100", text: "text-indigo-600" },
  { name: "CRED",      letter: "C", bg: "bg-purple-100", text: "text-purple-600" },
  { name: "Meesho",    letter: "M", bg: "bg-pink-100",   text: "text-pink-600" },
  { name: "Zepto",     letter: "Z", bg: "bg-violet-100", text: "text-violet-600" },
  { name: "Infosys",   letter: "I", bg: "bg-blue-100",   text: "text-blue-700" },
  { name: "TCS",       letter: "T", bg: "bg-sky-100",    text: "text-sky-700" },
];

const STATS = [
  { num: "12K+", label: "Active Jobs",  color: "text-blue-600" },
  { num: "4K+",  label: "Companies",   color: "text-pink-500" },
  { num: "98%",  label: "Match Rate",  color: "text-emerald-600" },
  { num: "50K+", label: "Hired",       color: "text-amber-500" },
];

const TAGS = [
  "React Developer", "Python", "Data Analyst",
  "UI/UX", "Node.js", "Remote Jobs",
];

const HOW_IT_WORKS = [
  {
    step: "01",
    bg: "bg-blue-50",
    border: "border-blue-100",
    numColor: "text-blue-500",
    title: "Profile banao",
    desc: "Skills aur experience add karo. Resume upload karo — AI automatically parse kar lega.",
  },
  {
    step: "02",
    bg: "bg-pink-50",
    border: "border-pink-100",
    numColor: "text-pink-500",
    title: "Jobs search karo",
    desc: "Search history se AI samajhta hai tumhe kya chahiye. Har search pe better results milte hain.",
  },
  {
    step: "03",
    bg: "bg-amber-50",
    border: "border-amber-100",
    numColor: "text-amber-500",
    title: "Apply karo",
    desc: "Dashboard pe personalized recommendations dekho. Ek click mein apply karo.",
  },
];

// ─────────────────────────────────────────────────────────────
// COLOR MAP — color string se Tailwind classes
// ─────────────────────────────────────────────────────────────
// NOTE: Tailwind dynamic class purging se bachne ke liye
// poori class string likhni padti hai — shortcut nahi chalta
const COLOR_MAP = {
  blue: {
    cardBg:     "bg-blue-50/60",
    cardBorder: "border-blue-100",
    logoBg:     "bg-blue-100",
    logoText:   "text-blue-600",
    skillBg:    "bg-blue-50",
    skillText:  "text-blue-600",
    skillBorder:"border-blue-100",
    divider:    "border-blue-100",
  },
  pink: {
    cardBg:     "bg-pink-50/60",
    cardBorder: "border-pink-100",
    logoBg:     "bg-pink-100",
    logoText:   "text-pink-600",
    skillBg:    "bg-pink-50",
    skillText:  "text-pink-600",
    skillBorder:"border-pink-100",
    divider:    "border-pink-100",
  },
  emerald: {
    cardBg:     "bg-emerald-50/60",
    cardBorder: "border-emerald-100",
    logoBg:     "bg-emerald-100",
    logoText:   "text-emerald-600",
    skillBg:    "bg-emerald-50",
    skillText:  "text-emerald-600",
    skillBorder:"border-emerald-100",
    divider:    "border-emerald-100",
  },
  rose: {
    cardBg:     "bg-rose-50/60",
    cardBorder: "border-rose-100",
    logoBg:     "bg-rose-100",
    logoText:   "text-rose-600",
    skillBg:    "bg-rose-50",
    skillText:  "text-rose-600",
    skillBorder:"border-rose-100",
    divider:    "border-rose-100",
  },
  violet: {
    cardBg:     "bg-violet-50/60",
    cardBorder: "border-violet-100",
    logoBg:     "bg-violet-100",
    logoText:   "text-violet-600",
    skillBg:    "bg-violet-50",
    skillText:  "text-violet-600",
    skillBorder:"border-violet-100",
    divider:    "border-violet-100",
  },
  amber: {
    cardBg:     "bg-amber-50/60",
    cardBorder: "border-amber-100",
    logoBg:     "bg-amber-100",
    logoText:   "text-amber-600",
    skillBg:    "bg-amber-50",
    skillText:  "text-amber-600",
    skillBorder:"border-amber-100",
    divider:    "border-amber-100",
  },
};

const BADGE_MAP = {
  red:   "bg-red-50 text-red-500 border border-red-100",
  amber: "bg-amber-50 text-amber-600 border border-amber-100",
  blue:  "bg-blue-50 text-blue-500 border border-blue-100",
};

// ─────────────────────────────────────────────────────────────
// JOB CARD COMPONENT
// ─────────────────────────────────────────────────────────────

function JobCard({ job }) {
  const [saved, setSaved] = useState(false);
  const c = COLOR_MAP[job.color] || COLOR_MAP.blue;
  const b = BADGE_MAP[job.badgeColor] || BADGE_MAP.blue;

  return (
    <div
      className={`
        ${c.cardBg} border ${c.cardBorder}
        backdrop-blur-sm rounded-2xl p-5
        cursor-pointer transition-all duration-300
        hover:shadow-lg hover:shadow-slate-200/60
        hover:-translate-y-1 hover:border-opacity-60
      `}
    >
      {/* Top — logo + badge + save */}
      <div className="flex justify-between items-start mb-4">
        <div className={`w-11 h-11 ${c.logoBg} ${c.logoText} rounded-xl flex items-center justify-center font-bold text-lg`}>
          {job.logo}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${b}`}>
            {job.badge}
          </span>
          <button
            onClick={(e) => { e.preventDefault(); setSaved((s) => !s); }}
            className={`text-xl leading-none transition-colors ${saved ? "text-amber-400" : "text-slate-300 hover:text-slate-400"}`}
          >
            {saved ? "★" : "☆"}
          </button>
        </div>
      </div>

      {/* Title + company */}
      <h3 className="font-bold text-sm text-text-primary mb-1 leading-snug">
        {job.title}
      </h3>
      <p className="text-slate-400 text-xs mb-4">
        {job.company} · {job.type}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.skills.map((skill) => (
          <span
            key={skill}
            className={`${c.skillBg} ${c.skillText} border ${c.skillBorder} text-xs px-2.5 py-1 rounded-lg`}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Bottom — salary + location */}
      <div className={`flex justify-between items-center pt-3 border-t ${c.divider}`}>
        <span className="text-amber-500 font-bold text-sm">
          {job.salary}
        </span>
        <span className="text-slate-400 text-xs">
          📍 {job.location}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SCROLLING LOGOS — CSS animation se infinite scroll
// ─────────────────────────────────────────────────────────────

function ScrollingLogos() {
  // Logos ko double karo — end pe pahunchne pe
  // seamless loop lagte — gap nahi dikhta
  const doubled = [...COMPANIES, ...COMPANIES];

  return (
    <div className="w-full overflow-hidden py-8 border-y border-border-glass">
      <p className="text-center text-slate-400 text-xs mb-6 tracking-widest uppercase">
        Trusted by top companies
      </p>

      {/* Outer div clips the overflow */}
      <div className="relative">
        {/* Inner div scroll karta hai left */}
        <div
          className="flex gap-6 w-max"
          style={{
            animation: "scrollLeft 30s linear infinite",
          }}
        >
          {doubled.map((company, i) => (
            <div
              key={i}
              className={`flex items-center gap-2.5 ${company.bg} px-4 py-2.5 rounded-xl flex-shrink-0 border border-white/80`}
            >
              {/* Logo circle */}
              <div className={`w-7 h-7 rounded-lg bg-bg-card flex items-center justify-center font-bold text-sm ${company.text}`}>
                {company.letter}
              </div>
              <span className={`font-semibold text-sm ${company.text} whitespace-nowrap`}>
                {company.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CSS animation — yahan inject karo */}
      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  
  const [featuredJobs, setFeaturedJobs] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await api.get('/jobs');
        if (res.data.success) {
          // Take top 3 latest jobs
          const topJobs = res.data.jobs.slice(0, 3).map(j => {
            const colors = ['blue', 'pink', 'emerald', 'rose', 'violet', 'amber'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            let badge = "🚀 New";
            let badgeColor = "blue";
            if (j.jobType === 'remote') { badge = "🌐 Remote"; badgeColor = "emerald"; }
            if (j.salary && typeof j.salary === 'object' && j.salary.min > 1500000) { badge = "🔥 Hot"; badgeColor = "red"; }

            const minSal = j.salary?.min ? `₹${(j.salary.min / 100000).toFixed(1)}L` : null;
            const maxSal = j.salary?.max ? `- ${(j.salary.max / 100000).toFixed(1)}L` : null;
            const salaryTxt = minSal ? `${minSal} ${maxSal || ''}` : 'Competitive';

            return {
              id: j._id,
              logo: j.company?.charAt(0)?.toUpperCase() || "J",
              color: randomColor,
              badge: badge,
              badgeColor: badgeColor,
              title: j.title,
              company: j.company,
              type: j.jobType || "Full-time",
              skills: j.skills?.slice(0, 3) || [],
              salary: salaryTxt,
              location: j.location || "Remote",
            };
          });
          setFeaturedJobs(topJobs);
        }
      } catch (err) {
        console.error("Failed to load featured jobs", err);
      }
    }
    fetchFeatured();
  }, []);

  function handleSearch() {
    const q = search.trim();
    if (q) router.push("/dashboard/jobs?keyword=" + encodeURIComponent(q));
  }

  return (
    // Pure white background
    <div className="min-h-screen bg-bg-card text-text-primary">

      {/* ══════════════════════════════════════════════
          HEADER — Navigation
      ══════════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              J
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Job<span className="text-blue-600">Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {mounted ? (
              isLoggedIn ? (
                <>
                  <div className="hidden md:flex items-center gap-2 mr-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      Hi, {user?.name?.split(" ")[0] || "User"}
                    </span>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors"
                  >
                    Settings
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2 rounded-xl text-sm transition-all shadow-md shadow-blue-200"
                  >
                    Dashboard →
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2 rounded-xl text-sm transition-all"
                  >
                    Sign Up
                  </Link>
                </>
              )
            ) : (
              <div className="w-32 h-8 bg-slate-100 animate-pulse rounded-xl" /> // Placeholder while mounting
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          HERO — gradient white background
      ══════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 pt-36 pb-20 overflow-hidden"
        style={{
          // Soft gradient — white to very light blue
          background: "linear-gradient(160deg, #ffffff 0%, #EFF6FF 50%, #FFF7ED 100%)",
        }}
      >
        {/* Very soft background blobs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-100/40 rounded-full blur-3xl pointer-events-none" />

        {/* AI badge */}
        <div className="flex items-center gap-2 bg-bg-card border border-blue-100 rounded-full px-4 py-2 text-blue-600 text-sm mb-8 shadow-sm">
          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          AI-Powered Job Matching
        </div>

        {/* Heading */}
        <h1 className="font-bold text-5xl md:text-6xl leading-tight tracking-tight mb-6 text-text-primary">
          Find Your
          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #3B82F6, #EC4899, #F59E0B)",
            }}
          >
            Dream Career
          </span>
        </h1>

        <p className="text-text-secondary text-lg max-w-lg leading-relaxed mb-10 font-light">
          Smart recommendations based on your skills and searches.
          Let AI find the perfect job for you.
        </p>

        {/* Search bar */}
        <div
          className="flex w-full max-w-xl bg-bg-card border border-border rounded-2xl overflow-hidden shadow-md focus-within:border-blue-300 focus-within:shadow-blue-100 transition-all duration-300"
        >
          <input
            type="text"
            placeholder="Job title, skill, ya company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-transparent outline-none px-5 py-4 text-text-primary placeholder-slate-400 text-sm"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 text-sm transition-colors duration-200"
          >
            Search →
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSearch(tag)}
              className="bg-bg-card hover:bg-blue-50 border border-border hover:border-blue-200 text-text-secondary hover:text-blue-600 text-xs px-4 py-1.5 rounded-full transition-all duration-200 shadow-sm"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SCROLLING COMPANY LOGOS
      ══════════════════════════════════════════════ */}
      <ScrollingLogos />

      {/* ══════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════ */}
      <section className="flex flex-wrap justify-center gap-10 md:gap-20 py-14 bg-slate-50">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className={`font-bold text-4xl ${stat.color}`}>
              {stat.num}
            </div>
            <div className="text-text-secondary text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED JOBS
      ══════════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 py-16">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-bold text-2xl tracking-tight text-text-primary">
              Featured Jobs
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              AI ne tumhare liye select kiye
            </p>
          </div>
          <Link
            href="/dashboard/jobs"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
          >
            Sab dekho →
          </Link>
        </div>

        {/* 3 column grid */}
        {featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredJobs.map((job) => (
              <div key={job.id} onClick={() => router.push(`/dashboard/jobs/${job.id}`)}>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-10 border border-dashed border-slate-200 rounded-2xl">
            No active jobs found right now. Check back later!
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-bold text-2xl text-center text-text-primary mb-12">
            Kaise kaam karta hai?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className={`${item.bg} border ${item.border} rounded-2xl p-6 text-center`}
              >
                <div className={`font-bold text-4xl ${item.numColor} mb-4`}>
                  {item.step}
                </div>
                <h3 className="font-bold text-base text-text-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════ */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="font-bold text-3xl text-text-primary mb-4 tracking-tight">
          Ready to start?
        </h2>
        <p className="text-text-secondary mb-8">
          Free mein account banao — koi credit card nahi chahiye
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-md shadow-blue-200 inline-block"
          >
            Free mein shuru karo →
          </Link>
          <Link
            href="/dashboard/jobs"
            className="bg-bg-card border border-border hover:border-blue-300 text-text-secondary hover:text-blue-600 font-medium px-8 py-3 rounded-xl transition-all duration-200 inline-block shadow-sm"
          >
            Jobs browse karo
          </Link>
        </div>
      </section>

    </div>
  );
}