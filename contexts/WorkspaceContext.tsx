'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

export type Plan = 'free' | 'pro' | 'agency'

export const PLATFORMS_TOTAL = 16

export const PLAN_CONFIG: Record<Plan, {
  label: string
  credits: number
  creditBank: number
  seats: number
  accountsPerPlatform: number
  maxPosts: number
  scheduleWeeks: number
  clientWorkspaces: number
}> = {
  free: {
    label: 'Free',
    credits: 50,
    creditBank: 75,
    seats: 2,
    accountsPerPlatform: 1,
    maxPosts: 100,
    scheduleWeeks: 2,
    clientWorkspaces: 0,
  },
  pro: {
    label: 'Pro',
    credits: 500,
    creditBank: 750,
    seats: 5,
    accountsPerPlatform: 5,
    maxPosts: 1000,
    scheduleWeeks: 4,
    clientWorkspaces: 1,
  },
  agency: {
    label: 'Agency',
    credits: 2000,
    creditBank: 3000,
    seats: 15,
    accountsPerPlatform: 10,
    maxPosts: 5000,
    scheduleWeeks: 12,
    clientWorkspaces: 5,
  },
}

export type Workspace = {
  id: string
  name: string
  is_personal: boolean
  client_name?: string
  owner_id: string
}

type WorkspaceContextType = {
  plan: Plan
  setPlan: (plan: Plan) => void
  credits: number
  setCredits: (credits: number) => void
  creditsUsed: number
  creditsTotal: number
  workspaceName: string
  setWorkspaceName: (name: string) => void
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  activeWorkspaceId: string | null
  setActiveWorkspace: (ws: Workspace) => void
  seatsUsed: number
  seatsTotal: number
  platformsConnected: number
  loading: boolean
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  plan: 'free',
  setPlan: () => {},
  credits: 50,
  setCredits: () => {},
  creditsUsed: 0,
  creditsTotal: 75,
  workspaceName: 'My Workspace',
  setWorkspaceName: () => {},
  workspaces: [],
  activeWorkspace: null,
  activeWorkspaceId: null,
  setActiveWorkspace: () => {},
  seatsUsed: 1,
  seatsTotal: 2,
  platformsConnected: 0,
  loading: true,
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan]                     = useState<Plan>('free')
  const [credits, setCreditsState]          = useState(50)
  const [creditsUsed, setCreditsUsed]       = useState(0)
  const [userId, setUserId]                 = useState<string | null>(null)
  const [workspaceName, setWorkspaceName]   = useState('My Workspace')
  const [workspaces, setWorkspaces]         = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [seatsUsed, setSeatsUsed]           = useState(1)
  const [platformsConnected, setPlatformsConnected] = useState(0)
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      setUserId(user.id)

      const { data: ws } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)

      if (ws && ws.length > 0) {
        setWorkspaces(ws)
        const personal = ws.find((w: Workspace) => w.is_personal) || ws[0]
        setActiveWorkspace(personal)
        setWorkspaceName(personal.name || 'My Workspace')
      } else {
        // No workspaces found (RLS may be blocking). Use a placeholder with
        // NO id so the API routes know not to pass a workspace_id.
        const fallback: Workspace = {
          id: '',           // empty string signals "no real workspace yet"
          name: 'My Workspace',
          is_personal: true,
          owner_id: user.id,
        }
        setWorkspaces([fallback])
        setActiveWorkspace(fallback)
      }

      const { data: settings } = await supabase
        .from('user_settings')
        .select('plan, ai_credits_remaining, ai_credits_used, ai_credits_total')
        .eq('user_id', user.id)
        .single()

      if (settings) {
        const p = (settings.plan as Plan) || 'free'
        setPlan(p)
        setCreditsState(settings.ai_credits_remaining ?? PLAN_CONFIG[p].credits)
        setCreditsUsed(settings.ai_credits_used ?? 0)
      }

      const { data: teamData } = await supabase
        .from('team_members')
        .select('id')
        .eq('owner_id', user.id)

      setSeatsUsed((teamData?.length || 0) + 1)

      const { data: accountsData } = await supabase
        .from('connected_accounts')
        .select('platform')
        .eq('user_id', user.id)

      const uniquePlatforms = new Set(accountsData?.map((a: any) => a.platform) || [])
      setPlatformsConnected(uniquePlatforms.size)

      setLoading(false)
    }

    load()
  }, [])

  const setCredits = useCallback(async (newCredits: number) => {
    setCreditsState(newCredits)
    if (!userId) return
    await supabase
      .from('user_settings')
      .update({ ai_credits_remaining: newCredits })
      .eq('user_id', userId)
  }, [userId])

  const planConfig = PLAN_CONFIG[plan]

  return (
    <WorkspaceContext.Provider value={{
      plan, setPlan,
      credits, setCredits,
      creditsUsed,
      creditsTotal: planConfig.creditBank,
      workspaceName, setWorkspaceName,
      workspaces,
      activeWorkspace,
      activeWorkspaceId: activeWorkspace?.id ?? null,
      setActiveWorkspace,
      seatsUsed,
      seatsTotal: planConfig.seats,
      platformsConnected,
      loading,
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}