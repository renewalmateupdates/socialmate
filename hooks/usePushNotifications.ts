'use client'
import { useState, useEffect, useCallback } from 'react'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window)
    if ('Notification' in window) setPermission(Notification.permission)
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator)) return
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      setIsSubscribed(!!sub)
    } catch {}
  }

  const subscribe = useCallback(async () => {
    if (!isSupported) return false
    setIsLoading(true)
    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Request permission
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') { setIsLoading(false); return false }

      // Subscribe to push
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) { console.warn('VAPID public key not set'); setIsLoading(false); return false }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      // Save subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      })

      setIsSubscribed(true)
      setIsLoading(false)
      return true
    } catch (err) {
      console.error('Push subscription failed:', err)
      setIsLoading(false)
      return false
    }
  }, [isSupported])

  const unsubscribe = useCallback(async () => {
    setIsLoading(true)
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg) return
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await fetch('/api/notifications/unsubscribe', { method: 'POST' })
      }
      setIsSubscribed(false)
    } catch (err) {
      console.error('Unsubscribe failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isSupported, permission, isSubscribed, isLoading, subscribe, unsubscribe }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
