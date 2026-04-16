export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

// Reuses ENKI_ENCRYPTION_KEY — same env var as Alpaca route

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

// POST /api/enki/brokers/coinbase
// Body: { apiKey: string, secretKey: string }
// Emperor tier only — validates against Coinbase Advanced Trade API
export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Emperor tier only for Coinbase
  const { data: profile } = await getSupabaseAdmin()
    .from('enki_profiles')
    .select('tier')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.tier !== 'emperor') {
    return NextResponse.json(
      { error: 'Coinbase connection requires Emperor tier.' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const { apiKey, secretKey } = body as { apiKey: string; secretKey: string }

  if (!apiKey || !secretKey) {
    return NextResponse.json({ error: 'API Key and Secret Key are required.' }, { status: 400 })
  }

  // Validate against Coinbase Advanced Trade API
  // Coinbase Advanced Trade uses API key + secret with Bearer auth
  let accountCount: number | null = null

  try {
    const cbRes = await fetch('https://api.coinbase.com/api/v3/brokerage/accounts', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'CB-ACCESS-KEY':    apiKey,
        'CB-ACCESS-SECRET': secretKey,
        'Content-Type': 'application/json',
      },
    })

    if (!cbRes.ok) {
      return NextResponse.json(
        { error: 'Invalid Coinbase credentials. Check your API key and secret.' },
        { status: 400 }
      )
    }

    const cbData = await cbRes.json()
    accountCount = Array.isArray(cbData.accounts) ? cbData.accounts.length : null
  } catch {
    return NextResponse.json(
      { error: 'Could not reach Coinbase API. Please try again.' },
      { status: 502 }
    )
  }

  // Encrypt and store
  try {
    const encryptedKey    = encrypt(apiKey)
    const encryptedSecret = encrypt(secretKey)

    const { error } = await getSupabaseAdmin()
      .from('enki_profiles')
      .update({
        coinbase_connected:  true,
        coinbase_key_id:     encryptedKey,
        coinbase_secret:     encryptedSecret,
        updated_at:          new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('[Enki/Coinbase] DB update error:', error.message)
      return NextResponse.json({ error: 'Failed to save credentials.' }, { status: 500 })
    }
  } catch (err: any) {
    console.error('[Enki/Coinbase] Encryption error:', err.message)
    return NextResponse.json({ error: 'Encryption configuration error.' }, { status: 500 })
  }

  return NextResponse.json({
    connected:     true,
    account_count: accountCount,
  })
}

// DELETE /api/enki/brokers/coinbase
// Clears stored keys and disconnects Coinbase
export async function DELETE() {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await getSupabaseAdmin()
    .from('enki_profiles')
    .update({
      coinbase_connected: false,
      coinbase_key_id:    null,
      coinbase_secret:    null,
      updated_at:         new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ disconnected: true })
}
