'use client'
import { useEffect } from 'react'

interface Props {
  title: string
}

export default function GuidePDFDownload({ title }: Props) {
  useEffect(() => {
    const existing = document.getElementById('guide-watermark')
    if (existing) return
    const el = document.createElement('div')
    el.id = 'guide-watermark'
    el.innerHTML = `SocialMate<br/>socialmate.studio`
    document.body.appendChild(el)
    return () => { el.remove() }
  }, [])

  const handlePrint = () => {
    document.title = title + ' — Gilgamesh\'s Guides'
    window.print()
    setTimeout(() => { document.title = 'SocialMate' }, 1000)
  }

  return (
    <div className="no-print flex justify-center mt-12 mb-4">
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-all text-sm"
      >
        📄 Download as PDF
      </button>
    </div>
  )
}
