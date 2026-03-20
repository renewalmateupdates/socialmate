'use client'
import { useEffect, useState, useMemo } from 'react'
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
  owner:  { label: 'Owner',  color: 'bg-black text-white',                              description: 'Full access to everything'     },
  admin:  { label: 'Admin',  color: 'bg-gray-800 text-white',                           description: 'Can manage team and settings'  },
  editor: { label: 'Editor', color: 'bg-blue-50 text-blue-700 border border-blue-200', description: 'Can create and schedule posts' },
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-600',                        description: 'Can view posts and analytics'  },
}

export default function Team() {
  const [user, setUser]             = useState<any>(null)
  const [members, setMembers]       = useState<TeamMember[]>([])
  const [loading, setLoading]       = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [inviting, setInviting]     = useState(false)
  const [toast, setToast]           = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<string>('')
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [removing, setRemoving]     = useState<string | null>(null)
  const router = useRouter()
  const { plan } = useWorkspace()

  const planConfig     = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
  const seatLimit      = planConfig.seats

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
  }, [router])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const ownerMember: TeamMember = useMemo(() => ({
    id:        'owner',
    email:     user?.email || '',
    role:      'owner',
    status:    'active',
    joined_at: user?.created_at || new Date().toISOString(),
  }), [user])

  const allMembers     = user ? [ownerMember, ...members] : members
  const seatsUsed      = allMembers.length
  const seatsRemaining = seatLimit - seatsUsed
  const atLimit        = seatsUsed >= seatLimit

  const handleInvite = async () => {
    if (!inviteEmail.trim())        { showToast('Enter an email address', 'error'); return }
    if (!inviteEmail.includes('@')) { showToast('Enter a valid email', 'error'); return }
    if (members.some(m => m.email === inviteEmail.trim())) {
      showToast('Already a team member', 'error'); return
    }
    if (atLimit) {
      showToast('Seat limit reached — upgrade to add more members', 'error'); return
    }

    setInviting(true)
    const emailCopy = inviteEmail.trim()

    // API handles insert + seat check + email — no client-side insert
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailCopy, role: inviteRole }),
    })

    const result = await res.json()

    if (!res.ok) {
      showToast(result.error || 'Failed to send invite', 'error')
      setInviting(false)
      return
    }

    // Add the new member to local state from the API response
    if (result.member) {
      setMembers(prev => [...prev, result.member])
    }

    setInviteEmail('')
    showToast(
      result.emailSent
        ? `Invite sent to ${emailCopy}`
        : `${emailCopy} added — email delivery may be delayed`,
      'success'
    )
    setInviting(false)
  }

  const handleRemove = async (id: string, email: string) => {
    setRemoving(id)
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
    setConfirmRemove(null)
    setRemoving(null)
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
    <div className="min-h-screen bg-theme flex">
      <Sidebar />
      <div className="md:ml-56 flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Team</h1>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Manage who has access to your workspace</p>
            </div>
            <div className={`self-start sm:self-auto flex items-center gap-2 text-xs font-semibold rounded-xl px-4 py-2.5 border ${
              atLimit ? 'bg-red-50 border-red-200 text-red-600' : 'bg-surface border-theme text-gray-500 dark:text-gray-400'
            }`}>
              {seatsUsed} / {seatLimit} seats used
            </div>
          </div>

          {/* SEAT LIMIT BANNER */}
          {atLimit && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">Seat limit reached</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {plan === 'free'   ? 'Free plan includes 2 seats. Upgrade to Pro for 5, or Agency for 15.' :
                   plan === 'pro'    ? 'Pro plan includes 5 seats. Upgrade to Agency for up to 15 seats.' :
                   'Agency plan supports up to 15 team seats.'}
                </p>
              </div>
              {plan !== 'agency' && (
                <Link href="/settings?tab=Plan"
                  className="bg-black text-white text-xs font-bold px-4 py-2 rounded-xl hover:opacity-80 transition-all self-start sm:self-auto flex-shrink-0">
                  Upgrade →
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* SEAT BAR */}
              <div className="bg-surface border border-theme rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Team seats</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{seatsUsed} / {seatLimit}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-2">
                  <div className={`h-2 rounded-full transition-all ${atLimit ? 'bg-red-400' : 'bg-black'}`}
                    style={{ width: `${Math.min(100, (seatsUsed / seatLimit) * 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {atLimit
                    ? 'No seats remaining — upgrade to add more members'
                    : `${seatsRemaining} seat${seatsRemaining !== 1 ? 's' : ''} remaining on ${planConfig.label} plan`}
                </p>
              </div>

              {/* MEMBER LIST */}
              <div className="bg-surface border border-theme rounded-2xl overflow-hidden">
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
                      const roleMeta     = ROLE_META[member.role]
                      const initials     = member.email.slice(0, 2).toUpperCase()
                      const isOwner      = member.role === 'owner'
                      const isEditing    = editingId === member.id
                      const isConfirming = confirmRemove === member.id
                      const isRemoving   = removing === member.id

                      return (
                        <div key={member.id}
                          className={`px-4 md:px-5 py-4 ${i !== allMembers.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 dark:hover:bg-gray-800 transition-all`}>

                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-bold flex-shrink-0 overflow-hidden">
                              {member.avatar_url
                                ? <img src={member.avatar_url} alt={member.email} className="w-full h-full object-cover" />
                                : initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold truncate">{member.email}</p>
                                {member.status === 'pending' && (
                                  <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full flex-shrink-0">
                                    Pending
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                {isOwner
                                  ? 'Workspace owner'
                                  : `Joined ${new Date(member.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                              </p>
                            </div>
                            {!isEditing && !isConfirming && (
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${roleMeta.color}`}>
                                {roleMeta.label}
                              </span>
                            )}
                            {!isOwner && !isEditing && !isConfirming && (
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button onClick={() => { setEditingId(member.id); setEditingRole(member.role) }}
                                  className="text-xs font-semibold px-2.5 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                                  Edit
                                </button>
                                <button onClick={() => setConfirmRemove(member.id)}
                                  className="text-xs font-semibold px-2.5 py-1.5 border border-red-200 text-red-400 rounded-xl hover:border-red-400 transition-all">
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditing && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0">Change role for {member.email}:</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <select value={editingRole} onChange={e => setEditingRole(e.target.value)}
                                  className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-gray-400 bg-white font-semibold">
                                  <option value="admin">Admin</option>
                                  <option value="editor">Editor</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                                <button onClick={() => handleRoleChange(member.id, editingRole)}
                                  className="text-xs font-bold px-3 py-1.5 bg-black text-white rounded-xl hover:opacity-80 transition-all">
                                  Save
                                </button>
                                <button onClick={() => setEditingId(null)}
                                  className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}

                          {isConfirming && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-2">
                              <p className="text-xs text-red-600 font-semibold flex-1">
                                Remove {member.email} from your team?
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handleRemove(member.id, member.email)} disabled={isRemoving}
                                  className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white rounded-xl hover:opacity-80 transition-all disabled:opacity-50 flex items-center gap-1.5">
                                  {isRemoving
                                    ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Removing...</>
                                    : 'Yes, remove'}
                                </button>
                                <button onClick={() => setConfirmRemove(null)}
                                  className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl hover:border-gray-400 transition-all">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="space-y-6">

              {/* INVITE FORM */}
              <div className="bg-surface border border-theme rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Invite Member</h2>
                {atLimit ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      You've used all {seatLimit} seats on your {planConfig.label} plan.
                    </p>
                    {plan !== 'agency' && (
                      <Link href="/settings?tab=Plan"
                        className="block w-full text-center bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-80 transition-all">
                        {plan === 'free' ? '⚡ Upgrade to Pro' : '🏢 Upgrade to Agency'}
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Email</label>
                      <input type="email" placeholder="colleague@company.com"
                        value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleInvite()}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Role</label>
                      <select value={inviteRole} onChange={e => setInviteRole(e.target.value as any)}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 bg-white">
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{ROLE_META[inviteRole]?.description}</p>
                    </div>
                    <button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}
                      className="w-full py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:opacity-80 transition-all disabled:opacity-40">
                      {inviting ? 'Sending...' : '📧 Send Invite'}
                    </button>
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                      {seatsRemaining} seat{seatsRemaining !== 1 ? 's' : ''} remaining
                    </p>
                  </div>
                )}
              </div>

              {/* ROLE PERMISSIONS */}
              <div className="bg-surface border border-theme rounded-2xl p-5">
                <h2 className="text-sm font-bold tracking-tight mb-4">Role Permissions</h2>
                <div className="space-y-3">
                  {Object.entries(ROLE_META).map(([role, meta]) => (
                    <div key={role} className="flex items-start gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${meta.color}`}>
                        {meta.label}
                      </span>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{meta.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* UPGRADE NUDGE */}
              {plan !== 'agency' && (
                <div className={`rounded-2xl p-5 border ${plan === 'free' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                  <p className={`text-xs font-bold mb-1 ${plan === 'free' ? 'text-blue-700' : 'text-purple-700'}`}>
                    Need more seats?
                  </p>
                  <p className={`text-xs mb-3 ${plan === 'free' ? 'text-blue-600' : 'text-purple-600'}`}>
                    {plan === 'free'
                      ? 'Pro includes 5 seats. Agency includes 15.'
                      : 'Agency plan includes up to 15 team seats.'}
                  </p>
                  <Link href="/settings?tab=Plan"
                    className={`block text-center text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-80 transition-all ${
                      plan === 'free' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                    {plan === 'free' ? 'Upgrade to Pro →' : 'Upgrade to Agency →'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-semibold shadow-lg ${
          toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  )
}