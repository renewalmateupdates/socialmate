export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { parseSignedRequest } from '@/lib/meta'
import { deleteMetaConnections, readSignedRequest } from '@/lib/meta-deletion'

// Meta's "Deauthorize callback URL". Called when someone removes SocialMate
// from their Facebook or Instagram settings. The tokens stop working at that
// moment anyway; deleting the rows means SocialMate never keeps a dead
// connection or shows it as connected.
//
// Register in the Meta app dashboard as:
//   https://socialmate.studio/api/meta/deauthorize
export async function POST(request: Request) {
  const payload = parseSignedRequest(await readSignedRequest(request))
  if (!payload?.user_id) {
    return NextResponse.json({ error: 'invalid signed_request' }, { status: 400 })
  }

  await deleteMetaConnections(String(payload.user_id), 'deauthorize')
  return NextResponse.json({ success: true })
}
