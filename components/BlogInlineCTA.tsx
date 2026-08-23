'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { track } from '@/lib/analytics'

/**
 * The blog-to-product handoff.
 *
 * Last month the blog pulled the large majority of 2,623 visitors and /signup
 * saw 43 people — fewer than reached /login, and two more than read the privacy
 * policy. There was already a CTA on every post, but it sat below ~1,500 words
 * and a strip of 26 competitor links, at an 88% bounce rate. Almost nobody
 * scrolled to it.
 *
 * So this one goes mid-article, after the reader has had a reason to trust the
 * page but before the point most of them leave. It is a client component purely
 * so the click can be attributed: `blog_cta_clicked` carries the slug and the
 * position, which finally makes "does the blog convert" a question with an
 * answer instead of a guess.
 */
export default function BlogInlineCTA({
  slug,
  position = 'inline',
}: {
  slug: string
  /** Which CTA on the page fired. Lets inline and footer be compared directly. */
  position?: 'inline' | 'footer' | 'nav'
}) {
  if (position !== 'inline') {
    return (
      <Link
        href="/signup"
        onClick={() => track('blog_cta_clicked', { slug, position })}
        className="inline-block bg-gray-950 text-white text-sm font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-all"
      >
        Create free account →
      </Link>
    )
  }

  return (
    <aside className="my-10 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] p-6 not-prose">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber-400">
        While you&apos;re here
      </p>
      <p className="mt-2 text-base font-semibold text-gray-100">
        You can schedule everything in this article from one place.
      </p>
      <p className="mt-1.5 text-sm text-gray-400">
        Seven platforms, 15+ AI tools, free forever. No card, about a minute to set up.
      </p>
      <Link
        href="/signup"
        onClick={() => track('blog_cta_clicked', { slug, position })}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-gray-950 transition-all hover:bg-amber-400"
      >
        Create a free account <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </aside>
  )
}
