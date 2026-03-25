'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPlanRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/settings?tab=Plan')
  }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-400 text-sm">Loading plan settings…</div>
    </div>
  )
}
