import { NextRequest, NextResponse } from 'next/server'

const CREDIT_COSTS: Record<string, number> = {
  caption:  1,
  hashtags: 1,
  rewrite:  1,
  hook:     2,
}

function buildPrompt(tool: string, content: string, platform: string): string {
  switch (tool) {
    case 'caption':
      return `You are a social media expert. Write an engaging ${platform} caption for the following topic or idea. Match the platform's style. Return only the caption, nothing else.\n\nTopic: ${content}`
    case 'hashtags':
      return `You are a social media expert. Generate 10-15 relevant hashtags for the following ${platform} post. Mix popular and niche hashtags. Return only the hashtags separated by spaces, nothing else.\n\nPost: ${content}`
    case 'rewrite':
      return `You are a social media copywriter. Rewrite the following ${platform} post to be more engaging and punchy. Return only the rewritten post, nothing else.\n\nOriginal: ${content}`
    case 'hook':
      return `You are a viral content expert. Generate 3 scroll-stopping opening lines for a ${platform} post about the following topic. Number them 1, 2, 3. Return only the hooks, nothing else.\n\nTopic: ${content}`
    default:
      return content
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tool, content, platform } = await req.json()

    if (!tool || !content) {
      return NextResponse.json({ error: 'Missing tool or content' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const prompt = buildPrompt(tool, content, platform || 'general')

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data))
      return NextResponse.json({ error: 'Gemini API error', detail: data }, { status: 500 })
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const creditCost = CREDIT_COSTS[tool] || 1

    return NextResponse.json({ result, creditCost })
  } catch (err) {
    console.error('AI route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}