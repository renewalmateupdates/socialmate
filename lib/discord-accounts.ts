// Two kinds of Discord connection exist in connected_accounts.
//
// Until Sept 3, 2026 "Connect Discord" ran a login-only OAuth flow (scope
// `identify`). It stored who the person is and nothing else: no server, so no
// way to post. Seven outside accounts connected that way and none ever posted.
// The bot invite flow that replaced it stores `metadata.guild_id`.
//
// A login-only row is not a usable account, so it should not use up a plan slot
// (a free plan allows one per platform, and that one slot is what stopped these
// people from connecting properly), and it is upgraded in place, not duplicated,
// the first time the person adds the bot.
export function isLegacyDiscordAccount(a: { platform: string; metadata?: unknown }): boolean {
  if (a.platform !== 'discord') return false
  const m = a.metadata as { guild_id?: unknown } | null | undefined
  return !(m && typeof m === 'object' && m.guild_id)
}
