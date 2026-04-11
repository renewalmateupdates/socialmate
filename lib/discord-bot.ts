/**
 * Discord Bot REST API helper
 *
 * Requires DISCORD_BOT_TOKEN in env.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SQL MIGRATION — run this in your Supabase SQL editor:
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ALTER TABLE connected_accounts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
 *
 * CREATE TABLE IF NOT EXISTS discord_welcome_configs (
 *   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 *   guild_id   TEXT NOT NULL,
 *   channel_id TEXT NOT NULL,
 *   message    TEXT NOT NULL DEFAULT 'Welcome to the server, {{username}}! 🎉',
 *   enabled    BOOLEAN DEFAULT true,
 *   last_member_id TEXT,
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   updated_at TIMESTAMPTZ DEFAULT now(),
 *   UNIQUE(user_id, guild_id)
 * );
 *
 * CREATE TABLE IF NOT EXISTS discord_role_configs (
 *   id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
 *   guild_id   TEXT NOT NULL,
 *   role_id    TEXT NOT NULL,
 *   role_name  TEXT,
 *   trigger    TEXT DEFAULT 'member_join',
 *   enabled    BOOLEAN DEFAULT true,
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   UNIQUE(user_id, guild_id)
 * );
 *
 * ALTER TABLE discord_welcome_configs ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE discord_role_configs ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "Users manage own welcome configs" ON discord_welcome_configs FOR ALL USING (auth.uid() = user_id);
 * CREATE POLICY "Users manage own role configs" ON discord_role_configs FOR ALL USING (auth.uid() = user_id);
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const DISCORD_API = 'https://discord.com/api/v10'

function botHeaders() {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) throw new Error('DISCORD_BOT_TOKEN is not set')
  return {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
  }
}

async function discordFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${DISCORD_API}${path}`, {
    ...options,
    headers: { ...botHeaders(), ...(options?.headers ?? {}) },
  })
  if (!res.ok) {
    let message = `Discord API error ${res.status}`
    try {
      const body = await res.json()
      message = body.message ? `Discord API: ${body.message}` : message
    } catch {}
    throw new Error(message)
  }
  return res
}

export interface GuildStats {
  name: string
  icon: string | null
  member_count: number
  online_count: number
}

export interface DiscordChannel {
  id: string
  name: string
  position: number
}

export interface DiscordRole {
  id: string
  name: string
  color: number
  position: number
}

export interface DiscordMember {
  user: {
    id: string
    username: string
    global_name: string | null
    avatar: string | null
  }
  joined_at: string
}

/** GET /guilds/{id}?with_counts=true → server stats */
export async function getGuildStats(guildId: string): Promise<GuildStats> {
  const res = await discordFetch(`/guilds/${guildId}?with_counts=true`)
  const data = await res.json()
  return {
    name: data.name,
    icon: data.icon
      ? `https://cdn.discordapp.com/icons/${guildId}/${data.icon}.png`
      : null,
    member_count: data.approximate_member_count ?? data.member_count ?? 0,
    online_count: data.approximate_presence_count ?? 0,
  }
}

/** GET /guilds/{id}/channels → text channels only (type 0), sorted by position */
export async function getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
  const res = await discordFetch(`/guilds/${guildId}/channels`)
  const data: any[] = await res.json()
  return data
    .filter((c: any) => c.type === 0)
    .sort((a: any, b: any) => a.position - b.position)
    .map((c: any) => ({ id: c.id, name: c.name, position: c.position }))
}

/** GET /guilds/{id}/roles → all roles excluding @everyone */
export async function getGuildRoles(guildId: string): Promise<DiscordRole[]> {
  const res = await discordFetch(`/guilds/${guildId}/roles`)
  const data: any[] = await res.json()
  return data
    .filter((r: any) => r.name !== '@everyone')
    .map((r: any) => ({ id: r.id, name: r.name, color: r.color, position: r.position }))
}

/** POST /channels/{id}/messages → send a message to a channel */
export async function sendChannelMessage(channelId: string, content: string): Promise<void> {
  await discordFetch(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

/** PUT /guilds/{id}/members/{userId}/roles/{roleId} → assign role to member */
export async function assignRole(guildId: string, userId: string, roleId: string): Promise<void> {
  await discordFetch(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: 'PUT',
  })
}

/** GET /guilds/{id}/members?limit=100&after={after} → recent member list */
export async function getRecentMembers(guildId: string, after?: string): Promise<DiscordMember[]> {
  const params = new URLSearchParams({ limit: '100' })
  if (after) params.set('after', after)
  const res = await discordFetch(`/guilds/${guildId}/members?${params}`)
  const data: any[] = await res.json()
  return data.map((m: any) => ({
    user: {
      id: m.user.id,
      username: m.user.username,
      global_name: m.user.global_name ?? null,
      avatar: m.user.avatar ?? null,
    },
    joined_at: m.joined_at,
  }))
}
