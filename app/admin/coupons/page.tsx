import { Suspense } from 'react'
import AdminCouponsClient from './AdminCouponsClient'

export const metadata = { title: 'Admin — Coupons' }

export default function AdminCouponsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 text-sm">Loading…</div>}>
      <AdminCouponsClient />
    </Suspense>
  )
}
