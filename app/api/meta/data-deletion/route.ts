export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { appUrl, parseSignedRequest } from '@/lib/meta'
import { deleteMetaConnections, readSignedRequest } from '@/lib/meta-deletion'

// Meta's "Data deletion request URL". Called when someone removes SocialMate
// from their Facebook or Instagram settings and asks for their data to be
// deleted. Deletion happens right here; Meta shows the person the returned
// status URL and confirmation code.
//
// Register in the Meta app dashboard as:
//   https://socialmate.studio/api/meta/data-deletion
// (Facebook Login settings, and Instagram > API setup with Instagram login)
export async function POST(request: Request) {
  const payload = parseSignedRequest(await readSignedRequest(request))
  if (!payload?.user_id) {
    return NextResponse.json({ error: 'invalid signed_request' }, { status: 400 })
  }

  const { confirmationCode } = await deleteMetaConnections(String(payload.user_id), 'data_deletion')

  return NextResponse.json({
    url:               `${appUrl()}/meta/data-deletion?code=${confirmationCode}`,
    confirmation_code: confirmationCode,
  })
}
