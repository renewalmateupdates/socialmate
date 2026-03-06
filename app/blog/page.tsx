'use client'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

const POSTS = [
  {
    slug: 'socialmate-vs-buffer',
    title: 'SocialMate vs Buffer: Why Free Beats $18/month',
    date: 'March 2025',
    category: 'Comparisons',
    excerpt: 'Buffer charges $18/month for what SocialMate gives you free. Here\'s the full breakdown.',
    readTime: '4 min read',
  },
  {
    slug: 'free-social-media-scheduler',
    title: 'The Best Free Social Media Scheduler in 2025',
    date: 'February 2025',
    category: 'Guides',
    excerpt: 'Most "free" schedulers are just trials. SocialMate is genuinely free — here\'s what you actually get.',
    readTime: '5 min read',
  },
  {
    slug: 'ai-caption-generator',
    title: 'How to Use AI to Write Better Social Media Captions',
    date: 'February 2025',
    category: 'Tips',
    excerpt: 'AI caption tools can save hours every week. Here\'s how to use them without sounding like a robot.',
    readTime: '3 min read',
  },
]

export default function Blog() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Blog</h1>
            <p className="text-sm text-gray-400 mt-0.5">Tips, guides, and updates from SocialMate</p>
          </div>
          <div className="space-y-4">
            {POSTS.map(post => (
              <div key={post.slug} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-gray-300 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{post.category}</span>
                  <span className="text-xs text-gray-400">{post.date}</span>
                  <span className="text-xs text-gray-400">· {post.readTime}</span>
                </div>
                <h2 className="text-base font-extrabold mb-2">{post.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}