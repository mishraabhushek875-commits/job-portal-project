'use client';

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

export default function ScrollingLogos() {
  const doubled = [...COMPANIES, ...COMPANIES];

  return (
    <div className="w-full overflow-hidden py-8 border-y border-border-glass">
      <p className="text-center text-slate-400 text-xs mb-6 tracking-widest uppercase">
        Trusted by top companies
      </p>

      <div className="relative">
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

      <style>{`
        @keyframes scrollLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
