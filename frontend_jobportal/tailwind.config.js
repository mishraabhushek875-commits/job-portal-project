// tailwind.config.js
/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
      },
      keyframes: {
        fadeDown: {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        gradShift: {
          "0%":   { backgroundPosition: "0% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fabPulse: {
          "0%,100%": { boxShadow: "0 8px 25px rgba(29,78,216,0.5)" },
          "50%":     { boxShadow: "0 8px 45px rgba(29,78,216,0.85)" },
        },
        pulseDot: {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(251,191,36,0.7)" },
          "50%":     { boxShadow: "0 0 0 6px rgba(251,191,36,0)" },
        },
      },
      animation: {
        "fade-down":  "fadeDown 0.5s ease both",
        "fade-up":    "fadeUp 0.5s ease both",
        "grad-shift": "gradShift 4s linear infinite",
        "slide-up":   "slideUp 0.3s ease both",
        "fab-pulse":  "fabPulse 3s ease-in-out infinite",
        "pulse-dot":  "pulseDot 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;