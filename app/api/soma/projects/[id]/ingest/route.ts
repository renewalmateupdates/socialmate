export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SOMA_COSTS } from '@/lib/soma-costs'

const INGEST_COST = SOMA_COSTS.ingest_weekly // 25

function parseGeminiJson(text: string): any {
  return JSON.parse(text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim())
}

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// POST /api/soma/projects/[id]/ingest
// Accepts: { content: string, input_method: 'text'|'file'|'url', filename?: string, source_url?: string }
// Saves as new master doc version, diffs against previous version, extracts insights
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id: projectId } = await params

    const body = await req.json()
    const { content, input_method, filename, source_url } = body as {
      content: string
      input_method: 'text' | 'file' | 'url'
      filename?: string
      source_url?: string
    }

    if (!content?.trim()) return NextResponse.json({ error: 'content is required' }, { status: 400 })

    const admin = getSupabaseAdmin()
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })

    // Verify project belongs to user
    const { data: project } = await admin
      .from('soma_projects')
      .select('id, workspace_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // Check credits
    const { data: workspace } = await admin
      .from('workspaces')
      .select('id, soma_credits_monthly, soma_credits_used, soma_credits_purchased')
      .eq('id', project.workspace_id)
      .single()

    if (!workspace) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })

    const monthly   = workspace.soma_credits_monthly ?? 0
    const used      = workspace.soma_credits_used ?? 0
    const purchased = workspace.soma_credits_purchased ?? 0
    const remaining = Math.max(0, monthly - used) + purchased

    if (remaining < INGEST_COST) return NextResponse.json({ error: 'insufficient_soma_credits' }, { status: 402 })

    // Get latest existing doc for this project (for diffing)
    const { data: prevDocs } = await admin
      .from('soma_master_docs')
      .select('id, version, content')
      .eq('project_id', projectId)
      .order('version', { ascending: false })
      .limit(1)

    const prevDoc = prevDocs?.[0] ?? null
    const nextVersion = (prevDoc?.version ?? 0) + 1

    // Save new master doc version
    const { data: newDoc, error: docErr } = await admin
      .from('soma_master_docs')
      .insert({
        project_id:   projectId,
        workspace_id: project.workspace_id,
        user_id:      user.id,
        version:      nextVersion,
        content:      content.trim(),
        filename:     filename ?? null,
        input_method: input_method ?? 'text',
        source_url:   source_url ?? null,
      })
      .select('id, version')
      .single()

    if (docErr || !newDoc) return NextResponse.json({ error: 'Failed to save doc' }, { status: 500 })

    // Build Gemini prompt — diff if prev doc exists, else analyze fresh
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = prevDoc
      ? `Compare these two weekly master docs and extract what is NEW or CHANGED in the CURRENT version.
Return ONLY valid JSON (no markdown):
{
  "key_themes": ["theme1", "theme2"],
  "wins": ["win1"],
  "challenges": ["challenge1"],
  "directional_shifts": ["what changed or shifted"],
  "content_angles": ["angle1", "angle2", "angle3", "angle4", "angle5"],
  "emotional_tone": "grinding",
  "diff_summary": "One sentence: what changed most from last week to this week."
}

PREVIOUS WEEK:
${prevDoc.content.slice(0, 30000)}

CURRENT WEEK:
${content.slice(0, 30000)}

Rules: Focus on what's NEW. emotional_tone must be: high, reflective, grinding, or celebratory.`
      : `Analyze this weekly master doc and extract content themes.
Return ONLY valid JSON (no markdown):
{
  "key_themes": ["theme1", "theme2"],
  "wins": ["win1"],
  "challenges": ["challenge1"],
  "directional_shifts": ["shift1"],
  "content_angles": ["angle1", "angle2", "angle3", "angle4", "angle5"],
  "emotional_tone": "grinding",
  "diff_summary": "First week baseline — no previous doc to compare."
}

MASTER DOC:
${content.slice(0, 30000)}

Rules: Be specific. emotional_tone must be: high, reflective, grinding, or celebratory.`

    let extracted_insights: any
    try {
      const result = await model.generateContent(prompt)
      extracted_insights = parseGeminiJson(result.response.text())
    } catch (aiErr: any) {
      console.error('[SOMA Ingest] Gemini error:', aiErr?.message)
      return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 })
    }

    // Store ingestion record linked to project + doc version
    const { data: ingestion, error: ingErr } = await admin
      .from('soma_weekly_ingestion')
      .insert({
        project_id:       projectId,
        workspace_id:     project.workspace_id,
        user_id:          user.id,
        week_label:       `v${nextVersion} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        raw_input:        content.trim(),
        extracted_insights,
        is_diff:          !!prevDoc,
        generated_posts_count: 0,
      })
      .select('id')
      .single()

    if (ingErr || !ingestion) return NextResponse.json({ error: 'Failed to save ingestion' }, { status: 500 })

    // Deduct credits
    const monthlyAvailable = Math.max(0, monthly - used)
    const newUsed      = monthlyAvailable >= INGEST_COST ? used + INGEST_COST : monthly
    const newPurchased = monthlyAvailable >= INGEST_COST ? purchased : purchased - (INGEST_COST - monthlyAvailable)
    const balanceAfter = Math.max(0, monthly - newUsed) + newPurchased

    await admin.from('workspaces').update({ soma_credits_used: newUsed, soma_credits_purchased: newPurchased }).eq('id', workspace.id)
    await admin.from('soma_credit_ledger').insert({ workspace_id: workspace.id, user_id: user.id, action_type: 'ingest_weekly', credits_used: INGEST_COST, balance_after: balanceAfter })

    return NextResponse.json({
      success: true,
      ingestion_id:      ingestion.id,
      doc_version:       nextVersion,
      is_diff:           !!prevDoc,
      extracted_insights,
    })
  } catch (err) {
    console.error('[SOMA Project Ingest POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
