'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { track } from '@/lib/analytics'
import type { RelatedTool } from '@/lib/tools/related-tool'

/**
 * A pointer from a blog post to the free tool that fits it. A client component
 * only so the click is attributed the same way as the blog's signup CTAs
 * (`blog_cta_clicked`, position `tool`).
 */
export default function BlogToolCard({ slug, tool }: { slug: string; tool: RelatedTool }) {
  return (
    <aside className="mb-16 rounded-2xl border border-gray-800 bg-gray-900/60 p-6 not-prose">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gray-400">Free tool</p>
      <p className="mt-2 text-base font-semibold text-gray-100">{tool.name}</p>
      <p className="mt-1.5 text-sm text-gray-400">{tool.pitch}</p>
      <Link
        href={tool.href}
        onClick={() => track('blog_cta_clicked', { slug, position: 'tool', tool: tool.href })}
        className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-700 px-5 text-sm font-semibold text-gray-100 transition-colors hover:border-gray-500"
      >
        Open the tool <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </aside>
  )
}
