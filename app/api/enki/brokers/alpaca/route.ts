export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Required env var: ENKI_ENCRYPTION_KEY — must be a 32-byte hex string (64 hex chars)
// Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// Add to Vercel: ENKI_ENCRYPTION_KEY=<your-64-char-hex-string>

function getEncryptionKey(): Buffer {
  const hexKey = process.env.ENKI_ENCRYPTION_KEY
  if (!hexKey || hexKey.length !== 64) {
    throw new Error('ENKI_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
  }
  return Buffer.from(hexKey, 'hex')
}

function encrypt(text: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(16)
  const cipher = createCipheriv('aes-256-cbc', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey()
  const [ivHex, encHex] = encryptedText.split(':')
  const iv = Buffer.from(ivHex, 'hex')
  const encrypted = Buffer.from(encHex, 'hex')
  const decipher = createDecipheriv('aes-256-cbc', key, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}

function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: async () => (await cookies()).getAll(),
        setAll: async (cookiesToSet) => {
          const store = await cookies()
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options))
        },
      },
    }
  )
}

// POST /api/enki/brokers/alpaca
// Body: { apiKey: string, secretKey: string, paper: boolean }
// Validates keys against Alpaca, encrypts and stores them, returns account info
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check tier — Commander or Emperor required
  const { data: profile } = await getSupabaseAdmin()
    .from('enki_profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.tier === 'citizen') {
    return NextResponse.json(
      { error: 'Alpaca connection requires Commander tier or above.' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const { apiKey, secretKey, paper } = body as { apiKey: string; secretKey: string; paper: boolean }

  if (!apiKey || !secretKey) {
    return NextResponse.json({ error: 'API Key and Secret Key are required.' }, { status: 400 })
  }

  // Validate keys against Alpaca
  const alpacaBase = paper
    ? 'https://paper-api.alpaca.markets'
    : 'https://api.alpaca.markets'

  let accountInfo: { buying_power: string; portfolio_value: string; equity: string; currency: string }

  try {
    const alpacaRes = await fetch(`${alpacaBase}/v2/account`, {
      headers: {
        'APCA-API-KEY-ID':     apiKey,
        'APCA-API-SECRET-KEY': secretKey,
      },
    })

    if (!alpacaRes.ok) {
      const errBody = await alpacaRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: errBody.message ?? 'Invalid Alpaca credentials. Check your API key and secret.' },
        { status: 400 }
      )
    }

    accountInfo = await alpacaRes.json()
  } catch {
    return NextResponse.json(
      { error: 'Could not reach Alpaca API. Please try again.' },
      { status: 502 }
    )
  }

  // Encrypt and store keys
  try {
    const encryptedKey    = encrypt(apiKey)
    const encryptedSecret = encrypt(secretKey)

    const { error } = await getSupabaseAdmin()
      .from('enki_profiles')
      .update({
        alpaca_connected:   true,
        alpaca_key_id:      encryptedKey,
        alpaca_secret:      encryptedSecret,
        alpaca_paper:       paper,
        updated_at:         new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('[Enki/Alpaca] DB update error:', error.message)
      return NextResponse.json({ error: 'Failed to save credentials.' }, { status: 500 })
    }
  } catch (err: any) {
    console.error('[Enki/Alpaca] Encryption error:', err.message)
    return NextResponse.json({ error: 'Encryption configuration error.' }, { status: 500 })
  }

  return NextResponse.json({
    connected:       true,
    paper,
    buying_power:    parseFloat(accountInfo.buying_power ?? '0'),
    portfolio_value: parseFloat(accountInfo.portfolio_value ?? accountInfo.equity ?? '0'),
    currency:        accountInfo.currency ?? 'USD',
  })
}

// DELETE /api/enki/brokers/alpaca
// Clears stored keys and disconnects Alpaca
export async function DELETE() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await getSupabaseAdmin()
    .from('enki_profiles')
    .update({
      alpaca_connected: false,
      alpaca_key_id:    null,
      alpaca_secret:    null,
      alpaca_paper:     null,
      updated_at:       new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ disconnected: true })
}
