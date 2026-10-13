'use client'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import BlogClientList from '@/components/BlogClientList'
import type { BlogPost } from '@/components/BlogClientList'

interface Props {
  allPosts: BlogPost[]
}

export default function BlogI18nStrings({ allPosts }: Props) {
  const { t } = useI18n()

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-display-md mb-2 text-ink-high">{t('blog_index.heading')}</h1>
        <p className="text-sm text-ink-muted">{t('blog_index.tagline')}</p>
      </div>

      <BlogClientList allPosts={allPosts} />

      <div className="mt-8 bg-panel border border-edge rounded-2xl p-6 text-center">
        <p className="font-display text-lg font-semibold mb-1 text-ink-high">{t('blog_index.cta_title')}</p>
        <p className="text-sm text-ink-muted mb-4">{t('blog_index.cta_desc')}</p>
        <Link href="/signup"
          className="inline-block bg-gradient-to-b from-amber-bright to-amber hover:to-amber-bright text-void text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          {t('blog_index.cta_button')}
        </Link>
      </div>

      <div className="border-t border-edge mt-16 pt-10 pb-4">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-ink-muted">
            <Heart className="inline w-4 h-4 mr-1 -mt-0.5 text-amber" strokeWidth={1.75} aria-hidden="true" /><span className="font-semibold text-ink-body">{t('blog_index.give_text')}</span>{' '}
            <a href="/give" className="text-amber hover:text-amber-bright font-semibold transition-colors">{t('blog_index.give_link')}</a>
          </p>
        </div>
      </div>
    </>
  )
}
