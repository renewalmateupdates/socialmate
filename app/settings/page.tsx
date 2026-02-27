'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Settings() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)
      setEmail(user.email || '')
    }
    getUser()
  }, [])

  const handleUpdateEmail = async () => {
    setLoading(true)
    setEmailMsg('')
    const { error } = await supabase.auth.updateUser({ email })
    if (error) setEmailMsg(error.message)
    else setEmailMsg('Confirmation sent to your new email!')
    setLoading(false)
  }

  const handleUpdatePassword = async () => {
    setLoading(true)
    setPasswordMsg('')
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match!')
      setLoading(false)
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters!')
      setLoading(false)
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPasswordMsg(error.message)
    else {
      setPasswordMsg('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 py-2">Content</div>
          {[
            { icon: "🏠", label: "Dashboard", href: "/dashboard" },
            { icon: "📅", label: "Calendar", href: "/calendar" },
            { icon: "✏️", label: "Compose", href: "/compose" },
            { icon: "📂", label: "Drafts", href: "/drafts" },
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
            { icon: "👥", label: "Team", href: "/team" },
            { icon: "⚙️", label: "Settings", href: "/settings", active: true },
          ].map(item => (
            <Link key={item.label} href={(item as any).href} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${(item as any).active ? 'bg-gray-100 text-black' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="px-3 py-2 text-xs text-gray-400 truncate mb-1">{user.email}</div>
          <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-black transition-all">
            Sign out
          </button>
        </div>
      </div>

      <div className="ml-56 flex-1 p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your account settings.</p>
        </div>

        {/* ACCOUNT INFO */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
          <h2 className="font-extrabold text-base tracking-tight mb-1">Account</h2>
          <p className="text-sm text-gray-400 mb-5">Your account details.</p>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.email?.[0].toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold">{user.email}</div>
              <div className="text-xs text-gray-400">Member since {new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* UPDATE EMAIL */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
          <h2 className="font-extrabold text-base tracking-tight mb-1">Update Email</h2>
          <p className="text-sm text-gray-400 mb-5">Change the email address on your account.</p>
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
            {emailMsg && (
              <div className={`text-sm px-4 py-3 rounded-xl ${emailMsg.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {emailMsg}
              </div>
            )}
            <button onClick={handleUpdateEmail} disabled={loading}
              className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-50">
              Update Email
            </button>
          </div>
        </div>

        {/* UPDATE PASSWORD */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
          <h2 className="font-extrabold text-base tracking-tight mb-1">Update Password</h2>
          <p className="text-sm text-gray-400 mb-5">Choose a strong password for your account.</p>
          <div className="space-y-3">
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
            />
            {passwordMsg && (
              <div className={`text-sm px-4 py-3 rounded-xl ${passwordMsg.includes('successfully') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {passwordMsg}
              </div>
            )}
            <button onClick={handleUpdatePassword} disabled={loading}
              className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-80 transition-all disabled:opacity-50">
              Update Password
            </button>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="bg-white border border-red-100 rounded-2xl p-6">
          <h2 className="font-extrabold text-base tracking-tight mb-1 text-red-600">Danger Zone</h2>
          <p className="text-sm text-gray-400 mb-5">Irreversible actions for your account.</p>
          <button onClick={handleSignOut}
            className="border border-red-200 text-red-500 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-red-50 transition-all">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}