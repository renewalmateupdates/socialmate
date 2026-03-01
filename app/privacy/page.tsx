import Link from 'next/link'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">Sign in</Link>
          <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get started free →
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-10">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: February 28, 2026</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-green-800 mb-1">The short version</p>
            <p className="text-sm text-green-700">We collect only what we need to run SocialMate, we never sell your data, we never show you ads, and you can delete everything at any time.</p>
          </div>

          {[
            {
              title: '1. Information We Collect',
              content: [
                'Account information: When you sign up, we collect your email address and password (hashed and encrypted — we never see your actual password).',
                'Content you create: Posts, drafts, templates, hashtag collections, media files, and other content you create within SocialMate are stored to power the service.',
                'Usage data: We collect basic analytics about how you use SocialMate (pages visited, features used) to improve the product. This data is never sold.',
                'Device information: Browser type, operating system, and IP address for security and fraud prevention purposes only.',
              ]
            },
            {
              title: '2. How We Use Your Information',
              content: [
                'To operate and improve SocialMate: Your data is used solely to provide and improve the service you signed up for.',
                'To send important emails: Account confirmation, password resets, and critical service updates. We do not send marketing emails without your explicit consent.',
                'For security: To detect and prevent fraud, abuse, and unauthorized access to your account.',
                'We do NOT: Sell your data to third parties, use your data for advertising, share your content with other users without your permission, or use your posts to train AI models.',
              ]
            },
            {
              title: '3. Data Storage & Security',
              content: [
                'All data is stored securely using Supabase, which uses industry-standard encryption at rest and in transit (TLS/SSL).',
                'Passwords are hashed using bcrypt — we never store or have access to your actual password.',
                'Media files are stored in encrypted cloud storage with access controls.',
                'We perform regular security audits and keep dependencies up to date.',
              ]
            },
            {
              title: '4. Cookies',
              content: [
                'We use essential cookies only: authentication tokens to keep you logged in, and session identifiers for security.',
                'We do not use advertising cookies, tracking pixels, or third-party analytics cookies.',
                'You can clear cookies at any time through your browser settings. This will log you out of SocialMate.',
              ]
            },
            {
              title: '5. Third-Party Services',
              content: [
                'Supabase: Database and authentication provider. Your data is stored in Supabase infrastructure. See supabase.com/privacy for their policy.',
                'Vercel: Hosting provider for the SocialMate application. See vercel.com/legal/privacy-policy.',
                'Social platforms: When you connect social accounts (Instagram, Twitter, etc.), those platforms\' own privacy policies apply to data shared with them.',
                'We do not use Google Analytics, Facebook Pixel, or similar tracking services.',
              ]
            },
            {
              title: '6. Your Rights',
              content: [
                'Access: You can export all your data at any time from Settings → Danger Zone.',
                'Deletion: You can delete your account and all associated data at any time. Deletion is permanent and irreversible.',
                'Correction: You can update your account information at any time in Settings.',
                'Portability: Your posts, templates, and content can be exported in standard formats.',
                'GDPR: If you are in the European Union, you have additional rights under GDPR. Contact us at privacy@socialmate.app to exercise these rights.',
              ]
            },
            {
              title: '7. Data Retention',
              content: [
                'Active accounts: Data is retained for as long as your account is active.',
                'Deleted accounts: When you delete your account, all personal data is permanently deleted within 30 days.',
                'Backups: Encrypted backups may retain data for up to 90 days after deletion for disaster recovery purposes.',
              ]
            },
            {
              title: '8. Children\'s Privacy',
              content: [
                'SocialMate is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13.',
                'If you believe a child under 13 has created an account, please contact us and we will delete the account immediately.',
              ]
            },
            {
              title: '9. Changes to This Policy',
              content: [
                'We will notify you of significant changes to this Privacy Policy via email and in-app notification at least 14 days before changes take effect.',
                'Continued use of SocialMate after changes take effect constitutes acceptance of the updated policy.',
              ]
            },
            {
              title: '10. Contact Us',
              content: [
                'For privacy questions or to exercise your rights, contact us at: privacy@socialmate.app',
                'We aim to respond to all privacy requests within 48 hours.',
              ]
            },
          ].map(section => (
            <div key={section.title} className="border-b border-gray-100 pb-8">
              <h2 className="text-lg font-extrabold tracking-tight mb-4">{section.title}</h2>
              <ul className="space-y-3">
                {section.content.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                    <span className="text-gray-300 flex-shrink-0 mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">Questions about your privacy?</p>
          <a href="mailto:privacy@socialmate.app" className="text-sm font-bold text-black hover:underline">
            privacy@socialmate.app →
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="font-bold text-sm tracking-tight">SocialMate</span>
            <span className="text-xs text-gray-400 ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-black transition-colors font-semibold text-black">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}