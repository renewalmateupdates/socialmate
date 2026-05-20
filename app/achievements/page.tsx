'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

const ACHIEVEMENTS = [
  { key: 'first_post',   icon: '🚀', label: 'First Post',       desc: 'Publish your first post',              reward: 0,   category: 'Posts'    },
  { key: 'posts_10',     icon: '📝', label: 'Getting Started',  desc: '10 posts published',                   reward: 25,  category: 'Posts'    },
  { key: 'posts_50',     icon: '✍️',  label: 'Content Creator',  desc: '50 posts published',                   reward: 50,  category: 'Posts'    },
  { key: 'posts_100',    icon: '💯', label: 'Century Poster',   desc: '100 posts published',                  reward: 100, category: 'Posts'    },
  { key: 'posts_500',    icon: '🔥', label: 'Posting Machine',  desc: '500 posts published',                  reward: 200, category: 'Posts'    },
  { key: 'streak_7',     icon: '⚡', label: 'Week Warrior',     desc: '7-day posting streak',                 reward: 25,  category: 'Streaks'  },
  { key: 'streak_30',    icon: '🌟', label: '30-Day Challenge', desc: '30-day posting streak',                reward: 50,  category: 'Streaks'  },
  { key: 'streak_100',   icon: '👑', label: 'Century Streak',   desc: '100-day posting streak',               reward: 150, category: 'Streaks'  },
  { key: 'month_3',      icon: '🎯', label: 'Committed',        desc: '3 months on SocialMate',               reward: 100, category: 'Tenure'   },
  { key: 'month_6',      icon: '💎', label: 'Dedicated',        desc: '6 months on SocialMate',               reward: 100, category: 'Tenure'   },
  { key: 'month_12',     icon: '🏆', label: 'Veteran Creator',  desc: '1 year on SocialMate',                 reward: 100, category: 'Tenure'   },
  { key: 'platforms_3',     icon: '🌐', label: 'Multi-Platform',      desc: 'Connect 3+ platforms',                      reward: 25,  category: 'Account'  },
  { key: 'bio_builder',     icon: '🔗', label: 'Bio Builder',         desc: 'Create a SIGIL (Link in Bio) page',         reward: 10,  category: 'Account'  },
  { key: '30_day_challenge', icon: '🏅', label: '30-Day Challenge',   desc: 'Post every day for 30 consecutive days',    reward: 50,  category: 'Streaks'  },
]

type Earned = { achievement_key: string; earned_at: string; credits_awarded: number }

