import AdminAffiliatesClient from './AdminAffiliatesClient'

// Auth is handled client-side in AdminAffiliatesClient via /api/affiliate/stats?admin=true
// Server-side cookie auth was blocking the admin because the session lives in the browser
export default function AdminAffiliatesPage() {
  return <AdminAffiliatesClient />
}
