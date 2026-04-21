'use client'
import { useState } from 'react'

interface Props {
  logoUrl: string | null
  name: string
}

export default function NsfwLogoReveal({ logoUrl, name }: Props) {
  const [revealed, setRevealed] = useState(false)

  if (!logoUrl) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-2xl font-extrabold text-gray-400 shrink-0">
        {name.charAt(0)}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
      title={revealed ? undefined : 'Click to reveal (18+ content)'}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={name}
        className={`w-full h-full object-cover transition-all duration-300 ${revealed ? 'blur-none' : 'blur-xl scale-110'}`}
      />
      {!revealed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="text-[10px] font-extrabold text-white bg-red-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider leading-none">18+</span>
        </div>
      )}
    </button>
  )
}
