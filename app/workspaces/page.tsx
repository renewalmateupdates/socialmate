'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

export type Plan = 'free' | 'pro' | 'agency'

export const PLAN_CONFIG: Record<Plan, {
  label: string
  credits: number
  seats: number
  accounts: number
  maxPosts: number
}> = {
  free: {
    label: 'Free',
    credits: 100,
    seats: 1,
    accounts: 1,
    maxPosts: 10,
  },
  pro: {
    label: 'Pro',
    credits: 300,
    seats: 5,
    accounts: 5,
    maxPosts: 100,
  },
  agency: {
    label: 'Agency',
    credits: 1000,
    seats: 20,
    accounts: 10,
    maxPosts: -1, // unlimited
  },
}

type WorkspaceContextType = {
  plan: Plan
  setPlan: (plan: Plan) => void
  credits: number
  setCredits: (credits: number) => void
  workspaceName: string
  setWorkspaceName: (name: string) => void
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  plan: 'free',
  setPlan: () => {},
  credits: 100,
  setCredits: () => {},
  workspaceName: 'My Workspace',
  setWorkspaceName: () => {},
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<Plan>('free')
  const [credits, setCredits] = useState(100)
  const [workspaceName, setWorkspaceName] = useState('My Workspace')

  useEffect(() => {
    const loadWorkspace = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('workspaces')
        .select('plan, credits, name')
        .eq('owner_id', user.id)
        .single()

      if (data) {
        setPlan((data.plan as Plan) || 'free')
        setCredits(data.credits ?? PLAN_CONFIG[data.plan as Plan]?.credits ?? 100)
        setWorkspaceName(data.name || 'My Workspace')
      }
    }
    loadWorkspace()
  }, [])

  return (
    <WorkspaceContext.Provider value={{ plan, setPlan, credits, setCredits, workspaceName, setWorkspaceName }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}