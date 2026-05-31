export default function OnboardingLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.png" alt="SocialMate" className="w-12 h-12 rounded-2xl opacity-80" />
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
      </div>
    </div>
  )
}
