import Link from 'next/link'
import PublicNav from '@/components/PublicNav'
import PublicFooter from '@/components/PublicFooter'
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '@/lib/contact'

export const metadata = {
  alternates: { canonical: 'https://socialmate.studio/meta/data-deletion' },
  title: 'Instagram and Facebook Data Deletion — SocialMate',
  description: 'How to delete the Instagram and Facebook data SocialMate stores, and the status of a deletion request.',
}

// The page Meta links to from a data deletion request (the `url` returned by
// /api/meta/data-deletion), and the "Data deletion instructions URL" in the
// Meta app dashboard. Deletion itself runs automatically when Meta's request
// arrives, so a confirmation code here is always a completed request.
export default async function MetaDataDeletion({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const safeCode = code && /^[a-f0-9]{6,32}$/i.test(code) ? code : null

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <Link href="/privacy" className="text-sm font-bold text-gray-400 hover:text-black dark:hover:text-white transition-all">← Privacy Policy</Link>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Instagram and Facebook data deletion</h1>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-10">SocialMate · Gilgamesh Enterprise LLC</p>

        {safeCode && (
          <div className="mb-10 rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 p-5">
            <p className="text-sm font-bold text-green-800 dark:text-green-300">Request received and completed</p>
            <p className="text-sm text-green-800 dark:text-green-300 mt-1">
              Confirmation code: <span className="font-mono font-semibold">{safeCode}</span>
            </p>
            <p className="text-sm text-green-800 dark:text-green-300 mt-2">
              SocialMate processes these requests automatically the moment Meta sends them. Any Instagram or Facebook
              connection data SocialMate held for your account (access tokens, account IDs, names and profile picture
              links) has been deleted. Questions: <a href={SUPPORT_MAILTO} className="underline font-semibold">{SUPPORT_EMAIL}</a>
            </p>
          </div>
        )}

        <div className="space-y-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">What SocialMate stores</h2>
            <p>When you connect Instagram or a Facebook Page, SocialMate stores only what it needs to publish the posts you schedule:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your Instagram account ID, username, account type and profile picture link, or your Facebook Page ID, name, category and picture link</li>
              <li>The access token Meta issues, used only to publish the posts you schedule</li>
              <li>An app-scoped Meta user ID, so a deletion request from Meta can find your data</li>
            </ul>
            <p className="mt-2">SocialMate does not read your messages, comments, followers or insights.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">How to delete it</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li><span className="font-semibold">In SocialMate:</span> open <Link href="/accounts" className="underline font-semibold">Accounts</Link> and press Disconnect on the Instagram account or Facebook Page. The token and account details are deleted immediately.</li>
              <li><span className="font-semibold">From Facebook:</span> Settings &amp; privacy → Settings → Apps and websites → remove SocialMate. Meta notifies SocialMate and the data is deleted automatically.</li>
              <li><span className="font-semibold">From Instagram:</span> Settings → Website permissions → Apps and websites → remove SocialMate. Meta notifies SocialMate and the data is deleted automatically.</li>
              <li><span className="font-semibold">Everything else:</span> to delete your whole SocialMate account, email <a href={SUPPORT_MAILTO} className="underline font-semibold">{SUPPORT_EMAIL}</a> with &quot;Delete My Account&quot; in the subject line. See section 13 of the <Link href="/privacy" className="underline font-semibold">Privacy Policy</Link>.</li>
            </ol>
            <p className="mt-3">Posts already published to Instagram or Facebook stay there. Delete them on Instagram or Facebook directly.</p>
          </section>
        </div>
      </div>
      <PublicFooter />
    </div>
  )
}
