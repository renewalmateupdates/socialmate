import { buildAiTxt } from '@/lib/llms'

// Crawler policy plus the core facts, generated from lib/site-facts.ts.
export const dynamic = 'force-static'

export function GET() {
  return new Response(buildAiTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