export default function AchievementsPage() {
  const [earned, setEarned]           = useState<Earned[]>([])
  const [postCount, setPostCount]     = useState(0)
  const [streakCount, setStreakCount] = useState(0)
  const [platformCount, setPlatformCount] = useState(0)
  const [joinDate, setJoinDate]       = useState<Date | null>(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: achData }, { count: posts }, { data: accounts }, { data: profile }] = await Promise.all([
        supabase.from('user_achievements').select('*').eq('user_id', user.id),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'published'),
        supabase.from('connected_accounts').select('platform').eq('user_id', user.id),
        supabase.from('profiles').select('created_at').eq('id', user.id).single(),
      ])

      setEarned(achData || [])
      setPostCount(posts || 0)
      setPlatformCount(new Set((accounts || []).map((a: any) => a.platform)).size)
      if (profile?.created_at) setJoinDate(new Date(profile.created_at))

      // Calculate current streak
      const { data: scheduledPosts } = await supabase
        .from('posts')
        .select('scheduled_at')
        .eq('user_id', user.id)
        .in('status', ['published', 'scheduled'])
        .order('scheduled_at', { ascending: false })

      if (scheduledPosts) {
        const days = new Set(scheduledPosts.map((p: any) => new Date(p.scheduled_at).toDateString()))
        const sorted = Array.from(days).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        let streak = 0
        let cursor = new Date()
        cursor.setHours(0, 0, 0, 0)
        for (const day of sorted) {
          const d = new Date(day)
          d.setHours(0, 0, 0, 0)
          const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000)
          if (diff <= 1) { streak++; cursor = d } else break
        }
        setStreakCount(streak)
      }

      setLoading(false)
    }
    load()
  }, [])

  const earnedKeys = new Set(earned.map(e => e.achievement_key))
  const totalCreditsEarned = earned.reduce((sum, e) => sum + (e.credits_awarded || 0), 0)
  const earnedCount = earned.length

  const getProgress = (key: string): { current: number; max: number } => {
    if (key === 'first_post')  return { current: Math.min(postCount, 1),   max: 1   }
    if (key === 'posts_10')    return { current: Math.min(postCount, 10),  max: 10  }
    if (key === 'posts_50')    return { current: Math.min(postCount, 50),  max: 50  }
    if (key === 'posts_100')   return { current: Math.min(postCount, 100), max: 100 }
    if (key === 'posts_500')   return { current: Math.min(postCount, 500), max: 500 }
    if (key === 'streak_7')    return { current: Math.min(streakCount, 7),   max: 7   }
    if (key === 'streak_30')   return { current: Math.min(streakCount, 30),  max: 30  }
    if (key === 'streak_100')  return { current: Math.min(streakCount, 100), max: 100 }
    if (key === 'platforms_3') return { current: Math.min(platformCount, 3), max: 3   }
    if (key === 'bio_builder') return { current: 0, max: 1 }
    if (joinDate) {
      const monthsOn = (Date.now() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      if (key === 'month_3')  return { current: Math.min(Math.floor(monthsOn), 3),  max: 3  }
      if (key === 'month_6')  return { current: Math.min(Math.floor(monthsOn), 6),  max: 6  }
      if (key === 'month_12') return { current: Math.min(Math.floor(monthsOn), 12), max: 12 }
    }
    return { current: 0, max: 1 }
  }

  const categories = ['Posts', 'Streaks', 'Tenure', 'Account']

  if (loading) return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-theme flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold tracking-tight mb-1">🏆 Achievements</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500">Earn badges and bonus credits by hitting milestones.</p>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Earned',         value: `${earnedCount} / ${ACHIEVEMENTS.length}` },
              { label: 'Credits earned', value: `${totalCreditsEarned}` },
              { label: 'Current streak', value: `${streakCount} days` },
            ].map(s => (
              <div key={s.label} className="bg-surface border border-theme rounded-2xl p-4 text-center">
                <p className="text-xl font-extrabold">{s.value}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Achievement categories */}
          {categories.map(cat => {
            const items = ACHIEVEMENTS.filter(a => a.category === cat)
            return (
              <div key={cat} className="mb-8">
                <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">{cat}</h2>
                <div className="space-y-3">
                  {items.map(ach => {
                    const isEarned = earnedKeys.has(ach.key)
                    const earnedEntry = earned.find(e => e.achievement_key === ach.key)
                    const prog = getProgress(ach.key)
                    const pct = prog.max > 0 ? Math.round((prog.current / prog.max) * 100) : 0

                    return (
                      <div key={ach.key} className={`bg-surface border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                        isEarned ? 'border-amber-300/50 dark:border-amber-600/40' : 'border-theme'
                      }`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                          isEarned ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-gray-100 dark:bg-gray-800 opacity-40'
                        }`}>
                          {ach.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-bold ${isEarned ? '' : 'text-gray-500 dark:text-gray-400'}`}>{ach.label}</p>
                            {isEarned && <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold">✓ Earned</span>}
                            {ach.reward > 0 && <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">+{ach.reward} cr</span>}
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{ach.desc}</p>
                          {!isEarned && prog.max > 1 && (
                            <div className="mt-2">
                              <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                                <span>{prog.current} / {prog.max}</span>
                                <span>{pct}%</span>
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                                <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )}
                          {isEarned && earnedEntry && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                              Earned {new Date(earnedEntry.earned_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          <div className="text-center pt-4 pb-8">
            <p className="text-xs text-gray-400 dark:text-gray-500">Achievements are checked daily. Keep posting to unlock more! 🔥</p>
            <Link href="/streak" className="text-xs text-amber-500 font-semibold mt-1 block hover:underline">View streak heatmap →</Link>
          </div>

        </div>
      </main>
    </div>
  )
}
