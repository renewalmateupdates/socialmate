import type { Metadata } from 'next'
import Link from 'next/link'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'

export const metadata: Metadata = {
  title: 'Integrations & Webhooks — SocialMate',
  description: 'Connect SocialMate to Zapier, Make, n8n, or any custom automation with outbound webhooks.',
}

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PublicNav />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-14">

        {/* Hero */}
        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 mb-3">Integrations</span>
          <h1 className="text-3xl sm:text-4xl font-black mb-4">Outbound Webhooks</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            SocialMate can notify any external URL the moment a post publishes or fails.
            Connect to <strong className="text-white">Zapier</strong>, <strong className="text-white">Make</strong>,{' '}
            <strong className="text-white">n8n</strong>, Slack, Airtable, Google Sheets — anything that accepts a POST request.
          </p>
          <Link
            href="/settings?tab=Integrations"
            className="inline-block mt-4 px-5 py-2.5 rounded-xl bg-amber-400 text-black font-bold text-sm hover:bg-amber-300 transition-all"
          >
            Set up a webhook →
          </Link>
        </div>

        {/* What it does */}
        <section>
          <h2 className="text-xl font-bold mb-3">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm leading-relaxed">
            <li>Go to <Link href="/settings?tab=Integrations" className="text-amber-400 underline">Settings → Integrations</Link> and paste your endpoint URL.</li>
            <li>Select which events to subscribe to (<code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">post.published</code> and/or <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">post.failed</code>).</li>
            <li>Click <strong>Add webhook</strong>. Copy the secret that appears — it is shown only once.</li>
            <li>Every time the event fires, SocialMate sends a signed JSON body to your URL within seconds.</li>
          </ol>
        </section>

        {/* Payload format */}
        <section>
          <h2 className="text-xl font-bold mb-3">Payload format</h2>
          <p className="text-sm text-gray-400 mb-3">
            The request body is JSON with the following shape:
          </p>
          <pre className="bg-gray-900 border border-gray-700 rounded-2xl p-5 text-sm font-mono text-green-300 overflow-x-auto">
{`{
  "event": "post.published",
  "timestamp": "2026-05-22T14:30:00.000Z",
  "payload": {
    "post_id": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Just shipped outbound webhooks in SocialMate...",
    "platforms": ["bluesky", "linkedin"],
    "published_at": "2026-05-22T14:30:00.000Z"
  }
}`}
          </pre>
          <p className="text-xs text-gray-500 mt-3">
            For <code className="bg-gray-800 px-1 py-0.5 rounded">post.failed</code> the same shape is sent with <code className="bg-gray-800 px-1 py-0.5 rounded">event: "post.failed"</code>.
          </p>
        </section>

        {/* Signature verification */}
        <section>
          <h2 className="text-xl font-bold mb-3">Verifying the signature</h2>
          <p className="text-sm text-gray-400 mb-3">
            Every request includes an <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">X-SocialMate-Signature</code> header.
            The value is <code className="text-xs bg-gray-800 px-1.5 py-0.5 rounded">sha256=&lt;hex&gt;</code> where the hex is the HMAC-SHA256 of the raw request body using your webhook secret.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Example verification in Node.js:
          </p>
          <pre className="bg-gray-900 border border-gray-700 rounded-2xl p-5 text-sm font-mono text-blue-300 overflow-x-auto">
{`import { createHmac } from 'crypto'

function verifySignature(rawBody, secret, signatureHeader) {
  const expected = 'sha256=' + createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return expected === signatureHeader
}

// In your Express / Next.js / Cloudflare handler:
const raw = await request.text()
const sig = request.headers.get('X-SocialMate-Signature')
if (!verifySignature(raw, process.env.WEBHOOK_SECRET, sig)) {
  return new Response('Unauthorized', { status: 401 })
}
const event = JSON.parse(raw)`}
          </pre>
        </section>

        {/* Zapier guide */}
        <section>
          <h2 className="text-xl font-bold mb-1">Connecting to Zapier</h2>
          <p className="text-xs text-gray-500 mb-4">Webhooks by Zapier is available on Zapier's free plan.</p>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm leading-relaxed">
            <li>In Zapier, create a new Zap. Choose <strong>"Webhooks by Zapier"</strong> as the trigger.</li>
            <li>Select <strong>Catch Hook</strong>. Copy the provided webhook URL.</li>
            <li>Paste that URL into <Link href="/settings?tab=Integrations" className="text-amber-400 underline">Settings → Integrations</Link> in SocialMate.</li>
            <li>Publish a test post in SocialMate to send a sample payload to Zapier.</li>
            <li>Zapier will detect the fields automatically. Add any action step — Slack, Google Sheets, Notion, email, etc.</li>
          </ol>
        </section>

        {/* Make guide */}
        <section>
          <h2 className="text-xl font-bold mb-1">Connecting to Make (Integromat)</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm leading-relaxed">
            <li>In Make, create a new scenario. Add a <strong>Webhooks</strong> module.</li>
            <li>Select <strong>Custom webhook</strong>. Copy the generated URL.</li>
            <li>Paste that URL into <Link href="/settings?tab=Integrations" className="text-amber-400 underline">Settings → Integrations</Link> in SocialMate.</li>
            <li>Publish a post — Make will parse the JSON payload and show you all available fields.</li>
            <li>Chain any subsequent Make modules to automate your workflow.</li>
          </ol>
        </section>

        {/* n8n guide */}
        <section>
          <h2 className="text-xl font-bold mb-1">Connecting to n8n</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm leading-relaxed">
            <li>In n8n, add a <strong>Webhook</strong> node as the trigger. Set method to POST.</li>
            <li>Copy the webhook URL n8n provides (Production or Test URL).</li>
            <li>Paste it into <Link href="/settings?tab=Integrations" className="text-amber-400 underline">Settings → Integrations</Link> in SocialMate.</li>
            <li>Publish a test post — n8n receives the payload and shows the parsed JSON.</li>
            <li>Add downstream nodes: HTTP Request, Airtable, Discord, Slack, or any integration.</li>
          </ol>
        </section>

        {/* Limits */}
        <section className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-sm text-gray-400 space-y-2">
          <h2 className="text-base font-bold text-white mb-2">Notes</h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Webhook delivery has a 10-second timeout per endpoint.</li>
            <li>Failures are logged but do not retry automatically — they are fire-and-forget.</li>
            <li>Webhooks are non-fatal: a failed delivery will never cause your post to fail.</li>
            <li>You can toggle a webhook on/off from Settings without deleting it.</li>
            <li>The secret is shown only once at creation time. If lost, delete and re-add the webhook.</li>
          </ul>
        </section>

        <div className="text-center text-sm text-gray-500 pb-4">
          Questions? Join the{' '}
          <a href="https://discord.gg/2se6FGrbRU" className="text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">
            SocialMate Discord
          </a>
          {' '}or{' '}
          <a href="mailto:support@socialmate.studio" className="text-amber-400 hover:text-amber-300">
            email support
          </a>.
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
