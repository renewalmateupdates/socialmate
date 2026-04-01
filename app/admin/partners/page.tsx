import AdminPartnersClient from './AdminPartnersClient'

// Auth handled client-side — server-side cookie auth was blocking admin
export default function AdminPartnersPage() {
  return <AdminPartnersClient />
}
