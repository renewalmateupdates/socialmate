import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-gray-100 px-8 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white text-sm font-bold">S</div>
          <span className="font-bold text-base tracking-tight">SocialMate</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-8xl mb-6">404</div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3">Page not found</h1>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard" className="bg-black text-white text-sm font-bold px-6 py-3 rounded-xl hover:opacity-80 transition-all">
              Go to Dashboard →
            </Link>
            <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors px-4 py-3">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}