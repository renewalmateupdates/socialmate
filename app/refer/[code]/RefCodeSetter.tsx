'use client'
import { useEffect } from 'react'

/**
 * Sets a `ref_code` cookie on mount so the referral code persists
 * even if the user navigates away before clicking the signup CTA.
 * Expires in 7 days (604800 seconds).
 */
export default function RefCodeSetter({ code }: { code: string }) {
  useEffect(() => {
    document.cookie = `ref_code=${encodeURIComponent(code)}; path=/; max-age=604800; SameSite=Lax`
  }, [code])

  return null
}
