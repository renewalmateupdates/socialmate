'use client'
import Link from 'next/link'
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
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">{t('blog_index.heading')}</h1>
        <p className="text-sm text-gray-400">{t('blog_index.tagline')}</p>
      </div>

      <BlogClientList allPosts={allPosts} />

      <div className="mt-8 bg-gray-800 border border-gray-700 rounded-2xl p-6 text-center">
        <p className="text-sm font-extrabold mb-1 text-gray-100">{t('blog_index.cta_title')}</p>
        <p className="text-xs text-gray-400 mb-4">{t('blog_index.cta_desc')}</p>
        <Link href="/signup"
          className="inline-block bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all">
          {t('blog_index.cta_button')}
        </Link>
      </div>

      <div className="border-t border-gray-800 mt-16 pt-10 pb-4">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400">
            ❤️ <span className="font-semibold text-gray-300">{t('blog_index.give_text')}</span>{' '}
            <a href="/give" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">{t('blog_index.give_link')}</a>
          </p>
        </div>
      </div>
    </>
  )
}
