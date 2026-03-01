'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type TeamMember = {
  id: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'pending'
  joined_at: string
}

const ROLES = [
  { id: 'owner', label: 'Owner', desc: 'Full access to everything', color: 'bg-black text-white' },
  { id: 'admin', label: 'Admin', desc: 'Manage team and content', color: 'bg-purple-100 text-purple-700' },
  { id: 'editor', label: 'Editor', desc: 'Create and schedule posts', color: 'bg-blue-100 text-blue-700' },
  { id: 'viewer', label: 'Viewer', desc: 'View-only access', color: 'bg-gray-100 text-gray-600' },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Team() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [inviting, setInviting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [removeId, setRemoveId] = useState<string | null>(null)
  const [editRoleId, setEditRoleId] = useState<string | null>(null)
  const router = useRouter()

  const AI_CREDITS_LEFT = 15
  const AI_CREDITS_TOTAL = 15
  const ACCOUNTS_USED = 0
  const ACCOUNTS_TOTAL = 16

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('team_members')
        .select('*')
        .eq('owner_id', user.id)
        .order('joined_at', { ascending: true })

      const ownerMember: TeamMember = {
        id: 'owner',
        email: user.email || '',
        role: 'owner',
        status: 'active',
        joined_at: user.created_at || new Date().toISOString(),
      }

      setMembers([ownerMember, ...(data || [])])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { showToast('Enter an email address', 'error'); return }
    if (!inviteEmail.includes('@')) { showToast('Enter a valid email', 'error'); return }
    if (members.some(m => m.email === inviteEmail.trim())) { showToast('This person is already on your team', 'error'); return }

    setInviting(true)
    const { error } = await supabase.from('team_members').insert({
      owner_id: user.id,
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'pending',
      joined_at: new Date().toISOString(),
    })

    if (error) { showToast('Failed to send invite', 'error'); setInviting(false); return }

    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('owner_id', user.id)
      .eq('email', inviteEmail.trim())
      .single()

    if (data) setMembers(prev => [...prev, data])
    setInviteEmail('')
    showToast(`Invite sent to ${inviteEmail.trim()}!`, 'success')
    setInviting(false)
  }

  const handleRemove = async (id: string) => {
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
    setRemoveId(null)
    showToast('Member removed', 'success')
  }

  const handleRoleChange = async (id: string, role: string) => {
    await supabase.from('team_members').update({ role }).eq('id', id)
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: role as any } : m))
    setEditRoleId(null)
    showToast('Role updated', 'success')
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const active = members.filter(m => m.status === 'active')
  const pending = members.filter(m => m.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
            { icon: "⏳", label: "Queue", href: "/queue" },
            { icon: "#️⃣", label: "Hashtags", href: "/hashtags" },
            { icon: "🖼️", label: "Media Library", href: "/media" },
            { icon: "📝", label: "Templates", href: "/templates" },
            { icon: "🔗", label: "Link in Bio", href: "/link-in-bio" },
            { icon: "📆", label: "Bulk Scheduler", href: "/bulk-scheduler" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Insights</div>
          {[
            { icon: "📊", label: "Analytics", href: "/analytics" },
            { icon: "🔍", label: "Best Times", href: "/best-times" },
          ].map(item => (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 mt-3">Settings</div>
          {[
            { icon: "🔗", label: "Accounts", href: "/accounts" },
            { icon: "👥", label: "Team", href: "/team", active: true },
            { icon: "⚙️", label: "Settings", href: "/settings" },
            { icon: "🎁", label: "Referrals", href: "/referral" },
            { icon: "🔔", label: "Notifications", href: "/notifications" },
            { icon: "🔎", label: "Search", href: "/search" },
          ].map(item => (
            <Link key={item.label} href={item.href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${'active' in item && item.active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">AI Credits</span>
              <span className="text-xs font-bold text-gray-700">{AI_CREDITS_LEFT}/{AI_CREDITS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(AI_CREDITS_LEFT / AI_CREDITS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{AI_CREDITS_LEFT} credits remaining</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-500">Accounts</span>
              <span className="text-xs font-bold text-gray-700">{ACCOUNTS_USED}/{ACCOUNTS_TOTAL}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-black h-1.5 rounded-full" style={{ width: `${(ACCOUNTS_USED / ACCOUNTS_TOTAL) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">{ACCOUNTS_TOTAL - ACCOUNTS_USED} slots remaining</p>
          </div>
          <Link href="/pricing" className="w-full block text-center bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            ⚡ Upgrade to Pro
          </Link>
          <div className="px-1">
            <div className="text-xs text-gray-400 truncate mb-1">{user?.email}</div>
            <button onClick={handleSignOut} className="w-full text-left px-0 py-1 text-xs text-gray-400 hover:text-black transition-all">Sign out</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-2xl mx-auto">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Team</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {loading ? 'Loading...' : `${active.length} active · ${pending.length} pending`}
              </p>
            </div>
          </div>

          {/* FREE BANNER */}
          <div className="bg-black text-white rounded-2xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">👥 Team collaboration — free</p>
              <p className="text-xs text-white/60 mt-0.5">Buffer charges $12/user/month. SocialMate includes team seats at no cost.</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-extrabold">$0</p>
              <p className="text-xs text-white/60">per user</p>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {loading ? (
              [1,2,3].map(i => <SkeletonBox key={i} className="h-20 rounded-2xl" />)
            ) : (
              [
                { label: 'Active Members', value: active.length, icon: '✅' },
                { label: 'Pending Invites', value: pending.length, icon: '📨' },
                { label: 'Total Seats', value: '∞', icon: '🪑' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 text-center">
                  <div className="text-xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              ))
            )}
          </div>

          {/* INVITE FORM */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-bold tracking-tight mb-4">Invite a Team Member</h2>
            <div className="flex gap-2 flex-wrap">
              <input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 min-w-0"
              />
              <select
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value as any)}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="px-4 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:opacity-80 transition-all disabled:opacity-50"
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </button>
            </div>

            {/* Role descriptions */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {ROLES.filter(r => r.id !== 'owner').map(role => (
                <div key={role.id} className={`rounded-xl p-3 border ${inviteRole === role.id ? 'border-black' : 'border-gray-100'} cursor-pointer transition-all`} onClick={() => setInviteRole(role.id as any)}>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${role.color}`}>{role.label}</span>
                  <p className="text-xs text-gray-400 mt-1.5">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MEMBERS LIST */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight">Members</h2>
              <span className="text-xs text-gray-400">{members.length} total</span>
            </div>

            {loading ? (
              <div className="p-6 space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3">
                    <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <SkeletonBox className="h-3 w-1/2" />
                      <SkeletonBox className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-sm font-bold mb-1">No team members yet</p>
                <p className="text-xs text-gray-400">Invite colleagues to collaborate on your social content</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {members.map(member => {
                  const role = ROLES.find(r => r.id === member.role)
                  const isOwner = member.role === 'owner'
                  const initial = member.email[0]?.toUpperCase() || '?'

                  return (
                    <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-all">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {initial}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{member.email}</p>
                          {member.status === 'pending' && (
                            <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full flex-shrink-0">Pending</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{isOwner ? 'Account owner' : `Joined ${timeAgo(member.joined_at)}`}</p>
                      </div>

                      {/* Role */}
                      <div className="flex-shrink-0">
                        {isOwner || editRoleId !== member.id ? (
                          <button
                            onClick={() => !isOwner && setEditRoleId(member.id)}
                            disabled={isOwner}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all ${role?.color} ${!isOwner ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
                          >
                            {role?.label}
                          </button>
                        ) : (
                          <select
                            value={member.role}
                            onChange={e => handleRoleChange(member.id, e.target.value)}
                            onBlur={() => setEditRoleId(null)}
                            autoFocus
                            className="text-xs border border-gray-200 rounded-xl px-2 py-1 focus:outline-none bg-white"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        )}
                      </div>

                      {/* Remove */}
                      {!isOwner && (
                        removeId === member.id ? (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleRemove(member.id)} className="text-xs font-semibold px-2 py-1 bg-red-500 text-white rounded-lg hover:opacity-80 transition-all">Remove</button>
                            <button onClick={() => setRemoveId(null)} className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">Cancel</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRemoveId(member.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all text-lg leading-none flex-shrink-0"
                          >
                            ×
                          </button>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ROLES LEGEND */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mt-4">
            <h2 className="text-sm font-bold tracking-tight mb-4">Role Permissions</h2>
            <div className="space-y-3">
              {ROLES.map(role => (
                <div key={role.id} className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-16 text-center flex-shrink-0 ${role.color}`}>{role.label}</span>
                  <p className="text-xs text-gray-500">{role.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}