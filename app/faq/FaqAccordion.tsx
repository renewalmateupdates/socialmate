'use client'
import { useState } from 'react'

interface Faq { q: string; a: string }
interface Section { title: string; faqs: Faq[] }

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function FaqItem({ faq }: { faq: Faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-gray-800/50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-bold text-white text-sm sm:text-base">{faq.q}</span>
        <span className="text-amber-400">
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  )
}

export default function FaqAccordion({ sections }: { sections: Section[] }) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(sections.map(s => [s.title, true]))
  )

  const toggleSection = (title: string) =>
    setOpenSections(prev => ({ ...prev, [title]: !prev[title] }))

  return (
    <div className="space-y-10">
      {sections.map(section => (
        <div key={section.title}>
          <button
            onClick={() => toggleSection(section.title)}
            className="w-full flex items-center justify-between gap-3 mb-5 pb-2 border-b border-gray-800 group"
            aria-expanded={openSections[section.title]}
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-400/80 group-hover:text-amber-400 transition-colors">
              {section.title}
            </h2>
            <span className="text-amber-400/60 group-hover:text-amber-400 transition-colors">
              <ChevronIcon open={!!openSections[section.title]} />
            </span>
          </button>
          {openSections[section.title] && (
            <div className="space-y-3">
              {section.faqs.map(faq => (
                <FaqItem key={faq.q} faq={faq} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
