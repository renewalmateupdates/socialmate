'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'

interface GuildData {
  connected: boolean
  guild: {
    name: string
    icon: string | null
    member_count: number
    online_count: number
  } | null
  channels: { id: string; name: string; position: number }[]
  roles: { id: string; name: string; color: number; position: number }[]
  guild_id: string | null
}

interface WelcomeConfig {
  id: string
  guild_id: string
  channel_id: string
  message: string
  enabled: boolean
}

interface RoleConfig {
  id: string
  guild_id: string
  role_id: string
  role_name: string | null
  enabled: boolean
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all ${
        type === 'success'
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      {message}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 animate-pulse" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
      <div className="h-4 w-32 rounded mb-3" style={{ background: 'var(--border-mid)' }} />
      <div className="h-3 w-full rounded mb-2" style={{ background: 'var(--border-mid)' }} />
      <div className="h-3 w-2/3 rounded" style={{ background: 'var(--border-mid)' }} />
    </div>
  )
}

function DiscordHubInner() {
  const searchParams = useSearchParams()
  const [loading, setLoading]               = useState(true)
  const [guildData, setGuildData]           = useState<GuildData | null>(null)
  const [error, setError]                   = useState<string | null>(null)

  // Welcome config state
  const [welcomeOpen, setWelcomeOpen]       = useState(false)
  const [welcomeConfig, setWelcomeConfig]   = useState<WelcomeConfig | null>(null)
  const [welcomeEnabled, setWelcomeEnabled] = useState(false)
  const [welcomeChannel, setWelcomeChannel] = useState('')
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to the server, {{username}}! 🎉')
  const [welcomeSaving, setWelcomeSaving]   = useState(false)

  // Role config state
  const [roleOpen, setRoleOpen]             = useState(false)
  const [roleConfig, setRoleConfig]         = useState<RoleConfig | null>(null)
  const [roleEnabled, setRoleEnabled]       = useState(false)
  const [selectedRole, setSelectedRole]     = useState('')
  const [roleSaving, setRoleSaving]         = useState(false)

  // Toast
  const [toast, setToast]                   = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    const success = searchParams.get('success')
    const err     = searchParams.get('error')
    if (success === 'bot_connected') showToast('Discord bot connected! Your server is ready.', 'success')
    if (err === 'bot_denied')        showToast('Bot connection cancelled.', 'error')
    if (err === 'token_failed')      showToast('Connection failed — please try again.', 'error')
    if (err === 'db_error')          showToast('Could not save connection — please try again.', 'error')
  }, [searchParams])

  useEffect(() => {
    async function load() {
      try {
        const [guildRes, welcomeRes, roleRes] = await Promise.all([
          fetch('/api/discord/guild'),
          fetch('/api/discord/welcome'),
          fetch('/api/discord/roles'),
        ])

        const guildJson   = await guildRes.json()
        const welcomeJson = await welcomeRes.json()
        const roleJson    = await roleRes.json()

        setGuildData(guildJson)

        if (welcomeJson.config) {
          const cfg = welcomeJson.config as WelcomeConfig
          setWelcomeConfig(cfg)
          setWelcomeEnabled(cfg.enabled)
          setWelcomeChannel(cfg.channel_id)
          setWelcomeMessage(cfg.message)
        }

        if (roleJson.config) {
          const cfg = roleJson.config as RoleConfig
          setRoleConfig(cfg)
          setRoleEnabled(cfg.enabled)
          setSelectedRole(cfg.role_id)
        }
      } catch (err: any) {
        setError('Failed to load Discord data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function saveWelcome() {
    if (!guildData?.guild_id) return
    if (!welcomeChannel) {
      showToast('Please select a channel', 'error')
      return
    }
    setWelcomeSaving(true)
    try {
      const res = await fetch('/api/discord/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guild_id:   guildData.guild_id,
          channel_id: welcomeChannel,
          message:    welcomeMessage,
          enabled:    welcomeEnabled,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      setWelcomeConfig(json.config)
      showToast('Welcome message saved!')
    } catch (err: any) {
      showToast(err.message ?? 'Failed to save', 'error')
    } finally {
      setWelcomeSaving(false)
    }
  }

  async function saveRole() {
    if (!guildData?.guild_id) return
    if (!selectedRole) {
      showToast('Please select a role', 'error')
      return
    }
    setRoleSaving(true)
    try {
      const role = guildData.roles.find(r => r.id === selectedRole)
      const res = await fetch('/api/discord/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guild_id:  guildData.guild_id,
          role_id:   selectedRole,
          role_name: role?.name ?? null,
          enabled:   roleEnabled,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Save failed')
      setRoleConfig(json.config)
      showToast('Role automation saved!')
    } catch (err: any) {
      showToast(err.message ?? 'Failed to save', 'error')
    } finally {
      setRoleSaving(false)
    }
  }

  const isNotConnected = !loading && (!guildData?.connected || !guildData?.guild_id)

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <Sidebar />

      <main className="flex-1 md:ml-56 p-4 md:p-8 max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-70"
            style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)', color: 'var(--text-muted)' }}
          >
            ← Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <div>
              <h1 className="text-xl font-bold leading-tight">Discord Hub</h1>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                Server management, welcome messages, and role automation
              </p>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
            <p className="text-sm font-semibold text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs font-bold px-4 py-2 rounded-lg transition-all hover:opacity-80"
              style={{ background: 'var(--border-mid)', color: 'var(--fg)' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Not connected callout */}
        {isNotConnected && !error && (
          <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
            <div className="flex items-start gap-4">
              <span className="text-3xl flex-shrink-0">🤖</span>
              <div>
                <h2 className="font-bold text-base mb-1">Connect Discord Bot Permissions</h2>
                <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                  To use the Discord Hub, you need to invite the SocialMate bot to your server and connect it with the <strong>bot</strong> scope.
                </p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-faint)' }}>
                  Your current Discord connection uses webhooks only. Reconnect with bot permissions to unlock welcome messages, role automation, and server stats.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/api/accounts/discord/bot-connect"
                    className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:opacity-80"
                    style={{ background: '#5865F2', color: '#fff' }}
                  >
                    🤖 Add SocialMate Bot to Server
                  </a>
                  <p className="text-xs self-center" style={{ color: 'var(--text-faint)' }}>
                    You can still schedule posts to Discord channels using the Compose page.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connected — guild stats + features */}
        {!loading && !error && guildData?.connected && guildData.guild && (
          <div className="space-y-5">

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Server Name */}
              <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
                {guildData.guild.icon ? (
                  <img src={guildData.guild.icon} alt="Server icon" className="w-10 h-10 rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-xl font-bold"
                    style={{ background: '#5865F2', color: '#fff' }}>
                    {guildData.guild.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-faint)' }}>Server</p>
                  <p className="font-bold text-sm truncate">{guildData.guild.name}</p>
                </div>
              </div>

              {/* Members */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>Members</p>
                <p className="text-2xl font-bold">{guildData.guild.member_count.toLocaleString()}</p>
              </div>

              {/* Online */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>Online Now</p>
                <p className="text-2xl font-bold text-green-500">{guildData.guild.online_count.toLocaleString()}</p>
              </div>
            </div>

            {/* Welcome Messages card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
              <button
                onClick={() => setWelcomeOpen(p => !p)}
                className="w-full flex items-center justify-between px-5 py-4 transition-all hover:opacity-80 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">👋</span>
                  <div>
                    <p className="font-bold text-sm">Welcome Messages</p>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {welcomeConfig
                        ? welcomeConfig.enabled
                          ? 'Active — welcome messages will be sent within 5 minutes of a member joining'
                          : 'Disabled'
                        : 'Not configured'}
                    </p>
                  </div>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{welcomeOpen ? '▾' : '▸'}</span>
              </button>

              {welcomeOpen && (
                <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid var(--border-mid)' }}>
                  <div className="pt-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">Enable welcome messages</p>
                    <button
                      onClick={() => setWelcomeEnabled(p => !p)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        welcomeEnabled ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          welcomeEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Welcome channel
                    </label>
                    <select
                      value={welcomeChannel}
                      onChange={e => setWelcomeChannel(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all focus:outline-none"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', color: 'var(--fg)' }}
                    >
                      <option value="">Select a channel...</option>
                      {guildData.channels.map(ch => (
                        <option key={ch.id} value={ch.id}># {ch.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Message <span style={{ color: 'var(--text-faint)' }}>— use {'{{username}}'} for the member's name</span>
                    </label>
                    <textarea
                      value={welcomeMessage}
                      onChange={e => setWelcomeMessage(e.target.value)}
                      rows={3}
                      maxLength={2000}
                      className="w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all focus:outline-none resize-none"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', color: 'var(--fg)' }}
                      placeholder="Welcome to the server, {{username}}! 🎉"
                    />
                    <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-faint)' }}>
                      {welcomeMessage.length}/2000
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={saveWelcome}
                      disabled={welcomeSaving}
                      className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-80 disabled:opacity-50"
                      style={{ background: '#5865F2', color: '#fff' }}
                    >
                      {welcomeSaving ? 'Saving...' : 'Save Welcome Config'}
                    </button>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      Requires DISCORD_BOT_TOKEN in env to function.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Role Automation card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
              <button
                onClick={() => setRoleOpen(p => !p)}
                className="w-full flex items-center justify-between px-5 py-4 transition-all hover:opacity-80 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎭</span>
                  <div>
                    <p className="font-bold text-sm">Role Automation</p>
                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                      {roleConfig
                        ? roleConfig.enabled
                          ? `Active — auto-assigning "${roleConfig.role_name ?? roleConfig.role_id}" on join`
                          : 'Disabled'
                        : 'Not configured'}
                    </p>
                  </div>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>{roleOpen ? '▾' : '▸'}</span>
              </button>

              {roleOpen && (
                <div className="px-5 pb-5 space-y-4" style={{ borderTop: '1px solid var(--border-mid)' }}>
                  <div className="pt-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">Enable role automation</p>
                    <button
                      onClick={() => setRoleEnabled(p => !p)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        roleEnabled ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          roleEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Role to assign on join
                    </label>
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm font-medium transition-all focus:outline-none"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', color: 'var(--fg)' }}
                    >
                      <option value="">Select a role...</option>
                      {guildData.roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--bg)', border: '1px solid var(--border-mid)', color: 'var(--text-faint)' }}>
                    Auto-assigns this role when someone joins your server. Takes effect within 5 minutes of a member joining. Requires the bot to have Manage Roles permission.
                  </div>

                  <button
                    onClick={saveRole}
                    disabled={roleSaving}
                    className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:opacity-80 disabled:opacity-50"
                    style={{ background: '#5865F2', color: '#fff' }}
                  >
                    {roleSaving ? 'Saving...' : 'Save Role Config'}
                  </button>
                </div>
              )}
            </div>

            {/* Announcements CTA card */}
            <div className="rounded-2xl p-5 flex items-start gap-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-mid)' }}>
              <span className="text-2xl flex-shrink-0">📣</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm mb-1">Announcements</p>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  Schedule announcements to any Discord channel — set the time, write your message, and SocialMate handles the rest.
                </p>
                <Link
                  href="/compose"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-all hover:opacity-80"
                  style={{ background: '#5865F2', color: '#fff' }}
                >
                  ✏️ Compose a Discord post
                </Link>
              </div>
            </div>

          </div>
        )}
      </main>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default function DiscordHubPage() {
  return (
    <Suspense>
      <DiscordHubInner />
    </Suspense>
  )
}
