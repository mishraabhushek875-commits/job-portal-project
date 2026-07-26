"use client"
// ─────────────────────────────────────────────────────
// Footer.jsx
// Features:
//  - Animated gradient top border
//  - Links columns
//  - Social icons
//  - "Back to top" button
//  - Live jobs counter animation
// ─────────────────────────────────────────────────────

import { useState, useEffect } from "react"
import Link from "next/link"

// Footer links ka data
const FOOTER_LINKS = {
  "Company": [
    { label: "About Us",  href: "/about" },
    { label: "Careers",   href: "/careers" },
    { label: "Blog",      href: "/blog" },
    { label: "Press",     href: "/press" },
  ],
  "For Job Seekers": [
    { label: "Browse Jobs",       href: "/jobs" },
    { label: "Resume Builder",    href: "/resume" },
    { label: "Career Advice",     href: "/advice" },
    { label: "Salary Guide",      href: "/salary" },
  ],
  "For Employers": [
    { label: "Post a Job",        href: "/post-job" },
    { label: "Find Candidates",   href: "/candidates" },
    { label: "Pricing",           href: "/pricing" },
    { label: "Enterprise",        href: "/enterprise" },
  ],
  "Support": [
    { label: "Help Center",   href: "/help" },
    { label: "Contact Us",    href: "/contact" },
    { label: "Privacy",       href: "/privacy" },
    { label: "Terms",         href: "/terms" },
  ],
}

// Social icons
const SOCIALS = [
  { icon: "𝕏", label: "Twitter",  href: "#" },
  { icon: "in", label: "LinkedIn", href: "#" },
  { icon: "▶",  label: "YouTube",  href: "#" },
  { icon: "◉",  label: "Instagram",href: "#" },
]

export default function Footer() {
  // liveCount — animated counter (fake live jobs count)
  const [liveCount, setLiveCount] = useState(12480)

  // backToTop — button show/hide based on scroll
  const [showTop, setShowTop] = useState(false)

  // Har 5 second mein count thoda badhao (live feel)
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount((prev) => prev + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Scroll pe back-to-top button dikhao
  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 400)
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative bg-slate-900 border-t border-slate-800 mt-16">

      {/* Animated top border — blue to red to yellow */}
      <div className="absolute top-0 left-0 right-0 h-0.5
                      bg-gradient-to-r from-blue-500 via-red-500 to-yellow-400
                      bg-[length:200%] animate-grad-shift" />

      {/* ── LIVE JOBS BANNER ─────────────────────────── */}
      <div className="bg-slate-800/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4
                        flex items-center justify-between flex-wrap gap-4">

          {/* Live counter */}
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-slate-400 text-sm">
              <span className="text-white font-display font-bold text-lg">
                {liveCount.toLocaleString("en-IN")}
              </span>
              {" "}active jobs right now
            </span>
          </div>

          {/* Post job CTA */}
          <Link
            href="/post-job"
            className="text-sm text-blue-400 hover:text-blue-300
                       transition-colors border border-blue-500/30
                       hover:border-blue-400 px-4 py-1.5 rounded-xl"
          >
            + Post a Job Free
          </Link>
        </div>
      </div>

      {/* ── MAIN FOOTER ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">

          {/* Brand column — 2 cols wide */}
          <div className="col-span-2">
            {/* Logo */}
            <div className="font-display font-extrabold text-2xl
                            bg-gradient-to-r from-blue-400 via-red-400 to-yellow-400
                            bg-clip-text text-transparent mb-3">
              JobSpark ⚡
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              AI-powered job matching that connects the right talent
              with the right opportunity. Find your dream career today.
            </p>

            {/* Social icons */}
            <div className="flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  title={s.label}
                  className="w-9 h-9 bg-slate-800 border border-slate-700
                             rounded-xl flex items-center justify-center
                             text-slate-400 text-xs font-bold
                             hover:border-blue-500 hover:text-blue-400
                             hover:-translate-y-0.5
                             transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-display font-bold text-sm text-white mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white text-sm
                                 transition-colors duration-200
                                 hover:translate-x-0.5 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── BOTTOM BAR ───────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-slate-800
                        flex flex-col md:flex-row justify-between
                        items-center gap-4">

          <p className="text-text-secondary text-xs">
            © 2025 JobSpark. Made with ❤️ in India.
          </p>

          {/* App download badges */}
          <div className="flex gap-2">
            <div className="flex items-center gap-2 bg-slate-800
                            border border-slate-700 rounded-xl px-3 py-1.5
                            hover:border-blue-500 transition-colors cursor-pointer">
              <span className="text-base">🍎</span>
              <div>
                <div className="text-text-secondary text-xs leading-none">Download on</div>
                <div className="text-white text-xs font-semibold leading-none mt-0.5">App Store</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-800
                            border border-slate-700 rounded-xl px-3 py-1.5
                            hover:border-blue-500 transition-colors cursor-pointer">
              <span className="text-base">▶</span>
              <div>
                <div className="text-text-secondary text-xs leading-none">Get it on</div>
                <div className="text-white text-xs font-semibold leading-none mt-0.5">Google Play</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BACK TO TOP BUTTON ───────────────────────── */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 left-6 w-10 h-10 bg-slate-700
                     border border-slate-600 hover:border-blue-500
                     hover:bg-blue-600 text-white rounded-xl
                     flex items-center justify-center text-sm
                     transition-all duration-200 hover:-translate-y-1
                     shadow-lg animate-fade-up z-40"
          title="Back to top"
        >
          ↑
        </button>
      )}
    </footer>
  )
}