import Link from 'next/link'

export default function Terms() {
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
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Terms of Service</h1>
          <p className="text-gray-400 text-sm">Last updated: February 28, 2026</p>
        </div>

        <div className="space-y-8">

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <p className="text-sm font-bold text-blue-800 mb-1">The short version</p>
            <p className="text-sm text-blue-700">Use SocialMate for lawful purposes, respect other users, and don't abuse the platform. We can suspend accounts that violate these terms. You own your content.</p>
          </div>

          {[
            {
              title: '1. Acceptance of Terms',
              content: [
                'By creating a SocialMate account or using our services, you agree to be bound by these Terms of Service.',
                'If you are using SocialMate on behalf of a business or organization, you represent that you have authority to bind that entity to these terms.',
                'You must be at least 13 years old to use SocialMate. If you are under 18, you must have parental or guardian consent.',
              ]
            },
            {
              title: '2. Your Account',
              content: [
                'You are responsible for maintaining the security of your account and password. SocialMate cannot and will not be liable for any loss from your failure to secure your account.',
                'You must provide accurate and complete information when creating your account.',
                'You may not share your account credentials with others or create accounts for the purpose of abusing SocialMate\'s free tier.',
                'You are responsible for all activity that occurs under your account.',
              ]
            },
            {
              title: '3. Acceptable Use',
              content: [
                'You may not use SocialMate to post, schedule, or distribute content that is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable.',
                'You may not use SocialMate to send spam, conduct phishing attacks, or distribute malware.',
                'You may not attempt to reverse engineer, scrape, or extract data from SocialMate beyond normal use.',
                'You may not use SocialMate to violate the terms of service of connected social media platforms.',
                'You may not create multiple accounts to circumvent account limits or bans.',
              ]
            },
            {
              title: '4. Your Content',
              content: [
                'You retain full ownership of all content you create and post through SocialMate.',
                'By using SocialMate, you grant us a limited license to store, process, and transmit your content solely for the purpose of providing the service.',
                'We do not claim any intellectual property rights over your content.',
                'We do not use your content to train AI models or for any purpose other than operating the service.',
                'You are solely responsible for ensuring your content complies with applicable laws and the terms of the social platforms you post to.',
              ]
            },
            {
              title: '5. Free Plan & Pro Subscription',
              content: [
                'The free plan is provided as-is with no guarantee of continued availability of any specific features.',
                'Pro subscriptions are billed in advance on a monthly or annual basis and are non-refundable except within the 7-day refund window.',
                'We reserve the right to modify free plan features at any time with reasonable notice.',
                'Refunds for Pro subscriptions are available within 7 days of purchase, no questions asked. After 7 days, no refunds are provided.',
                'Cancelling a Pro subscription will downgrade your account to the free plan at the end of the current billing period.',
              ]
            },
            {
              title: '6. Service Availability',
              content: [
                'We strive for 99.9% uptime but do not guarantee uninterrupted availability of SocialMate.',
                'We may temporarily suspend service for maintenance, updates, or security purposes.',
                'We are not liable for any damages resulting from service interruptions.',
                'Scheduled maintenance will be communicated in advance whenever possible.',
              ]
            },
            {
              title: '7. Termination',
              content: [
                'You may delete your account at any time from Settings → Danger Zone. Deletion is immediate and permanent.',
                'We may suspend or terminate accounts that violate these terms, with or without notice depending on severity.',
                'Upon termination, your data will be deleted according to our Privacy Policy.',
                'Provisions that by their nature should survive termination (content ownership, limitation of liability) will survive.',
              ]
            },
            {
              title: '8. Limitation of Liability',
              content: [
                'SocialMate is provided "as is" without warranties of any kind, express or implied.',
                'We are not liable for any indirect, incidental, special, consequential, or punitive damages.',
                'Our total liability for any claims is limited to the amount you paid us in the 12 months preceding the claim.',
                'We are not responsible for the actions of connected social media platforms or any content published through them.',
              ]
            },
            {
              title: '9. Changes to Terms',
              content: [
                'We may update these terms from time to time. We will notify you of material changes via email at least 14 days before they take effect.',
                'Continued use of SocialMate after changes take effect constitutes acceptance of the updated terms.',
                'If you disagree with updated terms, you may delete your account before the changes take effect.',
              ]
            },
            {
              title: '10. Governing Law',
              content: [
                'These terms are governed by the laws of the State of Delaware, United States, without regard to conflict of law principles.',
                'Any disputes arising from these terms will be resolved through binding arbitration rather than court proceedings, except for small claims.',
                'You waive any right to participate in class action lawsuits against SocialMate.',
              ]
            },
            {
              title: '11. Contact',
              content: [
                'For questions about these terms, contact us at: legal@socialmate.app',
                'We aim to respond to all legal inquiries within 5 business days.',
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
          <p className="text-sm text-gray-500 mb-3">Questions about our terms?</p>
          <a href="mailto:legal@socialmate.app" className="text-sm font-bold text-black hover:underline">
            legal@socialmate.app →
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
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-black transition-colors font-semibold text-black">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}