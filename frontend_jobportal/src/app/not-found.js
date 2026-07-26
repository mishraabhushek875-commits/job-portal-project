// src/app/not-found.js
// Next.js automatically is file ko 404 pe use karta hai

import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 text-white
                    flex flex-col items-center justify-center gap-5">

      <div className="font-display font-bold text-9xl text-text-primary">
        404
      </div>

      <h2 className="font-display font-bold text-2xl">
        Page nahi mila
      </h2>

      <p className="text-text-secondary text-sm">
        Yeh page exist nahi karta
      </p>

      <Link
        href="/home"
        className="bg-blue-600 hover:bg-blue-500 text-white
                   px-6 py-2.5 rounded-xl font-semibold text-sm
                   transition-colors"
      >
        Home pe jao
      </Link>
    </div>
  )
}