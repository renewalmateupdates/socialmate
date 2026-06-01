'use client'
import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useI18n } from '@/contexts/I18nContext'

const PLATFORM_LABELS: Record<string, string> = {
  bluesky: 'Bluesky',
  mastodon: 'Mastodon',
  twitter: 'X / Twitter',
  discord: 'Discord',
  telegram: 'Telegram',
  tiktok: 'TikTok',
}

const CATEGORIES = ['All', 'Wins', 'Questions', 'Tips', 'Feedback', 'Intros']
const REACTIONS = ['🔥', '💯', '👏', '🚀', '❤️', '🤔']

interface Post {
  id: string
  user_id: string
  content: string
  category: string
  created_at: string
  reactions: Record<string, string[]>
  author_name: string | null
  author_handle: string | null
  reply_count?: number
}

interface Reply {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  author_name: string | null
}

export default function AgoraPage() {
  const { t } = useI18n()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState('All')
  const [draft, setDraft] = useState('')
  const [draftCategory, setDraftCategory] = useState('Wins')
  const [posting, setPosting] = useState(false)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [replies, setReplies] = useState<Record<string, Reply[]>>({})
  const [replyDraft, setReplyDraft] = useState('')
  const [replyPosting, setReplyPosting] = useState(false)
  const textRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (!u) { setLoading(false); return }
      const res = await fetch('/api/accounts/connected')
      const data = await res.json()
      setConnectedPlatforms(data.platforms ?? [])
      await loadPosts()
      setLoading(false)
    }
    init()
  }, [])

  async function loadPosts() {
    const { data } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    setPosts(data ?? [])
  }

  async function loadReplies(postId: string) {
    const { data } = await supabase
      .from('community_replies')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    setReplies(prev => ({ ...prev, [postId]: data ?? [] }))
  }

  async function submitPost() {
    if (!draft.trim() || !user) return
    setPosting(true)
    const { data: profile } = await supabase
      .from('user_settings')
      .select('display_name')
      .eq('user_id', user.id)
      .single()
    const name = profile?.display_name || user.email?.split('@')[0] || 'Anonymous'
    await supabase.from('community_posts').insert({
      user_id: user.id,
      content: draft.trim(),
      category: draftCategory,
      reactions: {},
      author_name: name,
      author_handle: user.email?.split('@')[0] ?? null,
    })
    setDraft('')
    await loadPosts()
    setPosting(false)
  }

  async function submitReply(postId: string) {
    if (!replyDraft.trim() || !user) return
    setReplyPosting(true)
    const { data: profile } = await supabase
      .from('user_settings')
      .select('display_name')
      .eq('user_id', user.id)
      .single()
    const name = profile?.display_name || user.email?.split('@')[0] || 'Anonymous'
    await supabase.from('community_replies').insert({
      post_id: postId,
      user_id: user.id,
      content: replyDraft.trim(),
      author_name: name,
    })
    setReplyDraft('')
    await loadReplies(postId)
    setReplyPosting(false)
  }

  async function toggleReaction(postId: string, emoji: string) {
    if (!user) return
    const post = posts.find(p => p.id === postId)
    if (!post) return
    const current: Record<string, string[]> = { ...(post.reactions ?? {}) }
    const users: string[] = current[emoji] ?? []
    if (users.includes(user.id)) {
      current[emoji] = users.filter(id => id !== user.id)
    } else {
      current[emoji] = [...users, user.id]
    }
    await supabase.from('community_posts').update({ reactions: current }).eq('id', postId)
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions: current } : p))
  }

  function toggleExpand(postId: string) {
    if (expandedPost === postId) {
      setExpandedPost(null)
    } else {
      setExpandedPost(postId)
      if (!replies[postId]) loadReplies(postId)
    }
  }

  const filteredPosts = category === 'All' ? posts : posts.filter(p => p.category === category)
  const hasConnected = connectedPlatforms.length > 0

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
    </div>
  )

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white gap-4">
      <p className="text-xl font-bold">{t('community.sign_in_prompt')}</p>
      <a href="/login?redirect=/community" className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl">{t('community.sign_in_btn')}</a>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏛️</span>
            <h1 className="text-3xl font-extrabold tracking-tight">HESTIA</h1>
            <span className="text-xs font-bold bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full">Community</span>
          </div>
          <p className="text-gray-400 text-sm">
            {t('community.tagline')}
          </p>
        </div>

        {/* Gate: must have at least one connected account */}
        {!hasConnected ? (
          <div className="bg-gray-900 border border-amber-500/30 rounded-2xl p-8 text-center mb-8">
            <p className="text-2xl mb-3">🔌</p>
            <p className="font-extrabold text-lg mb-2">{t('community.gate_title')}</p>
            <p className="text-gray-400 text-sm mb-5">{t('community.gate_desc')}</p>
            <a href="/accounts" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-all text-sm">
              {t('community.gate_cta')}
            </a>
          </div>
        ) : (
          /* Compose box */
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
            <textarea
              ref={textRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder={t('community.compose_placeholder')}
              rows={3}
              maxLength={500}
              className="w-full bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none leading-relaxed"
            />
            <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <button
                    key={c}
                    onClick={() => setDraftCategory(c)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                      draftCategory === c
                        ? 'bg-amber-500 text-black'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >{c}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{draft.length}/500</span>
                <button
                  onClick={submitPost}
                  disabled={posting || !draft.trim()}
                  className="px-5 py-2 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 disabled:opacity-40 transition-all"
                >
                  {posting ? t('community.posting') : t('community.post_btn')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 no-scrollbar">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all ${
                category === c
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >{c}</button>
          ))}
        </div>

        {/* Feed */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <p className="text-4xl mb-3">🏛️</p>
            <p className="font-bold">{t('community.empty_title')} {category === 'All' ? 'HESTIA' : category}</p>
            <p className="text-sm mt-1">{t('community.empty_subtitle')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => {
              const totalReactions = Object.values(post.reactions ?? {}).reduce((sum, users) => sum + users.length, 0)
              const isExpanded = expandedPost === post.id
              const postReplies = replies[post.id] ?? []

              return (
                <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {(post.author_name ?? 'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none">{post.author_name ?? 'Anonymous'}</p>
                        {post.author_handle && <p className="text-xs text-gray-500">@{post.author_handle}</p>}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      post.category === 'Wins' ? 'bg-emerald-500/20 text-emerald-400' :
                      post.category === 'Questions' ? 'bg-blue-500/20 text-blue-400' :
                      post.category === 'Tips' ? 'bg-purple-500/20 text-purple-400' :
                      post.category === 'Feedback' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>{post.category}</span>
                  </div>

                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {REACTIONS.map(emoji => {
                      const reacters = (post.reactions ?? {})[emoji] ?? []
                      const count = reacters.length
                      const reacted = user ? reacters.includes(user.id) : false
                      return (
                        <button
                          key={emoji}
                          onClick={() => toggleReaction(post.id, emoji)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl transition-all ${
                            reacted
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-transparent'
                          }`}
                        >
                          {emoji}{count > 0 && <span className="font-bold">{count}</span>}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => toggleExpand(post.id)}
                      className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-all flex items-center gap-1"
                    >
                      💬 {isExpanded ? t('community.hide_replies') : `${t('community.reply_btn')}${postReplies.length > 0 ? ` (${postReplies.length})` : ''}`}
                    </button>
                  </div>

                  {/* Replies */}
                  {isExpanded && (
                    <div className="mt-4 border-t border-gray-800 pt-4 space-y-3">
                      {postReplies.map(r => (
                        <div key={r.id} className="flex gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-gray-700 text-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {(r.author_name ?? 'A')[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400 mb-0.5">{r.author_name ?? 'Anonymous'}</p>
                            <p className="text-xs text-gray-300 leading-relaxed">{r.content}</p>
                          </div>
                        </div>
                      ))}
                      {hasConnected && (
                        <div className="flex gap-2 mt-2">
                          <input
                            value={replyDraft}
                            onChange={e => setReplyDraft(e.target.value)}
                            placeholder={t('community.reply_placeholder')}
                            maxLength={280}
                            className="flex-1 bg-gray-800 text-xs text-white placeholder-gray-500 px-3 py-2 rounded-xl outline-none border border-gray-700 focus:border-amber-500/50"
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitReply(post.id) } }}
                          />
                          <button
                            onClick={() => submitReply(post.id)}
                            disabled={replyPosting || !replyDraft.trim()}
                            className="text-xs font-bold px-3 py-2 bg-amber-500 text-black rounded-xl hover:bg-amber-400 disabled:opacity-40 transition-all"
                          >{t('community.send_btn')}</button>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-600 mt-3">
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
