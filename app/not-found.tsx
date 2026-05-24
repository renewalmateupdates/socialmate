import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="dark min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <img src="/logo.png" alt="SocialMate" className="w-14 h-14 rounded-2xl mx-auto mb-8" />
        <p className="text-7xl font-black text-amber-400 mb-4">404</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-3">You took a wrong turn.</h1>
        <p className="text-sm text-gray-400 leading-relaxed mb-10">
          This page doesn&apos;t exist — but the rest of the product does.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/"
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold px-6 py-3 rounded-xl transition-all text-center">
            Go home →
          </Link>
          <Link href="/dashboard"
            className="w-full sm:w-auto border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all text-center bg-gray-900">
            Open the app →
          </Link>
        </div>
      </div>
    </div>
  )
}
