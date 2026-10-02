export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// This route starts the "Add SocialMate Bot to your server" OAuth flow.
// Scope: 'bot identify' — this adds the bot to a guild AND identifies the user.
// The callback reads guild_id from the response and stores it in connected_accounts.metadata.
//
// Bot permissions integer: 268536832
//   VIEW_CHANNEL         (0x400)      = 1024
//   SEND_MESSAGES        (0x800)      = 2048
//   ATTACH_FILES         (0x8000)     = 32768
//   READ_MESSAGE_HISTORY (0x10000)    = 65536
//   MANAGE_ROLES         (0x10000000) = 268435456  (Discord hub auto-role feature)
//   Total: 268536832
//
// This used to be 268503040, which the comment claimed included VIEW_CHANNEL
// but did not. Without VIEW_CHANNEL the bot can only post where @everyone can
// already see the channel, so any restricted channel returned 403. ATTACH_FILES
// was missing too, so posts with images failed. Servers invited before this
// change keep the old permissions on their bot role until the owner re-invites
// it or grants the role access to the channel.

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex')

  const cookieStore = await cookies()
  cookieStore.set('discord_bot_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10,
    path: '/',
  })

  const params = new URLSearchParams({
    client_id:    process.env.DISCORD_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/accounts/discord/bot-callback`,
    response_type: 'code',
    scope:        'bot identify',
    permissions:  '268536832',
    state,
  })

  return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params}`)
}
