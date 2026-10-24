import { redirect } from 'next/navigation'

// The legacy weekly flow (one doc for the whole workspace, always drafts, no
// memory or schedule) is retired. SOMA Projects do the same job through the
// shared generation path (lib/soma-generate.ts). Old links land on the
// dashboard.
export default function SomaWeeklyRetired() {
  redirect('/soma/dashboard')
}
