'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import PlatformIcon, { hasPlatformIcon } from '@/components/landing/PlatformIcon'
import { BarChart3, CalendarDays, CalendarRange, FileText, Folder, Globe, Hash, PenLine, Search as SearchIcon, Settings, Users, X as CloseIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

function PlatformGlyph({ id, size = 12, className = '' }: { id: string; size?: number; className?: string }) {
  if (!hasPlatformIcon(id)) return <Globe size={size} className={className} strokeWidth={1.75} />
  return <PlatformIcon name={id} size={size} className={className} />
}

type ResultType = 'post' | 'template' | 'hashtag'

interface Result {
  id: string
  type: ResultType
  title: string
  subtitle: string
  href: string
  meta?: string[]
}

const TYPE_LABELS: Record<ResultType, { label: string; icon: LucideIcon }> = {
  post:     { label: 'Post',     icon: PenLine  },
  template: { label: 'Template', icon: FileText  },
  hashtag:  { label: 'Hashtags', icon: Hash },
}

const QUICK_LINKS = [
  { label: 'Compose new post',    href: '/compose',        icon: PenLine  },
  { label: 'View drafts',         href: '/drafts',         icon: Folder  },
  { label: 'Content calendar',    href: '/calendar',       icon: CalendarDays  },
  { label: 'Bulk scheduler',      href: '/bulk-scheduler', icon: CalendarRange  },
  { label: 'Analytics',           href: '/analytics',      icon: BarChart3  },
  { label: 'Hashtag collections', href: '/hashtags',       icon: Hash },
  { label: 'Post templates',      href: '/templates',      icon: FileText  },
  { label: 'Team management',     href: '/team',           icon: Users  },
  { label: 'Account settings',    href: '/settings',       icon: Settings  },
]

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
    }
    init()
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [router])

  const runSearch = useCallback(async (q: string) => {
    if (!userId) return
    setSearching(true)
    setHasSearched(true)
    const all: Result[] = []

    const [postsRes, templatesRes, hashtagsRes] = await Promise.all([
      supabase.from('posts')
        .select('id, content, status, platforms')
        .eq('user_id', userId)
        .ilike('content', `%${q}%`)
        .limit(10),
      supabase.from('post_templates')
        .select('id, name, content')
        .eq('user_id', userId)
        .or(`name.ilike.%${q}%,content.ilike.%${q}%`)
        .limit(5),
      supabase.from('hashtag_collections')
        .select('id, name, hashtags')
        .eq('user_id', userId)
        .ilike('name', `%${q}%`)
        .limit(5),
    ])

    ;(postsRes.data || []).forEach(p => {
      all.push({
        id: p.id,
        type: 'post',
        title: p.content?.slice(0, 80) || 'Untitled post',
        subtitle: p.status === 'scheduled' ? 'Scheduled' : p.status === 'draft' ? 'Draft' : p.status,
        href: p.status === 'draft' ? '/drafts' : '/queue',
        meta: p.platforms || [],
      })
    })

    ;(templatesRes.data || []).forEach(t => {
      all.push({
        id: t.id,
        type: 'template',
        title: t.name,
        subtitle: t.content?.slice(0, 80) || '',
        href: `/compose?template=${t.id}`,
      })
    })

    ;(hashtagsRes.data || []).forEach(h => {
      all.push({
        id: h.id,
        type: 'hashtag',
        title: h.name,
        subtitle: `${(h.hashtags || []).length} hashtags`,
        href: `/hashtags`,
      })
    })

    setResults(all)
    setSearching(false)
  }, [userId])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || !userId) {
      setResults([])
      setHasSearched(false)
      return
    }
    debounceRef.current = setTimeout(() => runSearch(query.trim()), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, userId, runSearch])

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight">Search</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Find posts, templates, and hashtag collections</p>
          </div>

          {/* SEARCH INPUT */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search posts, templates, hashtags..."
              className="w-full pl-10 pr-10 py-3.5 text-sm bg-surface border border-theme-md rounded-2xl focus:outline-none focus:border-gray-400 shadow-sm"
            />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-all text-sm">
                <CloseIcon className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* SEARCHING SKELETON */}
          {searching && (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-16 animate-pulse" />
              ))}
            </div>
          )}

          {/* EMPTY STATE */}
          {!searching && hasSearched && results.length === 0 && (
            <div className="bg-surface border border-theme rounded-2xl p-10 text-center">
              <SearchIcon className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
              <p className="text-sm font-bold mb-1">No results for "{query}"</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Try different keywords or check your spelling.</p>
            </div>
          )}

          {/* RESULTS */}
          {!searching && results.length > 0 && (
            <div className="space-y-2 mb-8">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map(r => {
                const typeInfo = TYPE_LABELS[r.type]
                return (
                  <Link key={r.id} href={r.href}
                    className="flex items-center gap-3 bg-surface border border-theme rounded-2xl p-4 hover:border-gray-300 transition-all group">
                    <div className="w-9 h-9 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      <typeInfo.icon className="w-4 h-4" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="text-xs font-extrabold truncate">{r.title}</p>
                        <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {typeInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{r.subtitle}</p>
                    </div>
                    {r.meta && r.meta.length > 0 && (
                      <span className="flex items-center gap-1 flex-shrink-0">
                        {r.meta.map(p => <PlatformGlyph key={p} id={p} size={13} />)}
                      </span>
                    )}
                    <span className="text-gray-300 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-all text-xs flex-shrink-0">→</span>
                  </Link>
                )
              })}
            </div>
          )}

          {/* QUICK LINKS */}
          {!query && (
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Quick Links</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {QUICK_LINKS.map(link => (
                  <Link key={link.href} href={link.href}
                    className="flex items-center gap-2 bg-surface border border-theme rounded-xl px-3 py-2.5 hover:border-gray-300 transition-all group">
                    <link.icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-all truncate">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
