'use client'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { track } from '@/lib/analytics'
import { pdfPickFor } from '@/lib/guide-pdfs'

/**
 * The free PDF that fits a guide, shown at the end of the guide. These were
 * shop products until Nov 20, 2026 (see lib/guide-pdfs.ts). A client
 * component only so the download is recorded (`guide_pdf_downloaded`).
 */
export default function GuidePdfCard({ guide }: { guide: string }) {
  const pick = pdfPickFor(guide)
  if (!pick) return null
  const { pdf, note, bundle } = pick
  const downloaded = (key: string) => () => track('guide_pdf_downloaded', { from: 'guide', guide, pdf: key })

  return (
    <aside className="my-16 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-400">Free PDF</p>
      <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pdf.image}
          alt={`Cover of ${pdf.name}`}
          width={120}
          height={156}
          loading="lazy"
          className="h-auto w-[120px] flex-none rounded-md border border-[#2a2a2a] shadow-lg shadow-black/40"
        />
        <div className="min-w-0">
          <p className="text-lg font-extrabold leading-snug text-white">{pdf.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-300">{note}</p>
          {bundle && <p className="mt-1 text-sm leading-relaxed text-gray-400">{pdf.pitch}</p>}
          <a
            href={pdf.file}
            download
            onClick={downloaded(pdf.key)}
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-bold text-black transition-colors hover:bg-amber-400"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download the PDF <span className="font-semibold text-black/60">({pdf.size})</span>
          </a>
          {bundle && (
            <p className="mt-4 text-sm text-gray-400">
              Or all 14 guides and the worksheets in one file:{' '}
              <a
                href={bundle.file}
                download
                onClick={downloaded(bundle.key)}
                className="font-semibold text-amber-400 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-300"
              >
                the Complete Edition
              </a>{' '}
              ({bundle.size}).
            </p>
          )}
          <p className="mt-3 text-xs text-gray-500">Free. No sign-up, no email. More PDFs and kits on <Link href="/guides#downloads" className="underline underline-offset-2 hover:text-gray-300">the guides page</Link>.</p>
        </div>
      </div>
    </aside>
  )
}
