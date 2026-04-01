export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Resend } from 'resend'

const REFUND_WINDOW_DAYS = 30  // Generate blog post 30 days after payment (past refund window)

function getGemini() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
}

async function generateBlogPost(tool: {
  name: string
  tagline: string
  description: string
  url: string
  category: string
  mission_statement?: string
}): Promise<{ title: string; content: string; excerpt: string }> {
  const model = getGemini()

  const prompt = `You are a tech blog writer for SocialMate, a social media management platform. Write a professional, enthusiastic blog post featuring a tool called "${tool.name}" that is listed in our Studio Stax directory.

Tool details:
- Name: ${tool.name}
- Tagline: ${tool.tagline}
- Description: ${tool.description}
- Website: ${tool.url}
- Category: ${tool.category}
${tool.mission_statement ? `- Mission: ${tool.mission_statement}` : ''}

Write a blog post that:
1. Has a compelling title (not just "Introducing X")
2. Is 600-900 words
3. Uses markdown formatting (## for headers, **bold**, etc.)
4. Covers: what the tool does, who it's for, key features, why creators should care
5. Mentions that ${tool.name} is listed in Studio Stax on SocialMate
6. Has a brief mention of SM-Give (SocialMate's charity program where 50% of donations go to charity)
7. Is genuinely helpful, not overly promotional
8. Ends with a clear call to action to visit ${tool.url}

Return ONLY a JSON object with this exact format (no markdown code blocks):
{
  "title": "the blog post title",
  "excerpt": "a 1-2 sentence excerpt for the blog listing page (max 160 chars)",
  "content": "the full markdown blog post content"
}`

  const result = await model.generateContent(prompt)
  const text   = result.response.text().trim()

  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Gemini response was not valid JSON')
  return JSON.parse(jsonMatch[0])
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin   = getSupabaseAdmin()
  const resend  = new Resend(process.env.RESEND_API_KEY)
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL || 'https://socialmate.studio'
  const cutoff  = new Date(Date.now() - REFUND_WINDOW_DAYS * 24 * 60 * 60 * 1000)

  let generated = 0, errors = 0

  // Find active slots past the refund window where blog hasn't been generated yet
  const { data: slots } = await admin
    .from('studio_stax_slots')
    .select('id, listing_id, buyer_name, buyer_email, created_at, blog_article_generated')
    .eq('status', 'active')
    .eq('blog_article_generated', false)
    .lt('created_at', cutoff.toISOString())

  for (const slot of slots ?? []) {
    try {
      // Fetch full listing details
      const { data: listing } = await admin
        .from('curated_listings')
        .select('id, name, tagline, description, url, category, mission_statement')
        .eq('id', slot.listing_id)
        .single()

      if (!listing) continue

      // Generate blog post with Gemini
      const { title, content, excerpt } = await generateBlogPost(listing)

      // Create URL-safe slug
      const slug = listing.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      const blogSlug = `studio-stax-${slug}`

      // Store generated blog post in DB
      await admin.from('blog_posts').upsert({
        slug:          blogSlug,
        title,
        excerpt,
        content,
        category:      'studio-stax',
        author:        'SocialMate AI',
        listing_id:    listing.id,
        published_at:  new Date().toISOString(),
        created_at:    new Date().toISOString(),
      }, { onConflict: 'slug' })

      // Mark blog as generated on slot
      await admin
        .from('studio_stax_slots')
        .update({ blog_article_generated: true })
        .eq('id', slot.id)

      // Notify lister
      const blogUrl = `${appUrl}/blog/${blogSlug}`
      await resend.emails.send({
        from:    'SocialMate <hello@socialmate.studio>',
        to:      slot.buyer_email,
        subject: `📝 Your Studio Stax blog feature is live — ${listing.name}`,
        html: `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#111;padding:24px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#9ca3af;">Studio Stax</p>
        <h1 style="margin:6px 0 0;font-size:22px;font-weight:800;color:#fff;">Your blog feature is live 📝</h1>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 12px;font-size:14px;color:#374151;">Hey ${slot.buyer_name},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#6b7280;line-height:1.6;">
          We just published a blog feature for <strong>${listing.name}</strong> on the SocialMate blog. Share it with your audience!
        </p>
        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">${title}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">${excerpt}</p>
        </div>
        <a href="${blogUrl}" style="display:block;text-align:center;background:#111;color:#fff;font-weight:700;font-size:14px;padding:14px 24px;border-radius:12px;text-decoration:none;margin-bottom:24px;">
          Read your blog feature →
        </a>
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">Questions? Reply to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
      })

      generated++
    } catch (err) {
      console.error(`[BlogGen] Failed for slot ${slot.id}:`, err)
      errors++
    }
  }

  return NextResponse.json({ ok: true, generated, errors, checked: (slots ?? []).length })
}
