export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { SOMA_COSTS } from '@/lib/soma-costs'

const INGEST_COST = SOMA_COSTS.ingest_weekly // 25
const MAX_CHARS = 500_000

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
    if (content.length > MAX_CHARS) return NextResponse.json({
      error: `Document is too large (${content.length.toLocaleString()} chars). Maximum is ${MAX_CHARS.toLocaleString()} characters.`
    }, { status: 400 })

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

    // Load SOMA's memory for this project
    const { data: memory } = await admin
      .from('soma_project_memory')
      .select('topics_covered, angles_used, running_summary, total_posts_generated')
      .eq('project_id', projectId)
      .maybeSingle()

    const memoryBlock = memory?.running_summary
      ? `SOMA MEMORY — What has already been covered for this project:
${memory.running_summary}

Topics already posted about: ${(memory.topics_covered as string[] ?? []).join(', ') || 'none yet'}
Angles already used: ${(memory.angles_used as string[] ?? []).join(', ') || 'none yet'}
Total posts generated so far: ${memory.total_posts_generated ?? 0}

Do NOT repeat or re-extract themes, wins, or angles that are already in SOMA's memory above.`
      : 'SOMA MEMORY: No previous content generated for this project yet — this is a fresh start.'

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

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const prompt = prevDoc
      ? `You are SOMA, a Self-Optimizing Media Agent acting as a professional social media manager.

${memoryBlock}

---

Your task: Compare the PREVIOUS and CURRENT master docs head to toe. Extract ONLY what is new, changed, or different — and cross-reference against SOMA's memory above to avoid repeating anything already covered.

Return ONLY valid JSON (no markdown):
{
  "key_themes": ["new themes not in memory"],
  "wins": ["new wins only — not previously posted"],
  "challenges": ["new challenges only"],
  "directional_shifts": ["things that changed direction since last version"],
  "content_angles": ["5 fresh angles SOMA has NOT used yet — be specific"],
  "emotional_tone": "grinding",
  "diff_summary": "One sentence: what is new this week that SOMA hasn't covered yet.",
  "memory_update": "2-3 sentences summarizing what new ground this ingestion covers. Written as notes a social media manager would keep to remember what they've already posted about."
}

PREVIOUS MASTER DOC (v${prevDoc.version}):
${prevDoc.content}

CURRENT MASTER DOC (v${nextVersion}):
${content}

Rules: emotional_tone must be: high, reflective, grinding, or celebratory. Be specific and concrete. The memory_update field is mandatory.`
      : `You are SOMA, a Self-Optimizing Media Agent acting as a professional social media manager.

${memoryBlock}

---

Your task: Analyze this master doc and extract the most compelling content themes and angles. This is the first submission for this project.

Return ONLY valid JSON (no markdown):
{
  "key_themes": ["theme1", "theme2"],
  "wins": ["win1"],
  "challenges": ["challenge1"],
  "directional_shifts": ["shift1"],
  "content_angles": ["angle1", "angle2", "angle3", "angle4", "angle5"],
  "emotional_tone": "grinding",
  "diff_summary": "First submission — baseline established.",
  "memory_update": "2-3 sentences summarizing what this first submission covers. Written as notes a social media manager would keep."
}

MASTER DOC:
${content}

Rules: Be specific. emotional_tone must be: high, reflective, grinding, or celebratory. The memory_update field is mandatory.`

    let extracted_insights: any
    try {
      const result = await model.generateContent(prompt)
      extracted_insights = parseGeminiJson(result.response.text())
    } catch (aiErr: any) {
      console.error('[SOMA Ingest] Gemini error:', aiErr?.message)
      return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 })
    }

    // Update SOMA's project memory with what was just ingested
    const newTopics = Array.from(new Set([
      ...(memory?.topics_covered as string[] ?? []),
      ...(extracted_insights.key_themes ?? []),
    ]))
    const newAngles = Array.from(new Set([
      ...(memory?.angles_used as string[] ?? []),
      ...(extracted_insights.content_angles ?? []),
    ]))
    const previousSummary = memory?.running_summary ?? ''
    const memoryUpdate    = extracted_insights.memory_update ?? ''
    const newSummary      = previousSummary
      ? `${previousSummary}\n\n[v${nextVersion} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}]: ${memoryUpdate}`
      : `[v${nextVersion} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}]: ${memoryUpdate}`

    await admin.from('soma_project_memory').upsert(
      {
        project_id:     projectId,
        workspace_id:   project.workspace_id,
        user_id:        user.id,
        topics_covered: newTopics,
        angles_used:    newAngles,
        running_summary: newSummary,
        updated_at:     new Date().toISOString(),
      },
      { onConflict: 'project_id' }
    )

    // Store ingestion record
    const { data: ingestion, error: ingErr } = await admin
      .from('soma_weekly_ingestion')
      .insert({
        project_id:            projectId,
        workspace_id:          project.workspace_id,
        user_id:               user.id,
        week_label:            `v${nextVersion} — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        raw_input:             content.trim(),
        extracted_insights,
        is_diff:               !!prevDoc,
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
    await admin.from('soma_credit_ledger').insert({
      workspace_id:  workspace.id,
      user_id:       user.id,
      action_type:   'ingest_weekly',
      credits_used:  INGEST_COST,
      balance_after: balanceAfter,
    })

    return NextResponse.json({
      success:            true,
      ingestion_id:       ingestion.id,
      doc_version:        nextVersion,
      is_diff:            !!prevDoc,
      extracted_insights,
      memory_updated:     true,
    })
  } catch (err) {
    console.error('[SOMA Project Ingest POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
