import LoginSkeleton from './LoginSkeleton'

// Route-transition skeleton — the last high-traffic page without one
// (the loading.tsx sweeps in PRs #459/#466 covered dashboard, onboarding,
// accounts, blog, features, settings, and signup, but never /login).
export default function LoginLoading() {
  return <LoginSkeleton />
}
