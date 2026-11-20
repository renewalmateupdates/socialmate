import AppPageSkeleton from '@/components/AppPageSkeleton'

// Shown while moving to this page inside the app: the same title-and-skeleton
// the page itself sends first (components/AppPageSkeleton.tsx). The old one was
// gray boxes with a desktop sidebar strip, even on phones.
export default function Loading() {
  return <AppPageSkeleton title="Compose" />
}
