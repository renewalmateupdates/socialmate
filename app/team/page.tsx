'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useWorkspace, PLAN_CONFIG } from '@/contexts/WorkspaceContext'

function SkeletonBox({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />
}

type TeamMember = {
  id: string
  email: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'pending'
  joined_at: string
  avatar_url?: string
}

const ROLE_META: Record<string, { label: string; color: string; description: string }> = {
  owner:  { label: 'Owner',  color: 'bg-black text-white',                              description: 'Full access to everything' },
  admin:  { label: 'Admin',  color: 'bg-gray-800 text-white',                           description: 'Can manage team and settings' },
  editor: { label: 'Editor', color: 'bg-blue-50 text-blue-700 border border-blue-200', description: 'Can create and schedule posts' },
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-600',                        description: 'Can view posts and analytics' },
}

export default function Team() {
  const [user, setUser] = useState<any>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [inviting, setInviting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<string>('')
  const router = useRouter()
  const { plan } = useWorkspace()

  const planConfig = PLAN_CONFIG[plan]
  const seatLimit = planConfig.seats
  const isUnlimited = plan === 'agency'

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
      setMembers(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const ownerMember: TeamMember = {
    id: 'owner',
    email: user?.email || '',
    role: 'owner',
    status: 'active',
    joined_at: user?.created_at || new Date().toISOString(),
  }

  const allMembers = user ? [ownerMember, ...members] : members

  // +1 for owner
  const seatsUsed = allMembers.length
  const seatsRemaining = isUnlimited ? Infinity : seatLimit - seatsUsed
  const atLimit = !isUnlimited && seatsUsed >= seatLimit

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { showToast('Enter an email address', 'error'); return }
    if (!inviteEmail.includes('@')) { showToast('Enter a valid email', 'error'); return }
    if (members.some(m => m.email === inviteEmail.trim())) { showToast('Already a team member', 'error'); return }
    if (atLimit) { showToast('Seat limit reached — upgrade to add more members', 'error'); return }
    setInviting(true)
    const { data, error } = await supabase
      .from('team_members')
      .insert({ owner_id: user.id, email: inviteEmail.trim(), role: inviteRole, status: 'pending', joined_at: new Date().toISOString() })
      .select().single()
    if (error) { showToast('Failed to send invite', 'error'); setInviting(false); return }
    setMembers(prev => [...prev, data])
    setInviteEmail('')
    showToast(`Invite sent to ${inviteEmail.trim()}`, 'success')
    setInviting(false)
  }

  const handleRemove = async (id: string, email: string) => {
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
    showToast(`${email} removed from team`, 'success')
  }

  const handleRoleChange = async (id: string, newRole: string) => {
    const { error } = await supabase.from('team_members').update({ role: newRole }).eq('id', id)
    if (error) { showToast('Failed to update role', 'error'); return }
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole as TeamMember['role'] } : m))
    setEditingId(null)
    showToast('Role updated', 'success')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-56 flex-1 p-8">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Team</h1>
              <p className="text-sm text-gray-400 mt-0.5">Manage who has access to your SocialMate workspace</p>
            </div>
            <div className="flex items-center gap-3">
              {/* SEAT USAGE BADGE */}
              <div className={`flex items-center gap-2 text-xs font-semibold rounded-xl px-4 py-2.5 border ${atLimit ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-100 text-gray-500'}`}>
                {isUnlimited
                  ? `${seatsUsed} members · Unlimited seats`
                  : `${seatsUsed} / ${seatLimit} seats used`
                }
              </div>
            </div>
          </div>

          {/* AT LIMIT BANNER */}
          {atLimit && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-amber-800">Seat limit reached</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {plan === 'free'
                    ? 'Free plan includes 2 team seats. Upgrade to Pro for 5 seats, or Agency for unlimited.'
                    : 'Pro plan includes 5 team seats. Upgrade to Agency for unlimited seats.'
                  }
                </p>
              </div>
              <Link href="/pricing"
                className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all flex-shrink-0 ml-4">
                Upgrade →
              </Link>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">

              {/* SEAT PROGRESS BAR */}
              {!isUnlimited && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Team seats</span>
                    <span className="text-xs font-bold text-gray-700">{seatsUsed} / {seatLimit}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${atLimit ? 'bg-red-400' : 'bg-black'}`}
                      style={{ width: `${Math.min(100, (seatsUsed / seatLimit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {atLimit
                      ? 'No seats remaining — upgrade to add more members'
                      : `${seatsRemaining} seat${seatsRemaining !== 1 ? 's' : ''} remaining on ${planConfig.label} plan`
                    }
                  </p>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-bold tracking-tight">Team Members</h2>
                </div>

                {loading ? (
                  <div className="p-5 space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <SkeletonBox className="w-10 h-10 rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <SkeletonBox className="h-3 w-48" />
                          <SkeletonBox className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {allMembers.map((member, i) => {
                      const roleMeta = ROLE_META[member.role]
                      const initials = member.email.slice(0, 2).toUpperCase()
                      const isOwner = member.role === 'owner'
                      return (
                        <div key={member.id} className={`flex items-center gap-4 px-5 py-4 ${i !== allMembers.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-all group`}>
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {member.avatar_url
                              ? <img src={member.avatar_url} alt={member.email} className="w-full h-full object-cover rounded-xl" />
                              : initials
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold truncate">{member.email}</p>
                              {member.status === 'pending' && (
                                <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full">Pending</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {isOwner ? 'Workspace owner' : `Joined ${new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {editingId === member.id ? (
                              <div className="flex items-center gap-2">
                                <select value={editingRole} onChange={e => setEditingRole(e.target.value)}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-gray-400 bg-white">
                                  <option value="admin">Admin</option>
                                  <option value="editor">Editor</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                                <button onClick={() => handleRoleChange(member.id, editingRole)}
                                  className="text-xs font-semibold px-2 py-1 bg-black text-white rounded-lg hover:opacity-80 transition-all">Save</button>
                                <button onClick={() => setEditingId(null)}
                                  className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:border-gray-400 transition-all">Cancel</button>
                              </div>
                            ) : (
                              <>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleMeta.color}`}>{roleMeta.label}</span>
                                {!isOwner && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setEditingId(member.id); setEditingRole(member.role) }}
                                      className="text-xs font-semibold px-2.5 py-1 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                                      Change Role
                                    </button>
                                    <button onClick={() => handleRemove(member.id, member.email)}
                                      className="text-xs font-semibold px-2.5 py-1 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                                      Remove
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Invite Member</h2>
                {atLimit ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500 mb-3">You've used all {seatLimit} seats on your {planConfig.label} plan.</p>
                    <Link href="/pricing"
                      className="block w-full text-center bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                      {plan === 'free' ? '⚡ Upgrade to Pro' : '🏢 Upgrade to Agency'}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Email</label>
                      <input type="email" placeholder="colleague@company.com"
                        value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleInvite()}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Role</label>
                      <select value={inviteRole} onChange={e => setInviteRole(e.target.value as any)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white">
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <p className="text-xs text-gray-400 mt-1">{ROLE_META[inviteRole]?.description}</p>
                    </div>
                    <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
                      className="w-full py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                      {inviting ? 'Sending...' : '📧 Send Invite'}
                    </button>
                    {!isUnlimited && (
                      <p className="text-xs text-gray-400 text-center">
                        {seatsRemaining} seat{seatsRemaining !== 1 ? 's' : ''} remaining
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Role Permissions</h2>
                <div className="space-y-3">
                  {Object.entries(ROLE_META).map(([role, meta]) => (
                    <div key={role} className="flex items-start gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${meta.color}`}>{meta.label}</span>
                      <p className="text-xs text-gray-400">{meta.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {plan !== 'agency' && (
                <div className={`rounded-2xl p-5 border ${plan === 'free' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                  <p className={`text-xs font-bold mb-1 ${plan === 'free' ? 'text-blue-700' : 'text-purple-700'}`}>
                    {plan === 'free' ? '⚡ Need more seats?' : '🏢 Need unlimited seats?'}
                  </p>
                  <p className={`text-xs mb-3 ${plan === 'free' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {plan === 'free' ? 'Pro includes 5 seats. Agency includes unlimited.' : 'Agency plan includes unlimited team seats.'}
                  </p>
                  <Link href="/pricing"
                    className={`block text-center text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-80 transition-all ${plan === 'free' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                    {plan === 'free' ? 'Upgrade to Pro →' : 'Upgrade to Agency →'}
                  </Link>
                </div>
              )}
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