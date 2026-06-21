'use client'
import dynamic from 'next/dynamic'

const UserStatsCounter = dynamic(() => import('@/components/UserStatsCounter'), { ssr: false })

export default function LazyUserStatsCounter() {
  return <UserStatsCounter />
}
