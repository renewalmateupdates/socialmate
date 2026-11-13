import { buildLlmsTxt } from '@/lib/llms'
import { recentPosts } from '@/lib/blog/recent'

// Generated from lib/site-facts.ts and the page manifest (lib/llms.ts), so a
// price or platform change reaches AI assistants with the next deploy.
// Rebuilt daily for new blog posts.
export const revalidate = 86400

export async function GET() {
  return new Response(buildLlmsTxt(await recentPosts(15)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
