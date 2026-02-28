import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <nav className="sticky top-0 bg-white/90 backdrop-blur border-b border-[#e4e4e0] z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <Link href="/signup" className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition-all">
            Get Started Free
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="text-8xl font-extrabold tracking-tight text-gray-100 mb-4">404</div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-3">Page not found</h1>
        <p className="text-gray-500 max-w-md mb-10">
          Looks like this page got lost in the feed. Let us get you back on track.
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link href="/" className="bg-black text-white font-semibold px-6 py-3 rounded-xl hover:opacity-80 transition-all text-sm">
            Back to Home
          </Link>
          <Link href="/dashboard" className="border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl hover:border-gray-400 transition-all text-sm">
            Go to Dashboard
          </Link>
        </div>
      </div>

      <footer className="border-t border-[#e4e4e0]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
            <span className="font-bold text-base tracking-tight">SocialMate</span>
          </Link>
          <div className="flex items-center gap-6">
            <a href="/blog" className="text-sm text-gray-400 hover:text-black transition-colors">Blog</a>
            <a href="/privacy" className="text-sm text-gray-400 hover:text-black transition-colors">Privacy</a>
            <a href="/terms" className="text-sm text-gray-400 hover:text-black transition-colors">Terms</a>
          </div>
          <div className="text-sm text-gray-400">2026 SocialMate. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}