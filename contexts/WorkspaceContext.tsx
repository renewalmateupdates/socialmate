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
  monthlyCredits: number
  earnedCredits: number
  paidCredits: number
  workspaceName: string
  setWorkspaceName: (name: string) => void
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  activeWorkspaceId: string | null
  setActiveWorkspace: (ws: Workspace) => void
  refreshWorkspaces: () => Promise<void>
  refreshCredits: () => Promise<void>
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
  monthlyCredits: 50,
  earnedCredits: 0,
  paidCredits: 0,
  workspaceName: 'My Workspace',
  setWorkspaceName: () => {},
  workspaces: [],
  activeWorkspace: null,
  activeWorkspaceId: null,
  setActiveWorkspace: () => {},
  refreshWorkspaces: async () => {},
  refreshCredits: async () => {},
  seatsUsed: 1,
  seatsTotal: 2,
  platformsConnected: 0,
  loading: true,
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan]                     = useState<Plan>('free')
  const [credits, setCreditsState]          = useState(50)
  const [creditsUsed, setCreditsUsed]       = useState(0)
  const [monthlyCredits, setMonthlyCredits] = useState(50)
  const [earnedCredits, setEarnedCredits]   = useState(0)
  const [paidCredits, setPaidCredits]       = useState(0)
  const [userId, setUserId]                 = useState<string | null>(null)
  const [workspaceName, setWorkspaceName]   = useState('My Workspace')
  const [workspaces, setWorkspaces]         = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null)
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
        // Check if there's a saved workspace preference from the cookie
        const cookieWorkspaceId = document.cookie
          .split('; ')
          .find(c => c.startsWith('active_workspace_id='))
          ?.split('=')[1]

        const savedWorkspace = cookieWorkspaceId
          ? ws.find((w: Workspace) => w.id === cookieWorkspaceId)
          : null

        const initial = savedWorkspace || ws.find((w: Workspace) => w.is_personal) || ws[0]
        setActiveWorkspaceState(initial)
        setWorkspaceName(initial.name || 'My Workspace')
        // Always keep cookie in sync
        if (initial.id && initial.id !== 'personal') {
          document.cookie = `active_workspace_id=${initial.id}; path=/; max-age=86400`
        }
      } else {
        // No workspaces visible (RLS may be blocking anon client).
        // Use a placeholder — the API routes look up the real workspace
        // via the service-role admin client, so this is safe.
        const fallback: Workspace = {
          id: 'personal',   // sentinel value — never a real UUID, routes will ignore it
          name: 'My Workspace',
          is_personal: true,
          owner_id: user.id,
        }
        setWorkspaces([fallback])
        setActiveWorkspaceState(fallback)
      }

      const { data: settings } = await supabase
        .from('user_settings')
        .select('plan, ai_credits_remaining, ai_credits_used, ai_credits_total, monthly_credits_remaining, earned_credits, paid_credits')
        .eq('user_id', user.id)
        .single()

      if (settings) {
        const p = (settings.plan as Plan) || 'free'
        setPlan(p)
        const monthly = settings.monthly_credits_remaining ?? settings.ai_credits_remaining ?? PLAN_CONFIG[p].credits
        const earned  = settings.earned_credits ?? 0
        const paid    = settings.paid_credits ?? 0
        setMonthlyCredits(monthly)
        setEarnedCredits(earned)
        setPaidCredits(paid)
        setCreditsState(monthly + earned + paid)
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

  const setActiveWorkspace = useCallback((ws: Workspace) => {
    setActiveWorkspaceState(ws)
    // Persist to cookie so server components / API routes can read it
    if (ws.id && ws.id !== 'personal') {
      document.cookie = `active_workspace_id=${ws.id}; path=/; max-age=86400`
    }
  }, [])

  const setCredits = useCallback((newCredits: number) => {
    setCreditsState(newCredits)
  }, [])

  const refreshWorkspaces = useCallback(async () => {
    if (!userId) return
    const { data: ws } = await supabase
      .from('workspaces')
      .select('*')
      .eq('owner_id', userId)
    if (ws && ws.length > 0) {
      setWorkspaces(ws)
      // Update active workspace data if it changed
      setActiveWorkspaceState(prev => {
        if (!prev) return prev
        const updated = ws.find((w: Workspace) => w.id === prev.id)
        return updated || prev
      })
    }
  }, [userId])

  const refreshCredits = useCallback(async () => {
    if (!userId) return
    const { data: settings } = await supabase
      .from('user_settings')
      .select('plan, ai_credits_remaining, monthly_credits_remaining, earned_credits, paid_credits')
      .eq('user_id', userId)
      .single()
    if (settings) {
      const p = (settings.plan as Plan) || 'free'
      setPlan(p)
      const monthly = settings.monthly_credits_remaining ?? settings.ai_credits_remaining ?? PLAN_CONFIG[p].credits
      const earned  = settings.earned_credits ?? 0
      const paid    = settings.paid_credits ?? 0
      setMonthlyCredits(monthly)
      setEarnedCredits(earned)
      setPaidCredits(paid)
      setCreditsState(monthly + earned + paid)
    }
  }, [userId])

  const planConfig = PLAN_CONFIG[plan]

  return (
    <WorkspaceContext.Provider value={{
      plan, setPlan,
      credits, setCredits,
      creditsUsed,
      creditsTotal: planConfig.creditBank,
      monthlyCredits,
      earnedCredits,
      paidCredits,
      workspaceName, setWorkspaceName,
      workspaces,
      activeWorkspace,
      activeWorkspaceId: activeWorkspace?.id ?? null,
      setActiveWorkspace,
      refreshWorkspaces,
      refreshCredits,
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