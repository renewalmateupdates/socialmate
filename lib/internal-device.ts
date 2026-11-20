/**
 * This browser belongs to one of us (Nov 20, 2026).
 *
 * Vercel's Speed Insights and Web Analytics counted our own visits as
 * customers': Joshua's daily use and Claude's checks (whose phone emulation
 * even lands in the mobile numbers). On Nov 20 the desktop row for /accounts,
 * a score of 6 with a 45.6 s paint, was a single check of ours.
 *
 * The server decides who is ours (isInternalEmail in lib/internal-accounts.ts,
 * which also knows the reviewer logins) and says so in /api/workspaces/accessible;
 * contexts/WorkspaceContext.tsx marks the browser, and components/VercelInsights.tsx
 * drops its events. The mark stays after signing out: it is the device that is
 * ours. No email list is shipped to the browser.
 */
export const INTERNAL_DEVICE_KEY = 'sm_internal_device'

export function markInternalDevice() {
  try { localStorage.setItem(INTERNAL_DEVICE_KEY, '1') } catch { /* private mode */ }
}

export function isInternalDevice(): boolean {
  try { return localStorage.getItem(INTERNAL_DEVICE_KEY) === '1' } catch { return false }
}
