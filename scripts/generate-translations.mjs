#!/usr/bin/env node
/**
 * Generate i18n translations for all non-English locales using Gemini API.
 *
 * Usage: node scripts/generate-translations.mjs
 * Requires: GEMINI_API_KEY env var
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY env var is required')
  process.exit(1)
}

const en = JSON.parse(readFileSync(join(ROOT, 'messages/en.json'), 'utf8'))

// Brand names that must NEVER be translated
const BRAND_NAMES = [
  'SocialMate', 'SOMA', 'Enki', 'Studio Stax', 'IRIS', 'HERMES',
  'Bluesky', 'Mastodon', 'Discord', 'Telegram', 'X/Twitter', 'Twitter',
  'TikTok', 'LinkedIn', 'YouTube', 'Twitch', 'Reddit', 'Instagram',
  'Facebook', 'Pinterest', 'Stripe', 'Gemini', 'Product Hunt',
  'SM-Give', 'SM-Pulse', 'SM-Radar', 'Gilgamesh',
]

const LOCALES = [
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese (Brazilian)' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Simplified Chinese' },
]

async function translateWithGemini(locale, localeObj) {
  const prompt = `You are a professional translator. Translate the following JSON from English to ${localeObj.name}.

CRITICAL RULES:
1. Keep ALL JSON keys exactly as-is (never translate keys)
2. NEVER translate these brand names — leave them exactly as written: ${BRAND_NAMES.join(', ')}
3. Keep all emoji characters exactly as-is
4. Keep all interpolation placeholders exactly as-is (e.g., {count}, {date}, {code})
5. Keep URL paths exactly as-is (e.g., /pricing, /signup)
6. Preserve the exact JSON structure
7. Return ONLY valid JSON, no markdown, no explanation, no code fences
8. Translate marketing copy naturally and idiomatically — not word-for-word

English JSON to translate:
${JSON.stringify(en, null, 2)}

Return only the translated JSON object:`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 32768,
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini API error for ${locale}: ${response.status} ${err}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error(`No text in Gemini response for ${locale}`)

  // Clean up any markdown code fences if present
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch (e) {
    console.error(`JSON parse error for ${locale}. Raw response:\n${cleaned}`)
    throw e
  }
}

async function main() {
  console.log('Generating translations for 6 locales...\n')

  for (const localeObj of LOCALES) {
    const { code, name } = localeObj
    console.log(`Translating to ${name} (${code})...`)

    try {
      const translated = await translateWithGemini(code, localeObj)
      const outPath = join(ROOT, `messages/${code}.json`)
      writeFileSync(outPath, JSON.stringify(translated, null, 2) + '\n', 'utf8')
      console.log(`  ✓ Written to messages/${code}.json`)
    } catch (err) {
      console.error(`  ✗ Failed for ${code}: ${err.message}`)
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log('\nDone.')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
